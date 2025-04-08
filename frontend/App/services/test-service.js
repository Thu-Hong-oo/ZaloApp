import axios from 'axios';

/**
 * Cấu hình API Gateway
 */
const API_URL = 'http://localhost:3000/api';

/**
 * Cấu hình axios với timeout và headers mặc định
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Service kiểm tra CORS
 */
const TestService = {
  /**
   * Kiểm tra CORS
   * @returns {Promise} - Kết quả kiểm tra
   */
  async testCors() {
    try {
      console.log('Testing CORS...');
      console.log('Request URL:', `${API_URL}/test/cors`);
      
      const response = await axiosInstance.get('/test/cors', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('CORS test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing CORS:', error);
      if (error.message === 'Network Error') {
        console.error('CORS or network issue detected. Please check your backend CORS configuration.');
        console.error('Request details:', {
          url: `${API_URL}/test/cors`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      throw error;
    }
  }
};

export default TestService; 