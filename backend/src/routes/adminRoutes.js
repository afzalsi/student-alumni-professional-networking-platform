const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUsers,
  toggleUserStatus,
  verifyAlumni,
  getAdminJobs,
  updateJobApproval,
  getAuditLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/alumni/:id/verify', verifyAlumni);
router.get('/jobs', getAdminJobs);
router.put('/jobs/:id/approve', updateJobApproval);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
