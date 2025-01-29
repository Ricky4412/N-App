// backend/sendRenewalReminder.js
const twilio = require('twilio');
const client = new twilio(accountSid, authToken);

const sendRenewalReminder = (phoneNumber) => {
  client.messages.create({
    body: 'Your subscription is about to expire. Please renew to continue accessing our books.',
    from: '+1234567890',
    to: phoneNumber,
  });
};

module.exports = sendRenewalReminder;