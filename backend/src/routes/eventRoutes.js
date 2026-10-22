const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  cancelRegistration
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post(
  '/',
  protect,
  authorize('alumni', 'admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    validate
  ],
  createEvent
);

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

module.exports = router;
