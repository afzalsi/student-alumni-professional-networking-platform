const mongoose = require('mongoose');
const { MENTORSHIP_STATUS } = require('../utils/constants');

const mentorshipSchema = new mongoose.Schema(
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
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorshipRequest'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: Object.values(MENTORSHIP_STATUS),
      default: MENTORSHIP_STATUS.ACTIVE
    },
    goals: [
      {
        title: String,
        isCompleted: {
          type: Boolean,
          default: false
        },
        targetDate: Date
      }
    ],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

mentorshipSchema.index({ studentId: 1, alumniId: 1 });
mentorshipSchema.index({ status: 1 });

module.exports = mongoose.model('Mentorship', mentorshipSchema);
