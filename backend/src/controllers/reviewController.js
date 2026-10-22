const Review = require('../models/Review');
const Mentorship = require('../models/Mentorship');
const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');

// @desc    Create a review & rating for an alumni mentor
// @route   POST /api/reviews
// @access  Private (Student)
const createReview = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { mentorId, mentorshipId, rating, comment } = req.body;

    if (!mentorId || !mentorshipId || !rating) {
      return res.status(400).json({ success: false, message: 'Please provide mentorId, mentorshipId, and rating' });
    }

    // Verify completed mentorship relationship
    const mentorship = await Mentorship.findOne({
      _id: mentorshipId,
      studentId,
      alumniId: mentorId
    });

    if (!mentorship) {
      return res.status(400).json({
        success: false,
        message: 'No record of mentorship found between you and this mentor'
      });
    }

    // Check duplicate review
    const existing = await Review.findOne({ mentorshipId, studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this mentorship'
      });
    }

    const review = await Review.create({
      mentorId,
      studentId,
      mentorshipId,
      rating: Number(rating),
      comment: comment || ''
    });

    // Recalculate average rating on AlumniProfile
    const reviews = await Review.find({ mentorId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await AlumniProfile.findOneAndUpdate(
      { userId: mentorId },
      {
        ratingAverage: Math.round(avgRating * 10) / 10,
        ratingCount: reviews.length
      }
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a mentor
// @route   GET /api/alumni/:id/reviews
// @access  Public / Authenticated
const getMentorReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ mentorId: id })
      .populate('studentId', 'name avatar department graduationYear')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getMentorReviews
};
