const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  plan: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  mobileNumber: { type: String, required: true },
  serviceProvider: { type: String, required: true },
  accountName: { type: String, required: true },
  status: { type: String, default: 'pending' }, // Add status field
  paidAt: { type: Date }, // Add paidAt field
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
