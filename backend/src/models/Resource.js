const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a resource title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    type: {
      type: String,
      enum: ['article', 'video', 'pdf', 'guide', 'code', 'book', 'other'],
      default: 'article'
    },
    url: {
      type: String,
      required: [true, 'Please provide a resource link/URL']
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookmarksCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

resourceSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
