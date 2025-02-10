const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        role: user.role,
        subscription: user.subscription,
        isVerified: user.isVerified,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user profile', error: error.message });
  }
});

// @desc    Get user activity log
// @route   GET /api/users/activity-log
// @access  Private
const getActivityLog = asyncHandler(async (req, res) => {
  try {
    const activities = await ActivityLog.find({ user: req.user._id });

    if (activities && activities.length > 0) {
      res.json(activities);
    } else {
      res.json([]); // Return an empty array instead of throwing an error
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to get activity log', error: error.message });
  }
});

module.exports = {
  getUserProfile,
  getActivityLog,
};
