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
import {useNavigation} from '@react-navigation/native';
import { AuthContext } from '../App';
import authService from '../services/auth-service';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const { setIsLoggedIn, setToken, setRefreshToken, setUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending OTP for phone:', phoneNumber);
      const response = await authService.sendRegistrationOTP(phoneNumber);
      console.log('OTP sent successfully:', response);
      setShowOTPInput(true);
      Alert.alert('Thành công', 'OTP đã được gửi đến số điện thoại của bạn');
    } catch (error) {
      console.error('Error in handleSendOTP:', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi gửi OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập OTP');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.loginWithPhone(phoneNumber, otp);
      
      // Lưu token và refresh token
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi xác thực OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     {/* <StatusBar barStyle="light-content" backgroundColor="#0068FF" /> */}
      
      {/* Header with solid Zalo blue color */}
      <View style={styles.header}>
        {/* Header content */}
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
          </Text>
        </View>

        {/* Phone number input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!showOTPInput}
          />
          {phoneNumber.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setPhoneNumber('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
       
        </View>

        {showOTPInput && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
          </View>
        )}

        {/* Submit button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={showOTPInput ? handleVerifyOTP : handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {showOTPInput ? 'Xác thực OTP' : 'Gửi OTP'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Forgot password link */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Lấy lại mật khẩu</Text>
        </TouchableOpacity>

        {/* FAQ link */}
        <View style={styles.faqContainer}>
          <TouchableOpacity style={styles.faqButton}>
            <Text style={styles.faqText}>Câu hỏi thường gặp</Text>
            <Text style={styles.faqArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#1877f2', // Màu xanh của Zalo
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  instructionContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  instructionText: {
    color: '#424242',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 15,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#9E9E9E',
    fontSize: 18,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    // Thêm hiệu ứng đổ bóng cho container
    shadowColor: '#1877f2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButton: {
    width: 150,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4293f5',
    elevation: 8, 
  },
  
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 32,  // Kích thước lớn hơn để dễ căn chỉnh
    fontWeight: 'bold',
    textAlign: 'center', 
    textAlignVertical: 'center', // Dành cho Android
    includeFontPadding: false,  // Loại bỏ padding thừa trên Android
    lineHeight: 36, // Phải gần bằng fontSize hoặc lớn hơn một chút
  },
  forgotPasswordContainer: {
    marginTop: 15,
    marginLeft: 15,
  },
  forgotPasswordText: {
    color: '#0068FF', // Màu xanh của Zalo
    fontSize: 16,
  },
  faqContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  faqText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  faqArrow: {
    color: '#9E9E9E',
    fontSize: 18,
    marginLeft: 5,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: '#0068FF',
    fontSize: 16,
  },
});

export default LoginScreen;