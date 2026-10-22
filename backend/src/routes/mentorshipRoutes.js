const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createMentorshipRequest,
  getMentorshipRequests,
  updateMentorshipRequestStatus,
  getActiveMentorships,
  updateMentorship
} = require('../controllers/mentorshipController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post(
  '/requests',
  protect,
  authorize('student', 'admin'),
  [
    body('alumniId').notEmpty().withMessage('Alumni ID is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('goal').notEmpty().withMessage('Goal is required'),
    body('topic').notEmpty().withMessage('Topic is required'),
    validate
  ],
  createMentorshipRequest
);

router.get('/requests', protect, getMentorshipRequests);
router.put('/requests/:id', protect, updateMentorshipRequestStatus);

router.get('/', protect, getActiveMentorships);
router.put('/:id', protect, updateMentorship);

module.exports = router;
