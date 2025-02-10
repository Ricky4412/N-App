const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Book = require('../models/Book');
const Subscription = require('../models/Subscription');
const { sendEmail } = require('../utils/emailService');
const generateToken = require('../utils/generateToken');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
});

// @desc    Get all books
// @route   GET /api/admin/books
// @access  Private/Admin
const getBooks = asyncHandler(async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get books', error: error.message });
  }
});

// @desc    Get all subscriptions
// @route   GET /api/admin/subscriptions
// @access  Private/Admin
const getSubscriptions = asyncHandler(async (req, res) => {
  try {
    const subscriptions = await Subscription.find({}).populate('user');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subscriptions', error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// @desc    Delete book
// @route   DELETE /api/admin/books/:id
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

// @desc    Register a new admin
// @route   POST /api/admin/register-admin
// @access  Private/Admin
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'admin', // Set role to 'admin'
    });

    if (user) {
      const verificationToken = user.generateVerificationToken();
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail(user.email, 'Welcome to BookReaderApp Admin', 'Thank you for registering as an admin!');
      await sendEmail(user.email, 'Email Verification', `Please verify your email by clicking on the following link: ${verificationUrl}`);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to register admin', error: error.message });
  }
});

// @desc    Add a new book
// @route   POST /api/admin/books
// @access  Private/Admin
const addBook = asyncHandler(async (req, res) => {
  const { title, author, description, rating, coverImage, htmlUrl, price } = req.body;

  // Log received data for debugging
  console.log('Request Body:', req.body);

  if (!title || !author || !description || !coverImage || !htmlUrl || !price) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const book = new Book({
    title,
    author,
    description,
    rating: parseFloat(rating),
    coverImage,
    htmlUrl, // Change from pdf to htmlUrl
    price: parseFloat(price), // Add price
  });

  try {
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const { title, author, coverImage, description, rating, htmlUrl, price } = req.body;

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      book.title = title || book.title;
      book.author = author || book.author;
      book.coverImage = coverImage || book.coverImage;
      book.description = description || book.description;
      book.rating = rating || book.rating;
      book.htmlUrl = htmlUrl || book.htmlUrl;
      book.price = price || book.price; // Add price

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
});
  
module.exports = {
  getUsers,
  getBooks,
  getSubscriptions,
  deleteUser,
  deleteBook,
  registerAdmin,
  addBook,
};
