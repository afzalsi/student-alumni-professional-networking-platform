const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { submitReport, getReports, resolveReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post(
  '/',
  protect,
  [body('reason').notEmpty().withMessage('Reason is required'), validate],
  submitReport
);

router.get('/', protect, authorize('admin'), getReports);
router.put('/:id/resolve', protect, authorize('admin'), resolveReport);

module.exports = router;
