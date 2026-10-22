const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Mentorship = require('../models/Mentorship');
const MentorshipRequest = require('../models/MentorshipRequest');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const { getPagination } = require('../utils/pagination');
const { logAction } = require('../services/auditService');
const { sendNotification } = require('../services/notificationService');

// @desc    Get full administrative dashboard analytics and metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. User metrics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAlumni = await User.countDocuments({ role: 'alumni' });
    const verifiedAlumni = await User.countDocuments({ role: 'alumni', isVerified: true });
    const activeMentors = await AlumniProfile.countDocuments({ mentorAvailable: true });

    // 2. Job & Placement metrics
    const totalJobs = await Job.countDocuments({ type: { $ne: 'internship' } });
    const totalInternships = await Job.countDocuments({ type: 'internship' });
    const pendingJobs = await Job.countDocuments({ status: 'PENDING' });
    const totalApplications = await JobApplication.countDocuments();
    const successfulPlacements = await JobApplication.countDocuments({ status: 'SELECTED' });

    // 3. Mentorship metrics
    const totalMentorships = await Mentorship.countDocuments();
    const activeMentorships = await Mentorship.countDocuments({ status: 'ACTIVE' });
    const completedMentorships = await Mentorship.countDocuments({ status: 'COMPLETED' });
    const pendingMentorshipRequests = await MentorshipRequest.countDocuments({ status: 'PENDING' });

    // 4. Events & Reports
    const totalEvents = await Event.countDocuments();
    const totalEventRegistrations = await EventRegistration.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });

    // 5. Applications Status Distribution
    const applicationStatusStats = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 6. Monthly Registrations (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          students: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          },
          alumni: {
            $sum: { $cond: [{ $eq: ['$role', 'alumni'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 7. Recent pending items
    const recentPendingJobs = await Job.find({ status: 'PENDING' })
      .populate('postedBy', 'name email company')
      .limit(5);

    const recentPendingAlumni = await User.find({ role: 'alumni', isVerified: false })
      .select('-password')
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalAlumni,
          verifiedAlumni,
          activeMentors,
          totalJobs,
          totalInternships,
          pendingJobs,
          totalApplications,
          successfulPlacements,
          totalMentorships,
          activeMentorships,
          completedMentorships,
          pendingMentorshipRequests,
          totalEvents,
          totalEventRegistrations,
          pendingReports
        },
        applicationStatusStats,
        monthlyRegistrations,
        recentPendingJobs,
        recentPendingAlumni
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, role filter, verification filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, isVerified, isActive } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { department: regex }];
    }

    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await User.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.json({
      success: true,
      data: users,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active / Deactivated)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAction({
      actorId: req.user._id,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entityType: 'User',
      entityId: user._id,
      metadata: { email: user.email, role: user.role, isActive: user.isActive },
      req
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify alumni badge
// @route   PUT /api/admin/alumni/:id/verify
// @access  Private (Admin)
const verifyAlumni = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await User.findOne({ _id: id, role: 'alumni' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Alumni user not found' });
    }

    user.isVerified = isVerified !== undefined ? isVerified : true;
    await user.save();

    await logAction({
      actorId: req.user._id,
      action: user.isVerified ? 'VERIFY_ALUMNI' : 'UNVERIFY_ALUMNI',
      entityType: 'User',
      entityId: user._id,
      metadata: { email: user.email, isVerified: user.isVerified },
      req
    });

    if (user.isVerified) {
      await sendNotification({
        recipientId: user._id,
        type: 'ADMIN_ALERT',
        title: 'Alumni Profile Verified! 🎓',
        message: 'Congratulations! Your alumni profile has been officially verified by the administration.',
        link: '/profile'
      });
    }

    res.json({
      success: true,
      message: `Alumni verification status updated to ${user.isVerified}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for moderation
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAdminJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { company: regex }];
    }

    const total = await Job.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.json({
      success: true,
      data: jobs,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a job post
// @route   PUT /api/admin/jobs/:id/approve
// @access  Private (Admin)
const updateJobApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'REJECTED'

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.status = status;
    await job.save();

    await logAction({
      actorId: req.user._id,
      action: `JOB_${status}`,
      entityType: 'Job',
      entityId: job._id,
      metadata: { title: job.title, company: job.company },
      req
    });

    await sendNotification({
      recipientId: job.postedBy,
      type: 'ADMIN_ALERT',
      title: `Job Posting ${status === 'ACTIVE' ? 'Approved' : 'Rejected'}`,
      message: `Your job posting for "${job.title}" has been ${status.toLowerCase()} by an administrator.`,
      relatedEntityId: job._id,
      relatedEntityType: 'Job',
      link: '/alumni/jobs'
    });

    res.json({
      success: true,
      message: `Job has been marked as ${status}`,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await AuditLog.countDocuments();
    const pagination = getPagination(page, limit, total);

    const logs = await AuditLog.find()
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.json({
      success: true,
      data: logs,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  toggleUserStatus,
  verifyAlumni,
  getAdminJobs,
  updateJobApproval,
  getAuditLogs
};
