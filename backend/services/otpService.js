// otpService.js
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const OTP = require('../models/OTP');
const dotenv = require('dotenv');

dotenv.config();

const {
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

if (!EMAIL_SERVICE || !EMAIL_USER || !EMAIL_PASS) {
  throw new Error('Missing required environment variables for email service');
}

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Generates an OTP and saves it to the database
 * @param {string} userId - The ID of the user
 * @returns {string} The generated OTP
 */
const generateOtp = async (userId) => {
  const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Convert userId to ObjectId
  const objectId = new mongoose.Types.ObjectId(userId);

  await OTP.create({ userId: objectId, otp, expirationTime });

  return otp;
};

/**
 * Sends OTP via email
 * @param {string} email - The email of the user
 * @param {string} otp - The OTP to send
 */
const sendOtp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });
    console.log(`OTP sent to email: ${email}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

/**
 * Verifies the OTP for a user
 * @param {string} userId - The ID of the user
 * @param {string} otp - The OTP to verify
 * @returns {boolean} Whether the OTP is valid
 */
const verifyOtp = async (userId, otp) => {
  // Convert userId to ObjectId
  const objectId = new mongoose.Types.ObjectId(userId);

  const otpRecord = await OTP.findOne({ userId: objectId, otp });

  if (otpRecord && otpRecord.expirationTime > Date.now()) {
    await OTP.deleteOne({ userId: objectId, otp });
    return true;
  }

  return false;
};

module.exports = { generateOtp, sendOtp, verifyOtp };
