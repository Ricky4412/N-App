const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const { search, author, rating } = req.query;

  const query = {};
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (author) {
    query.author = { $regex: author, $options: 'i' };
  }
  if (rating) {
    query.rating = { $gte: rating };
  }

  try {
    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get books', error: error.message });
  }
});

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to get book', error: error.message });
  }
});

// @desc    Add a new book
// @route   POST /api/books
// @access  Private/Admin
const addBook = asyncHandler(async (req, res) => {
  const { title, author, coverImage, description, rating, htmlUrl } = req.body;

  if (!htmlUrl) {
    return res.status(400).json({ message: 'HTML URL is required.' });
  }

  const book = new Book({
    title,
    author,
    coverImage,
    description,
    rating,
    htmlUrl,
  });

  try {
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
const searchBooks = asyncHandler(async (req, res) => {
  const { query, genre, author, rating } = req.query;

  const filter = {
    $and: [
      { $or: [{ title: { $regex: query, $options: 'i' } }, { author: { $regex: query, $options: 'i' } }] },
      ...(genre ? [{ genre: { $regex: genre, $options: 'i' } }] : []),
      ...(author ? [{ author: { $regex: author, $options: 'i' } }] : []),
      ...(rating ? [{ rating: { $gte: rating } }] : []),
    ],
  };

  try {
    const books = await Book.find(filter);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search books', error: error.message });
  }
});

// @desc    Get book recommendations
// @route   GET /api/books/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const userPreferences = req.user.preferences; // Assuming user preferences are stored in req.user

  try {
    const recommendations = await Book.find({ genre: { $in: userPreferences.genres } }).limit(10);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const { title, author, coverImage, description, rating, htmlUrl } = req.body;

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      book.title = title || book.title;
      book.author = author || book.author;
      book.coverImage = coverImage || book.coverImage;
      book.description = description || book.description;
      book.rating = rating || book.rating;
      book.htmlUrl = htmlUrl || book.htmlUrl;

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await book.remove();
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
});

module.exports = {
  getBooks,
  getBookById,
  addBook,
  searchBooks,
  getRecommendations,
  updateBook,
  deleteBook,
};
