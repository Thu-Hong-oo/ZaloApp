const axios = require('axios');
const serviceDiscovery = require('./serviceDiscovery');

class AuthService {
  constructor() {
    this.basePath = '/api/auth';
  }

  async getBaseUrl() {
    const authServiceUrl = await serviceDiscovery.getAuthServiceUrl();
    return `${authServiceUrl}${this.basePath}`;
  }

  async validateToken(token) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await axios.post(`${baseUrl}/validate-token`, {
        token
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await axios.post(`${baseUrl}/refresh-token`, {
        refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  async getUserInfo(token) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await axios.get(`${baseUrl}/user-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }
}

module.exports = new AuthService(); 