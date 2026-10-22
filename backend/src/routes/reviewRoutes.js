const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post(
  '/',
  protect,
  authorize('student', 'admin'),
  [
    body('mentorId').notEmpty().withMessage('Mentor ID is required'),
    body('mentorshipId').notEmpty().withMessage('Mentorship ID is required'),
    body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    validate
  ],
  createReview
);

module.exports = router;
