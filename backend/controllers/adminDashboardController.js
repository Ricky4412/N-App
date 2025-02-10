const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Book = require('../models/Book');
const ActivityLog = require('../models/ActivityLog');
const Subscription = require('../models/Subscription');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboardData = asyncHandler(async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();
    const activityCount = await ActivityLog.countDocuments();
    const recentActivities = await ActivityLog.find().sort({ timestamp: -1 }).limit(10).populate('user', 'name');
  
    res.json({
      userCount,
      bookCount,
      activityCount,
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get admin dashboard data', error: error.message });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin-dashboard/analytics
// @access  Private/Admin
const getAnalyticsData = asyncHandler(async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ endDate: { $gte: new Date() } });
    const totalBooks = await Book.countDocuments();
  
    res.json({
      totalUsers,
      activeSubscriptions,
      totalBooks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get analytics data', error: error.message });
  }
});

module.exports = {
  getAdminDashboardData,
  getAnalyticsData,
};
