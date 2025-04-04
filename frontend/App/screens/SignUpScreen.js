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
    if (!termsAgreed || !socialTermsAgreed) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    setShowVerificationModal(true);
  };

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      console.log('Sending OTP for phone:', phoneNumber);
      const response = await authService.sendRegistrationOTP(phoneNumber);
      console.log('OTP sent successfully:', response);

      // Kiểm tra nếu số điện thoại đã được đăng ký
      if (response?.message?.includes('đã được đăng ký') || response?.error?.includes('đã tồn tại')) {
        setShowVerificationModal(false);
        Alert.alert(
          'Thông báo',
          'Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.',
          [
            {
              text: 'Đăng nhập',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return;
      }

      // Nếu chưa đăng ký, tiếp tục luồng đăng ký bình thường
      setShowVerificationModal(false);
      navigation.navigate('VerificationCode', { phoneNumber });
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error.response?.data?.message?.includes('đã tồn tại') || 
          error.response?.data?.error?.includes('đã được đăng ký')) {
        Alert.alert(
          'Thông báo',
          'Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.',
          [
            {
              text: 'Đăng nhập',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi gửi OTP');
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
          <TouchableOpacity style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+84</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            placeholder=""
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
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
      <View style={styles.loginContainer}>
        <TouchableOpacity style={styles.loginText} onPress={() => navigation.navigate('Login')}>
          Bạn đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập ngay</Text>
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
  loginContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#333',
  },
  loginLink: {
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