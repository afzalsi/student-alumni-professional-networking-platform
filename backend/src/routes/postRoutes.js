const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
  toggleSavePost,
  getSavedPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/feed', protect, getFeed);
router.get('/saved', protect, getSavedPosts);
router.get('/user/:id', protect, getUserPosts);
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/save', protect, toggleSavePost);
router.post('/:id/share', protect, createPost);

module.exports = router;
