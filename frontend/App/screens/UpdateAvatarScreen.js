import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const UpdateAvatarScreen = () => {
  const [image, setImage] = useState(null);
  const [userName, setUserName] = useState('Lê Thành');
  const [avatarColor, setAvatarColor] = useState('#4CAF50'); // Default green color
  const [initials, setInitials] = useState('LT');

  // Generate random color for avatar background
  const generateRandomColor = () => {
    const colors = [
      '#F44336', // Red
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#673AB7', // Deep Purple
      '#3F51B5', // Indigo
      '#2196F3', // Blue
      '#03A9F4', // Light Blue
      '#00BCD4', // Cyan
      '#009688', // Teal
      '#4CAF50', // Green
      '#8BC34A', // Light Green
      '#CDDC39', // Lime
      '#FFC107', // Amber
      '#FF9800', // Orange
      '#FF5722', // Deep Orange
      '#795548', // Brown
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generate initials from user name
  const generateInitials = (name) => {
    if (!name) return '';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  // Initialize avatar on component mount
  useEffect(() => {
    setAvatarColor(generateRandomColor());
    setInitials(generateInitials(userName));
  }, [userName]);

  // Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Cập nhật ảnh đại diện</Text>
        <Text style={styles.subtitle}>
          Đặt ảnh đại diện để mọi người dễ nhận ra bạn
        </Text>
        
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Cập nhật</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', 
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  updateButton: {
    backgroundColor: '#304FFE', // Blue
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#333333',
    fontSize: 16,
  },
});

export default UpdateAvatarScreen;