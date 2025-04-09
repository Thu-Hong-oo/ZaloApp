import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../services/user-service';
import TokenService from '../services/token-service';
import { AuthContext } from '../App';

const UpdateAvatarScreen = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [defaultAvatar, setDefaultAvatar] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { fullName } = JSON.parse(userData);
        setFullName(fullName);
        setDefaultAvatar(generateDefaultAvatar(fullName));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const generateDefaultAvatar = (name) => {
    if (!name) return '';

    const words = name.trim().split(' ');
    let initials;

    if (words.length === 1) {
      // Nếu chỉ có một từ, lấy chữ cái đầu tiên
      initials = words[0].charAt(0).toUpperCase();
    } else {
      // Nếu có nhiều từ, lấy chữ cái đầu của từ đầu và từ cuối
      const firstInitial = words[0].charAt(0).toUpperCase();
      const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
      initials = `${firstInitial}${lastInitial}`;
    }

    // Tạo URL cho avatar mặc định với initials
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=256`;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để chọn ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại');
    }
  };

  const handleUpdateAvatar = async () => {
    try {
      setLoading(true);

      // Kiểm tra token
      const isValid = await TokenService.isTokenValid();
      if (!isValid) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      // Chuẩn bị dữ liệu cập nhật
      const userData = {
        avatar: avatar || defaultAvatar
      };

      const response = await UserService.updateProfile(userData);
      
      if (response.success) {
        // Lưu thông tin mới vào AsyncStorage
        const currentUserData = await AsyncStorage.getItem('userData');
        const updatedUserData = {
          ...JSON.parse(currentUserData),
          avatar: avatar || defaultAvatar
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        // Set isLoggedIn để chuyển sang BottomTabs
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật ảnh đại diện</Text>
      <Text style={styles.subtitle}>Đặt ảnh đại diện để mọi người dễ nhận ra bạn</Text>

      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: avatar || defaultAvatar }}
          style={styles.avatar}
        />
      </View>

      <TouchableOpacity
        style={styles.pickImageButton}
        onPress={pickImage}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Chọn ảnh từ thư viện</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.updateButton, loading && styles.disabledButton]}
        onPress={handleUpdateAvatar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cập nhật</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => setIsLoggedIn(true)}
        disabled={loading}
      >
        <Text style={styles.skipButtonText}>Bỏ qua</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  avatarContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  pickImageButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default UpdateAvatarScreen;