import { Platform } from 'react-native';

const LOCAL_IP = '172.16.0.50'; // IP máy tính của bạn (Wi-Fi)
const API_PORT = '8000';

const getApiUrl = () => {
    if (__DEV__) {
        // Kiểm tra nếu đang chạy trên thiết bị thật
        const isPhysicalDevice = Platform.OS === 'android' || Platform.OS === 'ios';
        
        if (isPhysicalDevice) {
            // Dùng IP thật cho thiết bị thật
            const url = `http://${LOCAL_IP}:${API_PORT}/api`;
            console.log('Using physical device URL:', url);
            return url;
        } else {
            // Dùng localhost cho web và simulator
            const url = `http://localhost:${API_PORT}/api`;
            console.log('Using localhost URL:', url);
            return url;
        }
    }
    // Production
    return 'https://your-production-api.com/api';
};

// Tạo và export config object
export const config = {
    API_URL: getApiUrl(),
};

// Log config khi khởi tạo
console.log('App initialized with config:', config);

export default config; 