const express = require("express");
const { check, validationResult } = require("express-validator");
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
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Validation Rules
const validateRegister = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email"),
  check("telephone").not().isEmpty().withMessage("Telephone is required"),
  check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

const validateLogin = [
  check("email").isEmail().withMessage("Invalid email"),
  check("password").exists().withMessage("Password is required"),
];

const validateResetRequest = [check("email").isEmail().withMessage("Valid email is required")];

const validatePasswordReset = [
  check("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];

// 📌 Middleware to Handle Validation Errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 🔑 Authentication Routes
router.post("/register", validateRegister, handleValidationErrors, registerUser);
router.post("/login", validateLogin, handleValidationErrors, authUser);

// 🔄 OTP Routes
router.post("/send-otp", sendOtpToEmail);
router.post("/verify-otp", verifyOtpCode);

// ✉️ Email Verification
router.post("/verify-email", verifyEmail); // Changed from GET to POST for better security

// 🔐 User Profile (Protected)
router.put("/profile", protect, updateProfile);

// 🔓 User Role
router.get("/user-role/:id", getUserRole);

// 🔄 Password Reset Routes
router.post("/request-reset", validateResetRequest, handleValidationErrors, requestPasswordReset);
router.post("/reset-password/:token", validatePasswordReset, handleValidationErrors, resetPassword);

module.exports = router;
