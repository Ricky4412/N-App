const express = require('express');
const { check, validationResult } = require('express-validator');
const {
  registerUser,
  authUser,
  sendOtpToEmail,
  verifyOtpCode,
  verifyEmail,
  updateProfile,
  getUserRole,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Validation rules
const validateRegister = [
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Invalid email'),
  check('telephone').not().isEmpty().withMessage('Telephone is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateLogin = [
  check('email').isEmail().withMessage('Invalid email'),
  check('password').exists().withMessage('Password is required'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register route
router.post('/register', validateRegister, handleValidationErrors, registerUser);

// Login route
router.post('/login', validateLogin, handleValidationErrors, authUser);

// OTP routes
router.post('/send-otp', sendOtpToEmail);
router.post('/verify-otp', verifyOtpCode);

// Email verification route
router.get('/verify-email', verifyEmail);

// Update profile route (protected)
router.put('/profile', protect, updateProfile);

// Get user role route
router.get('/user-role/:id', getUserRole);

// Password reset routes
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
