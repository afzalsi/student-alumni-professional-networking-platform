const User = require('../models/User');
const AlumniProfile = require('../models/AlumniProfile');
const MentorshipRequest = require('../models/MentorshipRequest');
const Mentorship = require('../models/Mentorship');
const MentorshipSession = require('../models/MentorshipSession');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { getPagination } = require('../utils/pagination');
const { calculateMentorMatch } = require('../services/recommendationService');
const StudentProfile = require('../models/StudentProfile');

// @desc    Get alumni mentor directory with multi-filters and pagination
// @route   GET /api/alumni
// @access  Public / Authenticated
const getAlumniDirectory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      industry,
      company,
      role: jobRole,
      skills,
      location,
      graduationYear,
      mentorAvailable
    } = req.query;

    let userQuery = { role: 'alumni', isActive: true };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userQuery.$or = [
        { name: searchRegex },
        { department: searchRegex },
        { skills: searchRegex },
        { bio: searchRegex },
        { location: searchRegex }
      ];
    }

    if (skills) {
      const skillList = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
      userQuery.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }

    if (location) {
      userQuery.location = new RegExp(location, 'i');
    }

    if (graduationYear) {
      userQuery.graduationYear = parseInt(graduationYear, 10);
    }

    // Filter by AlumniProfile criteria
    let profileQuery = {};
    if (industry) profileQuery.industry = new RegExp(industry, 'i');
    if (company) profileQuery.company = new RegExp(company, 'i');
    if (jobRole) profileQuery.jobTitle = new RegExp(jobRole, 'i');
    if (mentorAvailable !== undefined) profileQuery.mentorAvailable = mentorAvailable === 'true';

    // Find profile matches
    const matchingProfiles = await AlumniProfile.find(profileQuery);
    const matchingUserIds = matchingProfiles.map((p) => p.userId);

    userQuery._id = { $in: matchingUserIds };

    const total = await User.countDocuments(userQuery);
    const pagination = getPagination(page, limit, total);

    const users = await User.find(userQuery)
      .select('-password')
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ isVerified: -1, createdAt: -1 });

    const userProfileMap = new Map();
    matchingProfiles.forEach((p) => userProfileMap.set(p.userId.toString(), p));

    // If student is logged in, attach match scores
    let student = null;
    let studentProfile = null;
    if (req.user && req.user.role === 'student') {
      student = await User.findById(req.user._id);
      studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    }

    const results = users.map((u) => {
      const profile = userProfileMap.get(u._id.toString()) || null;
      let matchScore = null;
      let matchReasons = [];

      if (student && profile) {
        const match = calculateMentorMatch(student, studentProfile, u, profile);
        matchScore = match.score;
        matchReasons = match.reasons;
      }

      return {
        user: u,
        profile,
        matchScore,
        matchReasons
      };
    });

    res.json({
      success: true,
      data: results,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get alumni mentor details by ID
// @route   GET /api/alumni/:id
// @access  Public / Authenticated
const getAlumniById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'alumni' }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Alumni not found' });
    }

    const profile = await AlumniProfile.findOne({ userId: user._id });

    // Match calculation for logged-in students
    let matchScore = null;
    let matchReasons = [];
    if (req.user && req.user.role === 'student') {
      const student = await User.findById(req.user._id);
      const sProfile = await StudentProfile.findOne({ userId: req.user._id });
      const match = calculateMentorMatch(student, sProfile, user, profile);
      matchScore = match.score;
      matchReasons = match.reasons;
    }

    res.json({
      success: true,
      data: {
        user,
        profile,
        matchScore,
        matchReasons
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Alumni dashboard metrics
// @route   GET /api/alumni/dashboard
// @access  Private (Alumni)
const getAlumniDashboard = async (req, res, next) => {
  try {
    const alumniId = req.user._id;

    // 1. Pending Mentorship requests
    const pendingRequests = await MentorshipRequest.find({
      alumniId,
      status: 'PENDING'
    }).populate('studentId', 'name email avatar department graduationYear skills');

    // 2. Active mentees
    const activeMentorships = await Mentorship.find({
      alumniId,
      status: 'ACTIVE'
    }).populate('studentId', 'name email avatar department graduationYear skills careerGoals');

    // 3. Upcoming sessions
    const upcomingSessions = await MentorshipSession.find({
      mentorId: alumniId,
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: { $in: ['REQUESTED', 'CONFIRMED'] }
    })
      .populate('menteeId', 'name avatar department')
      .sort({ date: 1, startTime: 1 })
      .limit(5);

    // 4. Jobs posted by this alumni & applicant metrics
    const postedJobs = await Job.find({ postedBy: alumniId }).sort({ createdAt: -1 });
    const jobIds = postedJobs.map((j) => j._id);
    const totalApplicants = await JobApplication.countDocuments({ jobId: { $in: jobIds } });

    res.json({
      success: true,
      data: {
        stats: {
          pendingRequestsCount: pendingRequests.length,
          activeMenteesCount: activeMentorships.length,
          upcomingSessionsCount: upcomingSessions.length,
          postedJobsCount: postedJobs.length,
          totalApplicantsCount: totalApplicants
        },
        pendingRequests,
        activeMentorships,
        upcomingSessions,
        postedJobs: postedJobs.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlumniDirectory,
  getAlumniById,
  getAlumniDashboard
};
