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

  const createdLog = await activityLog.save();
  res.status(201).json(createdLog);
});

// @desc    Get all activities for a user
// @route   GET /api/activity-log
// @access  Private
const getActivities = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const activities = await ActivityLog.find({ user: userId });
  res.json(activities);
});

module.exports = {
  logActivity,
  getActivities,
};