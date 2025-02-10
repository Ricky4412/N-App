const express = require('express');
const { check, validationResult } = require('express-validator');
const {
  getUsers,
  getBooks,
  getSubscriptions,
  deleteUser,
  deleteBook,
  registerAdmin,
  addBook,
  updateBook,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Validation rules
const validateRegister = [
  check('email').isEmail().withMessage('Invalid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth routes
router.post('/register', validateRegister, handleValidationErrors, registerAdmin);

// Admin routes (protected)
router.get('/users', protect, admin, getUsers);
router.get('/books', protect, admin, getBooks);
router.get('/subscriptions', protect, admin, getSubscriptions);
router.delete('/users/:id', protect, admin, deleteUser);
router.delete('/books/:id', protect, admin, deleteBook);
router.post('/books', protect, admin, addBook);
router.put('/books/:id', protect, admin, updateBook);

module.exports = router;
