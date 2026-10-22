const mongoose = require('mongoose');
const { SESSION_STATUS } = require('../utils/constants');

const mentorshipSessionSchema = new mongoose.Schema(
  {
    mentorshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentorship'
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide a session date']
    },
    startTime: {
      type: String,
      required: [true, 'Please provide a start time (e.g., 14:00)']
    },
    endTime: {
      type: String,
      required: [true, 'Please provide an end time (e.g., 15:00)']
    },
    topic: {
      type: String,
      required: [true, 'Please provide a session topic']
    },
    meetingLink: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'Online via Video Call'
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.REQUESTED
    },
    notes: {
      type: String,
      default: ''
    },
    feedback: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

mentorshipSessionSchema.index({ mentorId: 1, date: 1, startTime: 1 });
mentorshipSessionSchema.index({ menteeId: 1, date: 1 });

module.exports = mongoose.model('MentorshipSession', mentorshipSessionSchema);
