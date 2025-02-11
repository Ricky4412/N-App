const express = require('express');
const axios = require('axios');
const { createSubscription, renewSubscription, handlePayment, getUserSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Route to create a subscription
router.post('/', protect, createSubscription);

// Route to renew a subscription
router.put('/renew', protect, renewSubscription);

// Route to handle payment
router.post('/pay', protect, handlePayment);

// Route to get user subscription
router.get('/:bookId', protect, getUserSubscription);

module.exports = router;
