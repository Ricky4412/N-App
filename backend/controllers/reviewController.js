const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user._id;

  const review = await Review.create({
    user: userId,
    book: bookId,
    rating,
    comment,
  });

  res.status(201).json(review);
});

// @desc    Get reviews for a book
// @route   GET /api/reviews/:bookId
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const bookId = req.params.bookId;
  const reviews = await Review.find({ book: bookId }).populate('user', 'name');
  res.json(reviews);
});

module.exports = {
  addReview,
  getReviews,
};