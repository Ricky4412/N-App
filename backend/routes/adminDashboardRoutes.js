const express = require('express');
const { getAdminDashboardData, getAnalyticsData } = require('../controllers/adminDashboardController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', protect, admin, getAdminDashboardData);
router.get('/analytics', protect, admin, getAnalyticsData);

module.exports = router;
