const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
  const { bookId, plan, price, duration, mobileNumber, serviceProvider, accountName } = req.body;
  const userId = req.user._id;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + duration);

  const subscription = await Subscription.create({
    user: userId,
    plan,
    price,
    duration,
    startDate,
    endDate,
    book: bookId,
    mobileNumber,
    serviceProvider,
    accountName,
  });

  if (subscription) {
    const user = await User.findById(userId);
    user.subscription = subscription._id;
    await user.save();

    res.status(201).json(subscription);
  } else {
    res.status(400);
    throw new Error('Invalid subscription data');
  }
});

// @desc    Renew a subscription
// @route   PUT /api/subscriptions/renew
// @access  Private
const renewSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.body;
  const userId = req.user._id;

  const subscription = await Subscription.findById(subscriptionId);

  if (subscription && subscription.user.toString() === userId.toString()) {
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + subscription.duration);

    subscription.endDate = newEndDate;
    await subscription.save();

    res.json(subscription);
  } else {
    res.status(404).json({ message: 'Subscription not found' });
  }
});

// @desc    Initialize Paystack payment
// @route   POST /api/subscriptions/pay
// @access  Private
const initializePayment = asyncHandler(async (req, res) => {
  const { email, amount, mobileNumber, serviceProvider, accountName } = req.body;

  try {
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: amount * 100, // Convert amount to kobo
      currency: 'GHS', // Set currency to Ghana Cedis
      channels: ['mobile_money'], // Enable mobile money payments
      metadata: {
        mobileNumber,
        serviceProvider,
        accountName,
      },
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment initialization error', error: error.message });
  }
});

// @desc    Verify Paystack payment
// @route   GET /api/subscriptions/verify/:reference
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    if (response.data.data.status === 'success') {
      // Payment successful, update subscription status
      const subscription = await Subscription.findOne({ user: req.user._id, status: 'pending' });
      if (subscription) {
        subscription.status = 'active';
        subscription.paidAt = new Date();
        await subscription.save();
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      console.error('Payment verification failed:', response.data);
      res.status(400).json({ success: false, message: 'Payment verification failed', data: response.data });
    }
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(500).json({ success: false, message: 'Payment verification error', error: error.message });
  }
});

// @desc    Get user's subscription
// @route   GET /api/subscriptions/:id
// @access  Private
const getUserSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (subscription) {
    res.json(subscription);
  } else {
    res.status(404).json({ message: 'Subscription not found' });
  }
});

module.exports = {
  createSubscription,
  renewSubscription,
  initializePayment,
  verifyPayment,
  getUserSubscription,
};
