const express = require('express');
const router = express.Router();
const { getAlumniDirectory, getAlumniById, getAlumniDashboard } = require('../controllers/alumniController');
const { getMentorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Optional auth to attach match scores if student is logged in
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getAlumniDirectory);
router.get('/dashboard', protect, authorize('alumni', 'admin'), getAlumniDashboard);
router.get('/:id', optionalAuth, getAlumniById);
router.get('/:id/reviews', getMentorReviews);

module.exports = router;
