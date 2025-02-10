const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');

// @desc    Log an activity
// @route   POST /api/activity-log
// @access  Private
const logActivity = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const userId = req.user._id;

  const activityLog = new ActivityLog({
    user: userId,
    action,
  });

  try {
    const createdLog = await activityLog.save();
    res.status(201).json(createdLog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to log activity', error: error.message });
  }
});

// @desc    Get all activities for a user
// @route   GET /api/activity-log
// @access  Private
const getActivities = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const activities = await ActivityLog.find({ user: userId });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get activities', error: error.message });
  }
});

module.exports = {
  logActivity,
  getActivities,
};
