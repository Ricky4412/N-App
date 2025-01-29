// models/ReadingProgress.js
const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
});

const ReadingProgress = mongoose.model('ReadingProgress', readingProgressSchema);

module.exports = ReadingProgress;