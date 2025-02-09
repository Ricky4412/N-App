const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOtp, sendOtp, verifyOtp } = require('../services/otpService');
const { sendEmail } = require('../utils/emailService');


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
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});


// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, telephone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber: telephone,
    role: 'client', // Ensure the role is set to 'client' for all new users
  });

  if (user) {
    // Generate OTP
    const otp = await generateOtp(user._id); // Pass userId to generateOtp function

    // Send OTP to user's email
    await sendOtp(user.email, otp);

    // Send verification email
    const verificationToken = user.generateVerificationToken();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(user.email, 'JEM Book Library Software', 'Thank you for registering!');
    await sendEmail(user.email, 'Email Verification', `Please verify your email by clicking on the following link: ${verificationUrl}`);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc Send OTP to user's email
// @route POST /api/auth/send-otp
// @access Public
const sendOtpToEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: 'User not found' });
    return;
  }

  const otp = await generateOtp(user._id);
  await sendOtp(email, otp);
  res.status(200).json({ message: 'OTP sent successfully' });
});

// @desc Verify OTP
// @route POST /api/auth/verify-otp
// @access Public
const verifyOtpCode = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    res.status(400).json({ message: 'User ID and OTP are required' });
    return;
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(400).json({ message: 'User not found' });
    return;
  }

  const isValid = await verifyOtp(user._id, otp);
  if (isValid) {
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// @desc Verify email
// @route GET /api/auth/verify-email
// @access Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ message: 'Invalid token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10); // Ensure password is hashed before saving
    }

    const updatedUser = await user.save();

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
      },
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc Get user role
// @route GET /api/auth/role/:id
// @access Private
const getUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.json({ role: user.role });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc Request password reset
// @route POST /api/auth/request-reset
// @access Public
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const otp = await generateOtp(user._id);
  await sendOtp(email, otp);

  res.status(200).json({ message: 'OTP sent successfully', userId: user._id });
});

// @desc Reset user password
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { userId, otp, password, confirmPassword } = req.body;

    if (!userId || !otp || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Convert userId to ObjectId to match the OTP schema
    const objectId = new mongoose.Types.ObjectId(userId);

    // Verify the OTP
    const isValid = await verifyOtp(objectId, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Find the user
    const user = await User.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = {
  authUser,
  registerUser,
  sendOtpToEmail,
  verifyOtpCode,
  verifyEmail,
  updateProfile,
  getUserRole,
  requestPasswordReset,
  resetPassword,
};
