const express = require('express');
const {
  createSubscription,
  renewSubscription,
  initializePayment,
  verifyPayment,
  handlePaystackWebhook,
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

// Route to handle Paystack webhook
router.post('/webhook', express.json(), handlePaystackWebhook);

// Route to get user subscription by ID
router.get('/:id', protect, getUserSubscription);

module.exports = router;
