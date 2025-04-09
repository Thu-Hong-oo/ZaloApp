import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/auth-service';

const OTPScreen = ({ route, navigation }) => {
  // Kiểm tra và lấy phoneNumber từ params một cách an toàn
  const phoneNumber = route?.params?.phoneNumber || '';
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Nếu không có phoneNumber, quay lại màn hình trước
  useEffect(() => {
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại');
      navigation.goBack();
    }
  }, [phoneNumber]);

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
  
    try {
      setIsLoading(true);
      console.log('Starting OTP verification for:', phoneNumber);
  
      const response = await authService.verifyOTP(phoneNumber, otp);
      console.log('Server response:', JSON.stringify(response, null, 2));
  
      // Kiểm tra success từ API
      if (response.success) {
        console.log('OTP is valid, navigating to UserName screen...');
  
        // Điều hướng đến màn hình UserName
        navigation.navigate('UserName', { phoneNumber });
      } else {
        // Nếu OTP không hợp lệ, hiển thị thông báo lỗi
        Alert.alert('Thông báo', response?.message || 'Mã OTP không hợp lệ');
      }
    } catch (error) {
      console.error('Error in handleVerifyOTP:', error);
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP'
      );
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      const response = await authService.sendRegistrationOTP(phoneNumber);
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi gửi lại OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Nhập mã xác thực</Text>
        <Text style={styles.subtitle}>
          Mã xác thực đã được gửi đến số {phoneNumber}
        </Text>

        {/* OTP Input */}
        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          placeholder="Nhập mã OTP"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus={true}
        />

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, otp.length === 6 && styles.verifyButtonActive]}
          onPress={handleVerifyOTP}
          disabled={otp.length !== 6 || isLoading}
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Đang xác thực...' : 'Xác thực'}
          </Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={isLoading}
        >
          <Text style={styles.resendButtonText}>Gửi lại mã</Text>
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
  otpInput: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  verifyButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#E8E8E8',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonActive: {
    backgroundColor: '#0068FF',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resendButton: {
    padding: 10,
  },
  resendButtonText: {
    color: '#0068FF',
    fontSize: 16,
  },
});

export default OTPScreen;