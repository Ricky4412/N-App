const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
  const { bookId, plan, price, duration } = req.body;
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
    book: bookId, // Associate subscription with a specific book
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
    res.status(404);
    throw new Error('Subscription not found');
  }
});

// @desc    Handle mobile money payment
// @route   POST /api/subscriptions/pay
// @access  Private
const handlePayment = asyncHandler(async (req, res) => {
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

// @desc    Get user's subscription
// @route   GET /api/subscriptions/:bookId
// @access  Private
const getUserSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { bookId } = req.params;
  const subscription = await Subscription.findOne({ user: userId, book: bookId });

  if (subscription) {
    res.json(subscription);
  } else {
    res.status(404).json({ message: 'Subscription not found' });
  }
});

module.exports = {
  createSubscription,
  renewSubscription,
  handlePayment,
  getUserSubscription,
};
