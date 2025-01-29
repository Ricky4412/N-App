// tests/otpService.test.js
const { generateOtp } = require('../services/otpService');
const OTP = require('../models/OTP');

jest.mock('../models/OTP');

describe('OTP Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate a 6-digit OTP and save to the database', async () => {
    const userId = 'user123';
    OTP.create.mockResolvedValueOnce({ userId, otp: '123456', expirationTime: Date.now() + 10 * 60 * 1000 });

    const otp = await generateOtp(userId);

    expect(otp).toHaveLength(6);
    expect(OTP.create).toHaveBeenCalledWith(expect.objectContaining({ userId, otp, expirationTime: expect.any(Number) }));
  });
});