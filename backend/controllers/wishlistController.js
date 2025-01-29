// controllers/wishlistController.js
const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @desc    Add a book to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user._id;

  const wishlistItem = await Wishlist.create({
    user: userId,
    book: bookId,
  });

  res.status(201).json(wishlistItem);
});

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const wishlist = await Wishlist.find({ user: userId }).populate('book');
  res.json(wishlist);
});

module.exports = {
  addToWishlist,
  getWishlist,
};