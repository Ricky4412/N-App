// routes/notificationRoutes.js
const express = require('express');
const { getNotifications, markNotificationAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id', protect, markNotificationAsRead);

module.exports = router;