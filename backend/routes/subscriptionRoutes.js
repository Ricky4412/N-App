const express = require('express');
const axios = require('axios');
const {
  createSubscription,
  renewSubscription,
  handlePayment,
  getUserSubscription,
} = require('../controllers/subscriptionController');
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

// Remove redundant payment route
// If you need an additional payment route using axios, ensure it doesn't conflict with existing routes
// Example of an additional payment route (optional)
/*
router.post('/pay/extra', protect, async (req, res) => {
  const { email, amount, phone_number } = req.body;

  try {
    const response = await axios.post('https://api.mobilemoney.com/pay', {
      email,
      amount,
      phone_number,
    });

    if (response.data.ResponseCode === '0000') {
      res.json({ success: true, message: 'Payment successful' });
    } else {
      res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment error', error: error.message });
  }
});
*/

module.exports = router;
