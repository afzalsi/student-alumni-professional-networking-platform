const mongoose = require('mongoose');
const { JOB_STATUS, JOB_TYPE, WORK_MODE } = require('../utils/constants');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description']
    },
    type: {
      type: String,
      enum: Object.values(JOB_TYPE),
      default: JOB_TYPE.FULL_TIME
    },
    category: {
      type: String,
      required: [true, 'Please specify an industry/category'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Please provide a location or Remote'],
      trim: true
    },
    workMode: {
      type: String,
      enum: Object.values(WORK_MODE),
      default: WORK_MODE.REMOTE
    },
    salaryRange: {
      type: String,
      default: 'Competitive'
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior', 'Internship', 'Any'],
      default: 'Entry Level'
    },
    skills: {
      type: [String],
      default: []
    },
    deadline: {
      type: Date
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.PENDING
    },
    applicationUrl: {
      type: String,
      default: ''
    },
    applicantCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });
jobSchema.index({ status: 1, type: 1, category: 1, location: 1 });
jobSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Job', jobSchema);
