const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const OTP = require('../models/OTP');
const dotenv = require('dotenv');

dotenv.config();

const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } = process.env;

// Ensure required environment variables are set
if (!EMAIL_SERVICE || !EMAIL_USER || !EMAIL_PASS) {
  throw new Error('Missing required environment variables for email service');
}

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Generates and stores a new OTP for the user.
 * @param {string} userId - The ID of the user.
 * @returns {string} The generated OTP.
 */
const generateOtp = async (userId) => {
  try {
    const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Convert userId to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Remove any existing OTP for the user before generating a new one
    await OTP.deleteMany({ userId: objectId });

    // Store the OTP in the database
    await OTP.create({ userId: objectId, otp, expirationTime });

    return otp;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new Error('Failed to generate OTP');
  }
};

/**
 * Sends OTP to the user's email.
 * @param {string} email - The user's email.
 * @param {string} otp - The OTP to send.
 */
const sendOtp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"JEM Book Library" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });

    console.log(`OTP sent to: ${email}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

/**
 * Verifies the OTP for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} otp - The OTP to verify.
 * @returns {boolean} Whether the OTP is valid.
 */
const verifyOtp = async (userId, otp) => {
  try {
    // Convert userId to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Find the OTP record
    const otpRecord = await OTP.findOne({ userId: objectId, otp });

    if (!otpRecord) {
      console.warn('OTP not found or incorrect');
      return false;
    }

    // Check if OTP is expired
    if (otpRecord.expirationTime < Date.now()) {
      console.warn('OTP has expired');
      await OTP.deleteOne({ userId: objectId, otp });
      return false;
    }

    // OTP is valid, delete it after verification
    await OTP.deleteOne({ userId: objectId, otp });

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

module.exports = { generateOtp, sendOtp, verifyOtp };
