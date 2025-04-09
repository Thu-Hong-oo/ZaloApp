import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../App';
import AuthService from '../services/auth-service';
import TokenService from '../services/token-service';

const LoginScreen = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordPhone, setForgotPasswordPhone] = useState('');

  const handleLogin = async () => {
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone number format (Vietnamese phone number)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số bắt đầu bằng số 0');
      return;
    }

    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const credentials = {
        phone: phoneNumber,
        password: password
      };
      const response = await AuthService.login(credentials);
      console.log('Login successful:', response);
      setIsLoggedIn(true);

    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Đăng nhập thất bại';
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Kiểm tra nếu số điện thoại chưa được đăng ký
      if (errorMessage.includes('chưa được đăng ký') || errorMessage.includes('không tồn tại')) {
        Alert.alert(
          'Thông báo',
          'Số điện thoại này chưa được đăng ký. Vui lòng đăng ký tài khoản mới.',
          [
            {
              text: 'Đăng ký',
              onPress: () => navigation.navigate('SignUp')
            },
            {
              text: 'Đổi số khác',
              onPress: () => setPhoneNumber('')
            }
          ]
        );
      } else if (errorMessage.includes('Sai mật khẩu')) {
        Alert.alert(
          'Lỗi',
          'Mật khẩu không đúng. Vui lòng thử lại.',
          [
            {
              text: 'Thử lại',
              onPress: () => setPassword('')
            },
            {
              text: 'Quên mật khẩu',
              onPress: () => setShowForgotPasswordModal(true)
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
              onPress: () => {
                setPhoneNumber('');
                setPassword('');
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordPhone) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setLoading(true);
      const response = await AuthService.forgotPassword(forgotPasswordPhone);
      Alert.alert(
        'Thành công',
        'Mật khẩu mới đã được gửi đến số điện thoại của bạn',
        [{ text: 'OK', onPress: () => setShowForgotPasswordModal(false) }]
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lấy lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1877f2" />
      
      {/* Header with solid Zalo blue color */}
      <View style={styles.header}>
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
            onChangeText={(text) => {
              // Chỉ cho phép nhập số
              const numericValue = text.replace(/[^0-9]/g, '');
              // Giới hạn độ dài tối đa 10 chữ số
              if (numericValue.length <= 10) {
                setPhoneNumber(numericValue);
              }
            }}
            keyboardType="phone-pad"
            maxLength={10}
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

        {/* Password input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {password.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setPassword('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit button - circular with arrow */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="arrow-forward" size={28} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Forgot password link */}
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          onPress={() => setShowForgotPasswordModal(true)}
        >
          <Text style={styles.forgotPasswordText}>Lấy lại mật khẩu</Text>
        </TouchableOpacity>

        {/* Forgot Password Modal */}
        <Modal
          visible={showForgotPasswordModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowForgotPasswordModal(false)}
          style={{ pointerEvents: 'box-none' }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Lấy lại mật khẩu</Text>
              <Text style={styles.modalDescription}>
                Vui lòng nhập số điện thoại đã đăng ký để lấy lại mật khẩu
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  value={forgotPasswordPhone}
                  onChangeText={setForgotPasswordPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowForgotPasswordModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  clearButton: {
    padding: 5,
    position: 'absolute',
    right: 15,
  },
  clearButtonText: {
    color: '#9E9E9E',
    fontSize: 18,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    shadowColor: '#1877f2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4293f5',
  },
  forgotPasswordContainer: {
    marginTop: 15,
    marginLeft: 15,
  },
  forgotPasswordText: {
    color: '#1877f2',
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
    color: '#1877f2',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default LoginScreen;