// controllers/readingProgressController.js
const asyncHandler = require('express-async-handler');
const ReadingProgress = require('../models/ReadingProgress');

// @desc    Update reading progress
// @route   PUT /api/reading-progress
// @access  Private
const updateReadingProgress = asyncHandler(async (req, res) => {
  const { bookId, progress } = req.body;
  const userId = req.user._id;

  let readingProgress = await ReadingProgress.findOne({ user: userId, book: bookId });

  if (readingProgress) {
    readingProgress.progress = progress;
    await readingProgress.save();
  } else {
    readingProgress = await ReadingProgress.create({
      user: userId,
      book: bookId,
      progress,
    });
  }

  res.json(readingProgress);
});

// @desc    Get reading progress
// @route   GET /api/reading-progress/:bookId
// @access  Private
const getReadingProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const bookId = req.params.bookId;

  const readingProgress = await ReadingProgress.findOne({ user: userId, book: bookId });

  if (readingProgress) {
    res.json(readingProgress);
  } else {
    res.status(404);
    throw new Error('Reading progress not found');
  }
});

module.exports = {
  updateReadingProgress,
  getReadingProgress,
};