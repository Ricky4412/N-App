const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { generateOtp, sendOtp, verifyOtp } = require("../services/otpService");
const { sendEmail } = require("../utils/emailService");

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, telephone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber: telephone,
    role: "client",
    isVerified: false,
  });

  if (user) {
    const verificationToken = generateToken(user._id, "1h");
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(user.email, "Email Verification", `Please verify your email: ${verificationUrl}`);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// @desc    Request password reset
// @route   POST /api/auth/request-reset
// @access  Public
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + (process.env.RESET_TOKEN_EXPIRY || 15) * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail(user.email, "Password Reset Request", `Click here to reset your password: ${resetUrl}`);

  res.status(200).json({ message: "Reset link sent successfully" });
});

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    res.status(400).json({ message: "Token is required" });
    return;
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({ message: "Invalid or expired token" });
    return;
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been updated successfully" });
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: "Invalid token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
    res.status(401).json({ message: "Incorrect old password" });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

module.exports = {
  authUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  changePassword,
  getUserProfile,
  updateUserProfile,
};
