const asyncHandler = require('express-async-handler');
const axios = require('axios');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc Create a new subscription
// @route POST /api/subscriptions
// @access Private
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
    status: 'pending',
  });

  if (subscription) {
    const user = await User.findById(userId);
    user.subscription = subscription._id;
    await user.save();

    res.status(201).json(subscription);
  } else {
    res.status(400).json({ message: 'Invalid subscription data' });
  }
});

// @desc Renew a subscription
// @route PUT /api/subscriptions/renew
// @access Private
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

// @desc Initialize Paystack payment
// @route POST /api/subscriptions/pay
// @access Private
const initializePayment = asyncHandler(async (req, res) => {
  const { email, amount, mobileNumber, serviceProvider, accountName } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo
        currency: 'GHS',
        channels: ['mobile_money'], // Enable MoMo payments
        metadata: {
          mobileNumber,
          serviceProvider,
          accountName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      message: 'Payment request sent. Check your phone for the MoMo prompt.',
      data: response.data,
    });
  } catch (error) {
    console.error('❌ Payment Initialization Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initialization error',
      error: error.response?.data || error.message,
    });
  }
});

// @desc Verify Paystack payment
// @route GET /api/subscriptions/verify/:reference
// @access Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verificationData = response.data.data;

    if (verificationData.status === 'success') {
      const subscription = await Subscription.findOne({ user: req.user._id, status: 'pending' });

      if (subscription) {
        subscription.status = 'active';
        subscription.paidAt = new Date();
        await subscription.save();
      }

      return res.json({ success: true, message: 'Payment verified successfully' });
    } else if (verificationData.status === 'abandoned') {
      return res.status(400).json({
        success: false,
        message: 'Payment was not completed. User may have canceled or failed to enter PIN.',
        data: verificationData,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment verification failed: ${verificationData.gateway_response}`,
        data: verificationData,
      });
    }
  } catch (error) {
    console.error('❌ Payment Verification Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.response?.data || error.message,
    });
  }
});

// @desc Handle Paystack webhook for subscriptions
// @route POST /api/subscriptions/webhook
// @access Public
const handleSubscriptionWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];

  if (!signature) {
    console.error("❌ No signature received from Paystack.");
    return res.status(401).json({ message: "Unauthorized webhook request" });
  }

  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== signature) {
    console.error("❌ Invalid Paystack signature.");
    return res.status(401).json({ message: "Unauthorized webhook request" });
  }

  const event = req.body;
  console.log(`✅ Webhook event received: ${event.event}`);

  if (event.event === "charge.success") {
    try {
      const { reference } = event.data;
      await verifyPayment({ params: { reference } }, { json: console.log });
    } catch (error) {
      console.error("⚠️ Error handling Paystack webhook:", error);
    }
  }

  res.sendStatus(200);
});

// @desc Handle Paystack webhook for general payments
// @route POST /api/paystack/webhook
// @access Public
const handleGeneralWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];

  if (!signature) {
    console.error("❌ No signature received from Paystack.");
    return res.status(401).json({ message: "Unauthorized webhook request" });
  }

  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== signature) {
    console.error("❌ Invalid Paystack signature.");
    return res.status(401).json({ message: "Unauthorized webhook request" });
  }

  const event = req.body;
  console.log(`✅ General webhook event received: ${event.event}`);

  if (event.event === "charge.success") {
    try {
      const { reference } = event.data;
      await verifyPayment({ params: { reference } }, { json: console.log });
    } catch (error) {
      console.error("⚠️ Error handling Paystack webhook:", error);
    }
  }

  res.sendStatus(200);
});

// @desc Get user's subscription
// @route GET /api/subscriptions/:id
// @access Private
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
  handleSubscriptionWebhook,
  handleGeneralWebhook,
  getUserSubscription,
};
