const express = require('express');
const router = express.Router();
const { getStudentDashboard } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, authorize('student', 'admin'), getStudentDashboard);

module.exports = router;
