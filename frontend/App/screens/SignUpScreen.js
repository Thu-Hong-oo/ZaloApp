import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PhoneInputScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [socialTermsAgreed, setSocialTermsAgreed] = useState(false);

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
            (termsAgreed && socialTermsAgreed && phoneNumber) ? styles.continueButtonActive : {}
          ]}
          disabled={!(termsAgreed && socialTermsAgreed && phoneNumber)}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
      
      {/* Login link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          Bạn đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập ngay</Text>
        </Text>
      </View>
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
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
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
    backgroundColor: '#E8E8E8',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  continueButtonActive: {
    backgroundColor: '#0068FF',
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
});