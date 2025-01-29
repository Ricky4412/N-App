const express = require('express');
const { getUserProfile, getActivityLog } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/activity-log', protect, getActivityLog);

module.exports = router;
