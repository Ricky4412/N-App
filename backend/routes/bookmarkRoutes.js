// routes/bookmarkRoutes.js
const express = require('express');
const { addBookmark, getBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, addBookmark);
router.get('/', protect, getBookmarks);

module.exports = router;