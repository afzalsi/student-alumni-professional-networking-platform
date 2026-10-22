const mongoose = require('mongoose');
const { POST_CATEGORY } = require('../utils/constants');

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [5000, 'Post content cannot exceed 5000 characters']
    },
    category: {
      type: String,
      enum: Object.values(POST_CATEGORY),
      default: POST_CATEGORY.GENERAL
    },
    media: [
      {
        url: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['image', 'document', 'certificate'],
          default: 'image'
        },
        name: {
          type: String,
          default: ''
        },
        size: {
          type: Number,
          default: 0
        }
      }
    ],
    skills: {
      type: [String],
      default: []
    },
    hashtags: {
      type: [String],
      default: []
    },
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    sharesCount: {
      type: Number,
      default: 0
    },
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    shareCommentary: {
      type: String,
      trim: true,
      default: ''
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ skills: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
