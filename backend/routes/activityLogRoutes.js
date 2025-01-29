const express = require('express');
const { logActivity, getActivities } = require('../controllers/activityLogController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, logActivity);
router.get('/', protect, getActivities);

module.exports = router;