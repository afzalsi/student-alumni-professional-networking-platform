const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const User = require('../models/User');
const { NOTIFICATION_TYPE, APPLICATION_STATUS } = require('../utils/constants');
const { sendNotification } = require('../services/notificationService');

// @desc    Apply for a job
// @route   POST /api/jobs/:jobId/apply
// @access  Private (Student)
const applyForJob = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { jobId } = req.params;
    const { resumeUrl, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'This job posting is no longer active' });
    }

    // Check duplicate application
    const existing = await JobApplication.findOne({ jobId, studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position'
      });
    }

    const application = await JobApplication.create({
      jobId,
      studentId,
      resumeUrl,
      coverLetter: coverLetter || '',
      status: APPLICATION_STATUS.APPLIED
    });

    // Increment applicant count on job
    job.applicantCount = (job.applicantCount || 0) + 1;
    await job.save();

    // Notify Job poster
    await sendNotification({
      recipientId: job.postedBy,
      type: NOTIFICATION_TYPE.JOB_STATUS_CHANGE,
      title: 'New Candidate Applied',
      message: `${req.user.name} applied for "${job.title}" at ${job.company}`,
      relatedEntityId: application._id,
      relatedEntityType: 'JobApplication',
      link: `/alumni/jobs/${job._id}/applicants`
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's submitted job applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ studentId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job post (Alumni / Admin)
// @route   GET /api/jobs/:jobId/applications
// @access  Private (Owner, Admin)
const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view applicants for this job' });
    }

    const applications = await JobApplication.find({ jobId })
      .populate('studentId', 'name email avatar department graduationYear skills location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        job,
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Review, Shortlist, Interview, Select, Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter / Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, interviewDetails, feedback } = req.body;

    const application = await JobApplication.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const isPoster = application.jobId.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPoster && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this application status' });
    }

    if (status) application.status = status;
    if (interviewDetails) application.interviewDetails = interviewDetails;
    if (feedback) application.feedback = feedback;

    await application.save();

    // Notify the student applicant
    await sendNotification({
      recipientId: application.studentId,
      type: NOTIFICATION_TYPE.JOB_STATUS_CHANGE,
      title: `Application Status Updated: ${status}`,
      message: `Your application for "${application.jobId.title}" is now ${status}.`,
      relatedEntityId: application._id,
      relatedEntityType: 'JobApplication',
      link: '/student/applications'
    });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus
};
