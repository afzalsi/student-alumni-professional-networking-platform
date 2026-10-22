const mongoose = require('mongoose');
const { MENTORSHIP_REQUEST_STATUS } = require('../utils/constants');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: [true, 'Please provide an introductory message'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    goal: {
      type: String,
      required: [true, 'Please state your mentorship goal'],
      maxlength: [500, 'Goal cannot exceed 500 characters']
    },
    topic: {
      type: String,
      required: [true, 'Please select or describe a mentoring topic']
    },
    preferredMode: {
      type: String,
      enum: ['online', 'in-person', 'hybrid'],
      default: 'online'
    },
    status: {
      type: String,
      enum: Object.values(MENTORSHIP_REQUEST_STATUS),
      default: MENTORSHIP_REQUEST_STATUS.PENDING
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

mentorshipRequestSchema.index({ studentId: 1, alumniId: 1, status: 1 });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
