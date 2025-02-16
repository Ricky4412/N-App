const express = require('express');
const {
  createSubscription,
  renewSubscription,
  initializePayment,
  verifyPayment,
  handleSubscriptionWebhook,
  handleGeneralWebhook,
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

// Route to handle Paystack webhook for subscriptions
router.post('/webhook', express.json(), handleSubscriptionWebhook);

// Route to handle Paystack webhook for general payments
router.post('/paystack/webhook', express.json(), handleGeneralWebhook);

// Route to get user subscription by ID
router.get('/:id', protect, getUserSubscription);

module.exports = router;
