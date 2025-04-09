import axios from 'axios';
import { config } from '../config/config';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: config.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

const authService = {
    // ... existing code ...
    sendOTP: async (phoneNumber) => {
        try {
            console.log('Using API URL:', config.API_URL);
            const response = await api.post('/auth/register/send-otp', {
                phoneNumber: phoneNumber
            });
            return response.data;
        } catch (error) {
            console.error('Send OTP error:', error);
            throw new Error('Lỗi server: Không thể gửi OTP. Vui lòng thử lại sau.');
        }
    },
    // ... existing code ...
};

export default authService; 