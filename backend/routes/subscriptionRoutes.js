const express = require('express');
const {
  createSubscription,
  renewSubscription,
  initializePayment,
  verifyPayment,
  getUserSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Route to create a subscription
router.post('/', protect, createSubscription);

// Route to renew a subscription
router.put('/renew', protect, renewSubscription);

// Route to initialize Paystack payment
router.post('/pay', protect, initializePayment);

// Route to verify Paystack payment
router.get('/verify/:reference', protect, verifyPayment);

// Route to get user subscription
router.get('/:bookId', protect, getUserSubscription);

module.exports = router;
