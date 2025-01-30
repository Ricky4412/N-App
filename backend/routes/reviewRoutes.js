const express = require('express');
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, addReview);
router.get('/:bookId', getReviews);

module.exports = router;
