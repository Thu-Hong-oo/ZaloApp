import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import TestService from '../services/test-service';
import UserService from '../services/user-service';

const TestCorsScreen = () => {
  const [testResult, setTestResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const testCors = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await TestService.testCors();
      setTestResult(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error testing CORS:', err);
    } finally {
      setLoading(false);
    }
  };

  const testProfileUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test data
      const userData = {
        phoneNumber: '0376963677',
        fullName: 'Test User',
        gender: 'Nam',
        dateOfBirth: '1990-01-01',
        avatar: 'https://ui-avatars.com/api/?name=Test+User'
      };
      
      const result = await UserService.updateProfile(userData);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error testing profile update:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>CORS Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Test CORS" 
          onPress={testCors} 
          disabled={loading}
        />
        <View style={styles.buttonSpacer} />
        <Button 
          title="Test Profile Update" 
          onPress={testProfileUpdate} 
          disabled={loading}
        />
      </View>
      
      {loading && <Text style={styles.loading}>Loading...</Text>}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      {testResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 10,
  },
  loading: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  errorText: {
    color: '#d32f2f',
  },
  resultContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 5,
  },
  resultTitle: {
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 5,
  },
  resultText: {
    color: '#388e3c',
  },
});

export default TestCorsScreen; 