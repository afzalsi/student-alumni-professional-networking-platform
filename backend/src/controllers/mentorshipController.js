const MentorshipRequest = require('../models/MentorshipRequest');
const Mentorship = require('../models/Mentorship');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const AlumniProfile = require('../models/AlumniProfile');
const { MENTORSHIP_REQUEST_STATUS, MENTORSHIP_STATUS, NOTIFICATION_TYPE } = require('../utils/constants');
const { sendNotification } = require('../services/notificationService');

// @desc    Send a mentorship request (Student -> Alumni)
// @route   POST /api/mentorship/requests
// @access  Private (Student)
const createMentorshipRequest = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { alumniId, message, goal, topic, preferredMode } = req.body;

    if (studentId.toString() === alumniId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a mentorship request to yourself'
      });
    }

    const alumni = await User.findOne({ _id: alumniId, role: 'alumni', isActive: true });
    if (!alumni) {
      return res.status(404).json({ success: false, message: 'Alumni mentor not found' });
    }

    // Check if there is already a pending or active mentorship
    const existingActive = await Mentorship.findOne({
      studentId,
      alumniId,
      status: MENTORSHIP_STATUS.ACTIVE
    });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active mentorship with this mentor'
      });
    }

    const existingPending = await MentorshipRequest.findOne({
      studentId,
      alumniId,
      status: MENTORSHIP_REQUEST_STATUS.PENDING
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request with this mentor'
      });
    }

    const mentorshipRequest = await MentorshipRequest.create({
      studentId,
      alumniId,
      message,
      goal,
      topic,
      preferredMode: preferredMode || 'online',
      status: MENTORSHIP_REQUEST_STATUS.PENDING
    });

    // Notify Alumni
    await sendNotification({
      recipientId: alumniId,
      type: NOTIFICATION_TYPE.MENTORSHIP_REQUEST,
      title: 'New Mentorship Request',
      message: `${req.user.name} sent you a mentorship request for topic: ${topic}`,
      relatedEntityId: mentorshipRequest._id,
      relatedEntityType: 'MentorshipRequest',
      link: '/alumni/requests'
    });

    res.status(201).json({
      success: true,
      message: 'Mentorship request sent successfully!',
      data: mentorshipRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mentorship requests (Student: sent, Alumni: received)
// @route   GET /api/mentorship/requests
// @access  Private
const getMentorshipRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = userId;
    } else if (req.user.role === 'alumni') {
      query.alumniId = userId;
    }

    const requests = await MentorshipRequest.find(query)
      .populate('studentId', 'name email avatar department graduationYear skills')
      .populate('alumniId', 'name email avatar department graduationYear')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (Accept / Reject / Cancel)
// @route   PUT /api/mentorship/requests/:id
// @access  Private
const updateMentorshipRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const userId = req.user._id;

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found' });
    }

    // State validation
    if (request.status !== MENTORSHIP_REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Cannot update request that is already ${request.status}`
      });
    }

    // Permission checks
    if (status === MENTORSHIP_REQUEST_STATUS.CANCELLED) {
      if (request.studentId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only the requesting student can cancel this request' });
      }
      request.status = MENTORSHIP_REQUEST_STATUS.CANCELLED;
      await request.save();
      return res.json({ success: true, message: 'Request cancelled successfully', data: request });
    }

    if ([MENTORSHIP_REQUEST_STATUS.ACCEPTED, MENTORSHIP_REQUEST_STATUS.REJECTED].includes(status)) {
      if (request.alumniId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only the requested alumni mentor can accept or reject this request' });
      }

      request.status = status;
      if (rejectionReason) request.rejectionReason = rejectionReason;
      await request.save();

      if (status === MENTORSHIP_REQUEST_STATUS.ACCEPTED) {
        // 1. Create active Mentorship record
        const mentorship = await Mentorship.create({
          studentId: request.studentId,
          alumniId: request.alumniId,
          requestId: request._id,
          startDate: new Date(),
          status: MENTORSHIP_STATUS.ACTIVE,
          goals: [
            {
              title: request.goal || 'Master key skills and career development',
              isCompleted: false
            }
          ]
        });

        // 2. Ensure Conversation exists between student & alumni
        let conversation = await Conversation.findOne({
          participants: { $all: [request.studentId, request.alumniId] }
        });
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [request.studentId, request.alumniId],
            mentorshipId: mentorship._id
          });
        }

        // Notify Student
        await sendNotification({
          recipientId: request.studentId,
          type: NOTIFICATION_TYPE.MENTORSHIP_ACCEPTED,
          title: 'Mentorship Request Accepted! 🎉',
          message: `${req.user.name} accepted your mentorship request. You can now chat and schedule sessions!`,
          relatedEntityId: mentorship._id,
          relatedEntityType: 'Mentorship',
          link: '/student/mentorships'
        });

        return res.json({
          success: true,
          message: 'Mentorship request accepted and relationship activated!',
          data: { request, mentorship, conversationId: conversation._id }
        });
      } else {
        // Notify Student of rejection
        await sendNotification({
          recipientId: request.studentId,
          type: NOTIFICATION_TYPE.MENTORSHIP_REJECTED,
          title: 'Mentorship Request Update',
          message: `${req.user.name} was unable to accept your mentorship request at this time.`,
          relatedEntityId: request._id,
          relatedEntityType: 'MentorshipRequest',
          link: '/mentors'
        });

        return res.json({
          success: true,
          message: 'Mentorship request rejected',
          data: request
        });
      }
    }

    return res.status(400).json({ success: false, message: 'Invalid status provided' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active mentorships for current user
// @route   GET /api/mentorship
// @access  Private
const getActiveMentorships = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let query = { status: MENTORSHIP_STATUS.ACTIVE };

    if (req.user.role === 'student') query.studentId = userId;
    else if (req.user.role === 'alumni') query.alumniId = userId;

    const mentorships = await Mentorship.find(query)
      .populate('studentId', 'name email avatar department graduationYear skills careerGoals')
      .populate('alumniId', 'name email avatar department graduationYear')
      .populate('requestId', 'topic goal message');

    res.json({
      success: true,
      data: mentorships
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mentorship goals and progress
// @route   PUT /api/mentorship/:id
// @access  Private
const updateMentorship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { goals, progressPercentage, status, notes } = req.body;
    const userId = req.user._id;

    const mentorship = await Mentorship.findById(id);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    // Check participation
    if (
      mentorship.studentId.toString() !== userId.toString() &&
      mentorship.alumniId.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this mentorship' });
    }

    if (goals !== undefined) mentorship.goals = goals;
    if (progressPercentage !== undefined) mentorship.progressPercentage = progressPercentage;
    if (status !== undefined) mentorship.status = status;
    if (notes !== undefined) mentorship.notes = notes;

    if (status === MENTORSHIP_STATUS.COMPLETED) {
      mentorship.endDate = new Date();
    }

    await mentorship.save();

    res.json({
      success: true,
      message: 'Mentorship updated successfully',
      data: mentorship
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMentorshipRequest,
  getMentorshipRequests,
  updateMentorshipRequestStatus,
  getActiveMentorships,
  updateMentorship
};
