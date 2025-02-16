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

// Protect all routes that require authentication
router.use('/pay', protect);
router.use('/renew', protect);
router.use('/verify/:reference', protect);
router.use('/:id', protect);

// Route to create a subscription
router.post('/', protect, createSubscription);

// Route to renew a subscription
router.put('/renew', renewSubscription);

// Route to initialize Paystack payment
router.post('/pay', initializePayment);

// Route to verify Paystack payment
router.get('/verify/:reference', verifyPayment);

// Use raw body parser for webhooks (needed for signature validation)
const rawBodyParser = express.raw({ type: 'application/json' });

// Route to handle Paystack webhook for subscriptions
router.post('/webhook', rawBodyParser, handleSubscriptionWebhook);

// Route to handle Paystack webhook for general payments
router.post('/paystack/webhook', rawBodyParser, handleGeneralWebhook);

// Route to get user subscription by ID
router.get('/:id', getUserSubscription);

module.exports = router;
