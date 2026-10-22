const mongoose = require('mongoose');
const { REPORT_STATUS } = require('../utils/constants');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedEntityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    entityType: {
      type: String,
      enum: ['User', 'Job', 'Event', 'Resource', 'Message', 'Review'],
      default: 'User'
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the report'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
