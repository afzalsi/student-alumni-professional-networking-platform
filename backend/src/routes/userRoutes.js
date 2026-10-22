const express = require('express');
const router = express.Router();
const { getUserById, updateProfile, uploadFile } = require('../controllers/userController');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getNetworkStatus
} = require('../controllers/networkController');
const { getUserPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.post('/upload', protect, upload.single('file'), uploadFile);

// Networking Follow APIs (Requirement 11)
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);
router.get('/:id/network-status', protect, getNetworkStatus);
router.get('/:id/posts', protect, getUserPosts);

module.exports = router;
