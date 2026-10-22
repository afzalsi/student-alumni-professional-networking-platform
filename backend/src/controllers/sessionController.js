const MentorshipSession = require('../models/MentorshipSession');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const { SESSION_STATUS, NOTIFICATION_TYPE } = require('../utils/constants');
const { sendNotification } = require('../services/notificationService');

// @desc    Book / Request a mentorship session
// @route   POST /api/sessions
// @access  Private (Student)
const bookSession = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { mentorId, date, startTime, endTime, topic, meetingLink, notes } = req.body;

    // Verify active mentorship relationship
    const mentorship = await Mentorship.findOne({
      studentId,
      alumniId: mentorId,
      status: 'ACTIVE'
    });

    if (!mentorship && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only book sessions with active approved mentors'
      });
    }

    const sessionDate = new Date(date);

    // Prevent double booking for mentor on same date and start time
    const existingBooking = await MentorshipSession.findOne({
      mentorId,
      date: sessionDate,
      startTime,
      status: { $in: [SESSION_STATUS.REQUESTED, SESSION_STATUS.CONFIRMED] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'The mentor is already booked for this date and time slot. Please choose another slot.'
      });
    }

    const session = await MentorshipSession.create({
      mentorshipId: mentorship?._id,
      mentorId,
      menteeId: studentId,
      date: sessionDate,
      startTime,
      endTime,
      topic,
      meetingLink: meetingLink || 'https://meet.google.com/new',
      notes: notes || '',
      status: SESSION_STATUS.CONFIRMED // Direct confirmation or requested
    });

    // Notify Mentor
    await sendNotification({
      recipientId: mentorId,
      type: NOTIFICATION_TYPE.SESSION_REQUEST,
      title: 'New Mentorship Session Booked',
      message: `${req.user.name} scheduled a mentoring session on ${sessionDate.toDateString()} at ${startTime}`,
      relatedEntityId: session._id,
      relatedEntityType: 'MentorshipSession',
      link: '/alumni/sessions'
    });

    res.status(201).json({
      success: true,
      message: 'Session booked successfully!',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's mentorship sessions
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let query = {};

    if (req.user.role === 'student') query.menteeId = userId;
    else if (req.user.role === 'alumni') query.mentorId = userId;

    const sessions = await MentorshipSession.find(query)
      .populate('mentorId', 'name email avatar department graduationYear')
      .populate('menteeId', 'name email avatar department graduationYear skills')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session status (Confirm, Cancel, Complete, No Show)
// @route   PUT /api/sessions/:id
// @access  Private
const updateSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, meetingLink, notes, feedback } = req.body;
    const userId = req.user._id;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (
      session.mentorId.toString() !== userId.toString() &&
      session.menteeId.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this session' });
    }

    if (status) session.status = status;
    if (meetingLink) session.meetingLink = meetingLink;
    if (notes) session.notes = notes;
    if (feedback) session.feedback = feedback;

    await session.save();

    // Send notifications on confirmation or cancellation
    const otherParticipantId = session.mentorId.toString() === userId.toString() ? session.menteeId : session.mentorId;
    if (status === SESSION_STATUS.CONFIRMED || status === SESSION_STATUS.CANCELLED) {
      await sendNotification({
        recipientId: otherParticipantId,
        type: status === SESSION_STATUS.CONFIRMED ? NOTIFICATION_TYPE.SESSION_CONFIRMED : NOTIFICATION_TYPE.SESSION_CANCELLED,
        title: `Session ${status}`,
        message: `${req.user.name} has marked the session on ${new Date(session.date).toDateString()} as ${status}`,
        relatedEntityId: session._id,
        relatedEntityType: 'MentorshipSession',
        link: req.user.role === 'student' ? '/student/sessions' : '/alumni/sessions'
      });
    }

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookSession,
  getSessions,
  updateSessionStatus
};
