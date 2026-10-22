const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mentorshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentorship',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: ''
    }
  },
  { timestamps: true }
);

// Prevent duplicate review per mentorship from the same student
reviewSchema.index({ mentorshipId: 1, studentId: 1 }, { unique: true });
reviewSchema.index({ mentorId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
