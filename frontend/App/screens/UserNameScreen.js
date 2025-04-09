import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../App';
import authService from '../services/auth-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenService from '../services/token-service';

const UserNameScreen = ({ route, navigation }) => {
  const { phoneNumber } = route.params || {}; 
  console.log('phoneNumber: ', phoneNumber);
  // Số điện thoại có sẵn (có thể là +84...)
  const [fullName, setFullName] = useState(''); // Trường nhập Họ tên
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setRefreshToken, setUser, setIsLoggedIn } = useContext(AuthContext);

  const formatPhoneNumber = (phoneNumber) => {
    // Nếu số điện thoại bắt đầu bằng +84, thay +84 bằng 0
    if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3); // Thay +84 bằng 0
    }
  
    // Nếu số điện thoại không bắt đầu bằng 0, thêm 0 vào đầu
    if (!phoneNumber.startsWith('0')) {
      return '0' + phoneNumber; // Thêm số 0 vào đầu
    }
  
    return phoneNumber; // Nếu không thay đổi gì thì trả về số điện thoại gốc
  };
  

  const validatePhoneNumber = (phoneNumber) => {
    const phonePattern = /^0[0-9]{9,10}$/; // Kiểm tra số điện thoại bắt đầu bằng 0 và có 10-11 chữ số
    return phonePattern.test(phoneNumber);
  };

  const handleContinue = async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }
  
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert(
        'Mật khẩu không khớp',
        'Mật khẩu và xác nhận mật khẩu không giống nhau. Vui lòng nhập lại.',
        [
          {
            text: 'OK',
            onPress: () => {
              setConfirmPassword(''); // Xóa trường xác nhận mật khẩu
            }
          }
        ]
      );
      return;
    }
  
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại');
      return;
    }
  
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  
    if (!validatePhoneNumber(formattedPhoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại phải bắt đầu bằng số 0 và có 10-11 chữ số');
      return;
    }
  
    try {
      setIsLoading(true);
      console.log('Gửi yêu cầu đăng ký với số điện thoại:', formattedPhoneNumber);
      const response = await authService.completeRegistration({
        phoneNumber: formattedPhoneNumber,
        fullName,
        password,
      });
  
      console.log('Đăng ký thành công, response:', response);
      // Nếu đăng ký thành công, lưu token và chuyển đến màn hình EnterProfileInfor
      if (response.success) {
        console.log('Registration response:', response); // Log toàn bộ response
        console.log('Token from registration:', response.accessToken);
        console.log('Refresh token from registration:', response.refreshToken);
        
        // Lưu token và refresh token vào AsyncStorage sử dụng TokenService
        const tokenSaved = await TokenService.saveTokens(response.accessToken, response.refreshToken);
        console.log('Tokens saved successfully:', tokenSaved);
        
        // Kiểm tra token đã lưu
        const savedToken = await TokenService.getAccessToken();
        console.log('Verified saved token:', savedToken);
        
        await AsyncStorage.setItem('userData', JSON.stringify({
          phoneNumber: formattedPhoneNumber,
          fullName
        }));
        
        // Cập nhật state
        setToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUser({
          phoneNumber: formattedPhoneNumber,
          fullName
        });
        
        // Chuyển đến màn hình EnterProfileInfor để cập nhật thông tin cá nhân
        navigation.navigate('EnterProfileInfor');
      } else {
        Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra khi đăng ký');
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi hoàn tất đăng ký');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Tên người dùng</Text>
        <Text style={styles.subtitle}>
          Nhập tên bạn muốn hiển thị trên Zalo
        </Text>

        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập tên của bạn"
          autoFocus={true}
          maxLength={30}  
        />
        
        {/* Thêm trường nhập mật khẩu */}
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Nhập mật khẩu"
          secureTextEntry={true}  // Đảm bảo mật khẩu được ẩn
          maxLength={20}  // Bạn có thể thay đổi giới hạn chiều dài mật khẩu nếu cần
        />

        {/* Thêm trường xác nhận mật khẩu */}
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Xác nhận mật khẩu"
          secureTextEntry={true}  // Đảm bảo mật khẩu được ẩn
          maxLength={20}  // Giới hạn chiều dài mật khẩu
        />

        <TouchableOpacity
          style={[styles.continueButton, fullName.trim() && password.trim() && confirmPassword.trim() ? styles.continueButtonActive : null]}
          onPress={handleContinue}
          disabled={!fullName.trim() || !password.trim() || !confirmPassword.trim() || isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 16,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,  // Giảm khoảng cách giữa các trường nhập
  },
  continueButton: {
    backgroundColor: '#E8E8E8',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#0068FF',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserNameScreen;
