const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const config = require('../config/env');
const { JOB_STATUS } = require('../utils/constants');
const { getPagination } = require('../utils/pagination');
const { calculateJobMatch } = require('../services/recommendationService');

// @desc    Create a new job/internship post
// @route   POST /api/jobs
// @access  Private (Alumni, Admin)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      description,
      type,
      category,
      location,
      workMode,
      salaryRange,
      experienceLevel,
      skills,
      deadline,
      applicationUrl
    } = req.body;

    const isAdmin = req.user.role === 'admin';
    const status = isAdmin || config.autoApproveJobs ? JOB_STATUS.ACTIVE : JOB_STATUS.PENDING;

    const job = await Job.create({
      title,
      company,
      description,
      type,
      category,
      location,
      workMode,
      salaryRange,
      experienceLevel,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      deadline: deadline ? new Date(deadline) : null,
      applicationUrl,
      postedBy: req.user._id,
      status
    });

    res.status(201).json({
      success: true,
      message: status === JOB_STATUS.ACTIVE
        ? 'Job posted and published successfully!'
        : 'Job submitted successfully! It is pending admin approval.',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active jobs with search, filtering, and pagination
// @route   GET /api/jobs
// @access  Public / Authenticated
const getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      category,
      location,
      workMode,
      experienceLevel,
      skills,
      status
    } = req.query;

    let query = {};

    // Only Admin or the job poster can view non-active jobs
    if (status && req.user && (req.user.role === 'admin' || req.query.myJobs === 'true')) {
      query.status = status;
    } else {
      query.status = JOB_STATUS.ACTIVE;
    }

    if (req.query.myJobs === 'true' && req.user) {
      query.postedBy = req.user._id;
      delete query.status; // allow viewing all own jobs
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { skills: searchRegex }
      ];
    }

    if (type) query.type = type;
    if (category) query.category = new RegExp(category, 'i');
    if (location) query.location = new RegExp(location, 'i');
    if (workMode) query.workMode = workMode;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    if (skills) {
      const skillList = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }

    const total = await Job.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    // If student is logged in, attach match scores & saved status
    let student = null;
    let studentProfile = null;
    let savedJobIds = new Set();

    if (req.user && req.user.role === 'student') {
      student = await User.findById(req.user._id);
      studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      const saved = await SavedJob.find({ studentId: req.user._id });
      savedJobIds = new Set(saved.map((s) => s.jobId.toString()));
    }

    const enrichedJobs = jobs.map((job) => {
      let matchScore = null;
      let matchReasons = [];

      if (student) {
        const match = calculateJobMatch(student, studentProfile, job);
        matchScore = match.score;
        matchReasons = match.reasons;
      }

      return {
        ...job.toObject(),
        isSaved: savedJobIds.has(job._id.toString()),
        matchScore,
        matchReasons
      };
    });

    res.json({
      success: true,
      data: enrichedJobs,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public / Authenticated
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email avatar department');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let matchScore = null;
    let matchReasons = [];
    let isSaved = false;

    if (req.user && req.user.role === 'student') {
      const student = await User.findById(req.user._id);
      const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
      const match = calculateJobMatch(student, studentProfile, job);
      matchScore = match.score;
      matchReasons = match.reasons;

      const saved = await SavedJob.findOne({ studentId: req.user._id, jobId: job._id });
      isSaved = Boolean(saved);
    }

    res.json({
      success: true,
      data: {
        ...job.toObject(),
        isSaved,
        matchScore,
        matchReasons
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job post
// @route   PUT /api/jobs/:id
// @access  Private (Owner, Admin)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this job' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job post
// @route   DELETE /api/jobs/:id
// @access  Private (Owner, Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this job' });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save / Bookmark a job
// @route   POST /api/jobs/:id/save
// @access  Private (Student)
const toggleSaveJob = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const jobId = req.params.id;

    const existing = await SavedJob.findOne({ studentId, jobId });
    if (existing) {
      await existing.deleteOne();
      return res.json({
        success: true,
        message: 'Job removed from saved jobs',
        isSaved: false
      });
    } else {
      await SavedJob.create({ studentId, jobId });
      return res.json({
        success: true,
        message: 'Job saved successfully!',
        isSaved: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved jobs
// @route   GET /api/jobs/saved/list
// @access  Private (Student)
const getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ studentId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'postedBy', select: 'name email avatar' }
      })
      .sort({ createdAt: -1 });

    const jobs = saved.map((s) => ({ ...s.jobId.toObject(), isSaved: true }));

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleSaveJob,
  getSavedJobs
};
