import api from './api';

export const sendOtp = async (phoneNumber) => {
  try {
    const response = await api.post('/auth/send-otp', { phoneNumber });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (phoneNumber, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (email, password, phoneNumber) => {
  try {
    const response = await api.post('/auth/register', { email, password, phoneNumber });
    return response.data;
  } catch (error) {
    throw error;
  }
};