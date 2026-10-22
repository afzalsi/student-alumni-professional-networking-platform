const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { bookSession, getSessions, updateSessionStatus } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post(
  '/',
  protect,
  [
    body('mentorId').notEmpty().withMessage('Mentor ID is required'),
    body('date').notEmpty().withMessage('Session date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('topic').notEmpty().withMessage('Topic is required'),
    validate
  ],
  bookSession
);

router.get('/', protect, getSessions);
router.put('/:id', protect, updateSessionStatus);

module.exports = router;
