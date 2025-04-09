import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/auth-service';

export default function PhoneInputScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [socialTermsAgreed, setSocialTermsAgreed] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone number format (Vietnamese phone number)
    const phoneRegex = /[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 9 chữ số không tính số 0');
      return;
    }

    if (!termsAgreed || !socialTermsAgreed) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    setShowVerificationModal(true);
  };

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      // Remove +84 prefix before sending to server
      const phoneNumberWithoutPrefix = phoneNumber.replace('+84', '');
      console.log('Sending OTP for phone:', phoneNumberWithoutPrefix);
      const response = await authService.sendOTP(phoneNumberWithoutPrefix);
      console.log('OTP sent successfully:', response);

      // Nếu chưa đăng ký, tiếp tục luồng đăng ký bình thường
      setShowVerificationModal(false);
      navigation.navigate('VerificationCode', { phoneNumber });
    } catch (error) {
      console.error('Error sending OTP:', error);
      let errorMessage = 'Có lỗi xảy ra khi gửi OTP';
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Kiểm tra nếu số điện thoại không tồn tại
      if (errorMessage.includes('chưa được đăng ký') || errorMessage.includes('không tồn tại')) {
        Alert.alert(
          'Thông báo',
          'Số điện thoại này chưa được đăng ký. Vui lòng đăng ký tài khoản mới.',
          [
            {
              text: 'Đăng ký',
              onPress: () => {
                setShowVerificationModal(false);
                navigation.navigate('SignUp');
              }
            },
            {
              text: 'Đổi số khác',
              onPress: () => setShowVerificationModal(false)
            }
          ]
        );
      } else if (errorMessage.includes('đã được đăng ký') || errorMessage.includes('đã tồn tại')) {
        Alert.alert(
          'Thông báo',
          'Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.',
          [
            {
              text: 'Đăng nhập',
              onPress: () => navigation.navigate('Login')
            },
            {
              text: 'Đổi số khác',
              onPress: () => setShowVerificationModal(false)
            }
          ]
        );
      } else {
        Alert.alert(
          'Lỗi',
          errorMessage,
          [
            {
              text: 'Thử lại',
              onPress: () => setShowVerificationModal(false)
            }
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    // Format the phone number with spaces for display
    if (!phone) return '';
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header with back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Nhập số điện thoại</Text>
        
        {/* Phone input */}
        <View style={styles.phoneInputContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+84</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder=""
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              // Chỉ cho phép nhập số
              const numericValue = text.replace(/[^0-9]/g, '');
              // Giới hạn độ dài tối đa 10 chữ số
              if (numericValue.length <= 10) {
                setPhoneNumber(numericValue);
              }
            }}
            maxLength={10}
          />
          {phoneNumber ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setPhoneNumber('')}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {/* Terms checkboxes */}
        <View style={styles.termsContainer}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setTermsAgreed(!termsAgreed)}
          >
            <View style={[styles.checkbox, termsAgreed && styles.checkboxActive]}>
              {termsAgreed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              Tôi đồng ý với các <Text style={styles.blueText}>điều khoản sử dụng Zalo</Text>
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setSocialTermsAgreed(!socialTermsAgreed)}
          >
            <View style={[styles.checkbox, socialTermsAgreed && styles.checkboxActive]}>
              {socialTermsAgreed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              Tôi đồng ý với <Text style={styles.blueText}>điều khoản Mạng xã hội của Zalo</Text>
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Continue button */}
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            (!termsAgreed || !socialTermsAgreed) ? styles.disabledButton : {}
          ]}
          disabled={!termsAgreed || !socialTermsAgreed}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
      
      {/* Login link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Bạn đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setShowVerificationModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  Nhận mã xác thực qua số {'\n'}{phoneNumber}?
                </Text>
                <Text style={styles.modalDescription}>
                  Zalo sẽ gửi mã xác thực cho bạn qua số điện thoại này
                </Text>
                
                <TouchableOpacity
                  style={styles.modalContinueButton}
                  onPress={handleSendOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.modalContinueText}>
                    {isLoading ? 'Đang gửi...' : 'Tiếp tục'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalChangeButton}
                  onPress={() => setShowVerificationModal(false)}
                >
                  <Text style={styles.modalChangeText}>Đổi số khác</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 48,
    marginBottom: 20,
    alignItems: 'center',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    height: '100%',
  },
  countryCodeText: {
    fontSize: 16,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  clearButton: {
    padding: 8,
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0068FF',
    borderColor: '#0068FF',
  },
  termsText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  blueText: {
    color: '#0068FF',
  },
  continueButton: {
    backgroundColor: '#0068FF',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#333',
  },
  footerLink: {
    color: '#0068FF',
    fontWeight: '500',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContinueButton: {
    backgroundColor: '#0068FF',
    borderRadius: 24,
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalContinueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalChangeButton: {
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalChangeText: {
    color: '#666',
    fontSize: 16,
  },
});