const Report = require('../models/Report');
const { getPagination } = require('../utils/pagination');
const { logAction } = require('../services/auditService');

// @desc    Submit a moderation report
// @route   POST /api/reports
// @access  Private
const submitReport = async (req, res, next) => {
  try {
    const { reportedUserId, reportedEntityId, entityType, reason } = req.body;

    const report = await Report.create({
      reporterId: req.user._id,
      reportedUserId,
      reportedEntityId,
      entityType: entityType || 'User',
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Administrators will review it promptly.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let query = {};
    if (status) query.status = status;

    const total = await Report.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const reports = await Report.find(query)
      .populate('reporterId', 'name email role')
      .populate('reportedUserId', 'name email role isActive')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.json({
      success: true,
      data: reports,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or dismiss a report
// @route   PUT /api/reports/:id/resolve
// @access  Private (Admin)
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body; // 'RESOLVED' or 'DISMISSED'

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedBy = req.user._id;
    await report.save();

    await logAction({
      actorId: req.user._id,
      action: `REPORT_${status}`,
      entityType: 'Report',
      entityId: report._id,
      metadata: { resolutionNotes },
      req
    });

    res.json({
      success: true,
      message: `Report marked as ${status}`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReport,
  getReports,
  resolveReport
};
