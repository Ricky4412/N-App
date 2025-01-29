// controllers/notificationController.js
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ user: userId });
  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification) {
    notification.read = true;
    await notification.save();
    res.json(notification);
  } else {
    res.status(404);
    throw new Error('Notification not found');
  }
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
};