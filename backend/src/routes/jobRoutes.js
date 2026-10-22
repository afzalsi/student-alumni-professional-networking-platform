const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleSaveJob,
  getSavedJobs
} = require('../controllers/jobController');
const { applyForJob, getJobApplicants } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Optional auth to attach match scores & saved job flags
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
    body('title').notEmpty().withMessage('Job title is required'),
    body('company').notEmpty().withMessage('Company name is required'),
    body('description').notEmpty().withMessage('Job description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('location').notEmpty().withMessage('Location is required'),
    validate
  ],
  createJob
);

router.get('/', optionalAuth, getJobs);
router.get('/saved/list', protect, authorize('student', 'admin'), getSavedJobs);
router.get('/:id', optionalAuth, getJobById);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.post('/:id/save', protect, authorize('student', 'admin'), toggleSaveJob);

// Nested routes for applications
router.post(
  '/:jobId/apply',
  protect,
  authorize('student', 'admin'),
  [body('resumeUrl').notEmpty().withMessage('Resume URL is required'), validate],
  applyForJob
);

router.get('/:jobId/applications', protect, authorize('alumni', 'admin'), getJobApplicants);

module.exports = router;
