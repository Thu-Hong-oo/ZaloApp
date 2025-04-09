import { Platform } from 'react-native';
import Constants from 'expo-constants';

const LOCAL_IP = '172.16.0.50'; // IP thật của máy tính (Wi-Fi)
const API_PORT = '8000';

const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      // Web chạy trực tiếp trên máy tính
      return `http://localhost:${API_PORT}/api`;
    }

    if (Platform.OS === 'android') {
      if (Constants.isDevice) {
        // Thiết bị Android thật
        return `http://${LOCAL_IP}:${API_PORT}/api`;
      } else {
        // Android emulator dùng 10.0.2.2
        return `http://10.0.2.2:${API_PORT}/api`;
      }
    }

    if (Platform.OS === 'ios') {
      if (Constants.isDevice) {
        // iOS thật
        return `http://${LOCAL_IP}:${API_PORT}/api`;
      } else {
        // iOS simulator dùng localhost
        return `http://localhost:${API_PORT}/api`;
      }
    }

    // Fallback
    return `http://${LOCAL_IP}:${API_PORT}/api`;
  }

  // Production URL
  return 'https://your-production-api.com/api';
};

const config = {
  API_URL: getApiUrl(),
};

console.log('App initialized with config:', config);

export default config;
