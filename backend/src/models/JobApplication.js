const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../utils/constants');

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeUrl: {
      type: String,
      required: [true, 'Please provide a resume URL or upload']
    },
    coverLetter: {
      type: String,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED
    },
    interviewDetails: {
      date: Date,
      time: String,
      link: String,
      notes: String
    },
    feedback: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Prevent multiple applications to same job
jobApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
jobApplicationSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
