const express = require('express');
const router = express.Router();
const { getMyApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, authorize('student', 'admin'), getMyApplications);
router.put('/:id/status', protect, authorize('alumni', 'admin'), updateApplicationStatus);

module.exports = router;
