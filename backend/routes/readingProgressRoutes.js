// routes/readingProgressRoutes.js
const express = require('express');
const { updateReadingProgress, getReadingProgress } = require('../controllers/readingProgressController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/', protect, updateReadingProgress);
router.get('/:bookId', protect, getReadingProgress);

module.exports = router;