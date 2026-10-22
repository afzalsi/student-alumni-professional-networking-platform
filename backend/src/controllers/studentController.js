const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const JobApplication = require('../models/JobApplication');
const SavedJob = require('../models/SavedJob');
const Mentorship = require('../models/Mentorship');
const MentorshipSession = require('../models/MentorshipSession');
const Job = require('../models/Job');
const { calculateJobMatch, calculateMentorMatch } = require('../services/recommendationService');
const AlumniProfile = require('../models/AlumniProfile');

// @desc    Get student dashboard metrics & recommendations
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId);
    const profile = await StudentProfile.findOne({ userId: studentId });

    // 1. Mentorship statistics
    const activeMentorships = await Mentorship.find({ studentId, status: 'ACTIVE' })
      .populate('alumniId', 'name email avatar department graduationYear')
      .populate('requestId', 'topic goal');

    // 2. Upcoming sessions
    const upcomingSessions = await MentorshipSession.find({
      menteeId: studentId,
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: { $in: ['REQUESTED', 'CONFIRMED'] }
    })
      .populate('mentorId', 'name avatar department')
      .sort({ date: 1, startTime: 1 })
      .limit(5);

    // 3. Applications statistics
    const totalApplications = await JobApplication.countDocuments({ studentId });
    const activeApplications = await JobApplication.find({ studentId })
      .populate('jobId', 'title company location type salaryRange')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Saved jobs count
    const savedJobsCount = await SavedJob.countDocuments({ studentId });

    // 5. Intelligent Recommended Jobs
    const allActiveJobs = await Job.find({ status: 'ACTIVE' }).limit(30);
    const recommendedJobs = allActiveJobs
      .map((job) => {
        const match = calculateJobMatch(student, profile, job);
        return {
          ...job.toObject(),
          matchScore: match.score,
          matchReasons: match.reasons
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // 6. Intelligent Recommended Mentors
    const allAlumniUsers = await User.find({ role: 'alumni', isActive: true });
    const alumniProfiles = await AlumniProfile.find({
      userId: { $in: allAlumniUsers.map((a) => a._id) },
      mentorAvailable: true
    });

    const recommendedMentors = [];
    for (const alumni of allAlumniUsers) {
      const aProfile = alumniProfiles.find((p) => p.userId.toString() === alumni._id.toString());
      if (aProfile) {
        const match = calculateMentorMatch(student, profile, alumni, aProfile);
        recommendedMentors.push({
          alumni: alumni.toObject(),
          profile: aProfile.toObject(),
          matchScore: match.score,
          matchReasons: match.reasons
        });
      }
    }
    recommendedMentors.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: {
        stats: {
          activeMentorshipsCount: activeMentorships.length,
          upcomingSessionsCount: upcomingSessions.length,
          totalApplications,
          savedJobsCount
        },
        activeMentorships,
        upcomingSessions,
        activeApplications,
        recommendedJobs,
        recommendedMentors: recommendedMentors.slice(0, 4)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard
};
