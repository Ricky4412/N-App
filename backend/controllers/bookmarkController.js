// controllers/bookmarkController.js
const asyncHandler = require('express-async-handler');
const Bookmark = require('../models/Bookmark');

// @desc    Add a bookmark
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = asyncHandler(async (req, res) => {
  const { bookId, page, note } = req.body;
  const userId = req.user._id;

  const bookmark = await Bookmark.create({
    user: userId,
    book: bookId,
    page,
    note,
  });

  res.status(201).json(bookmark);
});

// @desc    Get bookmarks for a user
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const bookmarks = await Bookmark.find({ user: userId }).populate('book');
  res.json(bookmarks);
});

module.exports = {
  addBookmark,
  getBookmarks,
};