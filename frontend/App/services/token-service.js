import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service quản lý token xác thực
 */
const TokenService = {
  /**
   * Lưu token vào AsyncStorage
   * @param {string} accessToken - Token truy cập
   * @param {string} refreshToken - Token làm mới
   */
  async saveTokens(accessToken, refreshToken) {
    try {
      console.log('Saving tokens:', { accessToken, refreshToken });
      if (!accessToken || !refreshToken) {
        console.error('Invalid tokens provided:', { accessToken, refreshToken });
        return false;
      }
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      
      // Verify tokens were saved
      const savedAccessToken = await AsyncStorage.getItem('accessToken');
      const savedRefreshToken = await AsyncStorage.getItem('refreshToken');
      console.log('Tokens saved successfully:', {
        accessToken: savedAccessToken,
        refreshToken: savedRefreshToken
      });
      
      return true;
    } catch (error) {
      console.error('Error saving tokens:', error);
      return false;
    }
  },

  /**
   * Lấy token truy cập từ AsyncStorage
   * @returns {Promise<string|null>} - Token truy cập hoặc null nếu không tìm thấy
   */
  async getAccessToken() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Retrieved access token:', token);
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Lấy token làm mới từ AsyncStorage
   * @returns {Promise<string|null>} - Token làm mới hoặc null nếu không tìm thấy
   */
  async getRefreshToken() {
    try {
      const token = await AsyncStorage.getItem('refreshToken');
      console.log('Retrieved refresh token:', token);
      return token;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Xóa token khỏi AsyncStorage
   */
  async removeTokens() {
    try {
      console.log('Removing tokens from storage');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      
      // Verify tokens were removed
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      console.log('Tokens after removal:', { accessToken, refreshToken });
      
      return true;
    } catch (error) {
      console.error('Error removing tokens:', error);
      return false;
    }
  },

  /**
   * Kiểm tra xem token có hợp lệ không
   * @returns {boolean} - true nếu token hợp lệ, false nếu không
   */
  async isTokenValid() {
    try {
      const token = await this.getAccessToken();
      
      if (!token) {
        console.log('No token available for validation');
        return false;
      }

      const payload = this.parseJwt(token);
      console.log('Token payload:', payload);

      if (!payload || !payload.exp) {
        console.log('Invalid token payload');
        return false;
      }

      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      console.log('Token expiration check:', {
        expirationTime,
        currentTime,
        isValid: currentTime < expirationTime
      });

      return currentTime < expirationTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  parseJwt(token) {
    try {
      if (!token) {
        console.log('No token provided for parsing');
        return null;
      }

      // Remove 'Bearer ' if present
      const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      
      const base64Url = actualToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  },

  /**
   * Lấy token đã định dạng để sử dụng trong header Authorization
   * @returns {Promise<string|null>} - Token đã định dạng hoặc null nếu không tìm thấy
   */
  async getFormattedToken() {
    try {
      const token = await this.getAccessToken();
      console.log('Getting formatted token, raw token:', token);
      
      if (!token) {
        console.log('No token found');
        return null;
      }
      
      if (!this.isTokenValid()) {
        console.log('Token is invalid or expired');
        return null;
      }
      
      // Kiểm tra xem token đã có prefix Bearer chưa
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Formatted token:', formattedToken);
      return formattedToken;
    } catch (error) {
      console.error('Error getting formatted token:', error);
      return null;
    }
  }
};

export default TokenService; 