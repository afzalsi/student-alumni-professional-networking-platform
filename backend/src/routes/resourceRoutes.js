const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createResource, getResources, bookmarkResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post(
  '/',
  protect,
  authorize('alumni', 'admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('url').notEmpty().withMessage('Resource URL is required'),
    body('category').notEmpty().withMessage('Category is required'),
    validate
  ],
  createResource
);

router.get('/', getResources);
router.post('/:id/bookmark', protect, bookmarkResource);

module.exports = router;
