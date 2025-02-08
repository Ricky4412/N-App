const jwt = require('jsonwebtoken');

// Function to generate a JWT token
const generateToken = (id, expiresIn = '30d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Sign the token with the user ID and secret, and set the expiration time
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = generateToken;
