const express = require('express');
const router = express.Router();
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnections,
  getConnectionRequests,
  getSuggestedConnections
} = require('../controllers/networkController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConnections);
router.get('/requests', protect, getConnectionRequests);
router.get('/suggestions', protect, getSuggestedConnections);

router.post('/:id/request', protect, sendConnectionRequest);
router.post('/:id/accept', protect, acceptConnectionRequest);
router.post('/:id/reject', protect, rejectConnectionRequest);
router.delete('/:id', protect, removeConnection);

module.exports = router;
