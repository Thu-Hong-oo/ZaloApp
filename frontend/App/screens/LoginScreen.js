import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('012345678');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
     {/* <StatusBar barStyle="light-content" backgroundColor="#0068FF" /> */}
      
      {/* Header with solid Zalo blue color */}
      <View style={styles.header}>
        {/* Header content */}
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
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
            value={password}
            onChangeText={setPassword}
            placeholder="Mật khẩu"
            placeholderTextColor="#9E9E9E"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showPasswordText}>HIỆN</Text>
          </TouchableOpacity>
        </View>

        {/* Underline for password field */}
        <View style={styles.passwordUnderline} />

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

        {/* Submit button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>→</Text>
          </TouchableOpacity>
        </View>
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
  showPasswordButton: {
    padding: 5,
  },
  showPasswordText: {
    color: '#9E9E9E',
    fontWeight: 'bold',
  },
  passwordUnderline: {
    height: 2,
    backgroundColor: '#00BFA5',
    marginHorizontal: 15,
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
    width: 65,
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
  
  
});

export default LoginScreen;