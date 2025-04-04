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

const EnterNameScreen = () => {
  const [zaloName, setZaloName] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Nhập tên Zalo</Text>
        <Text style={styles.subtitle}>
          Hãy dùng tên thật để mọi người dễ nhận ra bạn
        </Text>
        
        {/* Input field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={zaloName}
            onChangeText={setZaloName}
           
          />
          {zaloName.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setZaloName('')}
            >
              <View style={styles.clearButtonCircle}>
                <Text style={styles.clearButtonText}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Requirements */}
        <View style={styles.requirementsContainer}>
          <View style={styles.requirementItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.requirementText}>Dài từ 2 đến 40 ký tự</Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.requirementText}>Không chứa ký tự đặc biệt</Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.requirementText}>
              Cần tuân thủ <Text style={styles.blueText}>quy định đặt tên Zalo</Text>
            </Text>
          </View>
        </View>
      </View>
      
      {/* Continue button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requirementsContainer: {
    marginTop: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    color: '#757575',
    marginRight: 5,
    fontSize: 14,
  },
  requirementText: {
    color: '#757575',
    fontSize: 14,
  },
  blueText: {
    color: '#0068FF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: '#0068FF',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EnterNameScreen;