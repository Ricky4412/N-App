const express = require('express');
const {
  createSubscription,
  renewSubscription,
  handlePayment,
  getUserSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createSubscription);
router.route('/renew').put(protect, renewSubscription);
router.route('/pay').post(protect, handlePayment);
router.route('/:bookId').get(protect, getUserSubscription);

module.exports = router;
