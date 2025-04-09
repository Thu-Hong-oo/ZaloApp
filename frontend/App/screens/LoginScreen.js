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
  StatusBar
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

  const handleLogin = async () => {
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    try {
      setLoading(true);

      const response = await AuthService.login(phoneNumber, password);
      console.log('Login response:', response);

      if (response.success) {
        console.log('Login successful, saving user data...');
        // Lưu thông tin user
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        console.log('Setting logged in state to true...');
        // Cập nhật trạng thái đăng nhập và tự động chuyển sang BottomTabs
        setIsLoggedIn(true);
        
    
      } else {
        Alert.alert('Lỗi', response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Có lỗi xảy ra khi đăng nhập'
      );
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
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
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
});

export default LoginScreen;