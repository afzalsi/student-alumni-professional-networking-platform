const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/networkController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, searchAll);

module.exports = router;
