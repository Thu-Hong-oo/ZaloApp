import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../services/user-service';
import TokenService from '../services/token-service';
import COLORS from '../components/colors';

const ProfileDetailScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Form state
  const [editedData, setEditedData] = useState({
    name: '',
    dateOfBirth: new Date(),
    gender: '',
    avatar: ''
  });

  // Date picker state
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('1');
  const [year, setYear] = useState('2000');
  const [showDateModal, setShowDateModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setUserData(parsedData);
        setEditedData({
          name: parsedData.name || '',
          dateOfBirth: parsedData.dateOfBirth ? new Date(parsedData.dateOfBirth) : new Date(),
          gender: parsedData.gender || '',
          avatar: parsedData.avatar || ''
        });
        
        // Set initial date values
        if (parsedData.dateOfBirth) {
          const date = new Date(parsedData.dateOfBirth);
          setDay(date.getDate().toString());
          setMonth((date.getMonth() + 1).toString());
          setYear(date.getFullYear().toString());
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleDateChange = () => {
    const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    setEditedData(prev => ({
      ...prev,
      dateOfBirth: newDate
    }));
    setShowDateModal(false);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để chọn ảnh');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: false
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop();
        const fileType = asset.uri.endsWith('.png') ? 'image/png' : (
                          asset.uri.endsWith('.gif') ? 'image/gif' : (
                          asset.uri.endsWith('.webp') ? 'image/webp' : 'image/jpeg'));
        
        setEditedData(prev => ({
          ...prev,
          avatar: {
            uri: asset.uri,
            type: fileType,
            name: fileName
          }
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Kiểm tra token
      const isValid = await TokenService.isTokenValid();
      if (!isValid) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      // Chỉ gửi trường name
      const response = await UserService.updateProfile({
        name: editedData.name
      });

      if (response.success) {
        // Cập nhật AsyncStorage
        const updatedUserData = {
          ...userData,
          name: editedData.name
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        setIsEditing(false);
        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        navigation.goBack();
      } else {
        Alert.alert('Lỗi', response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN');
  };

  const renderGenderModal = () => (
    <Modal
      visible={showGenderModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGenderModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn giới tính</Text>
          {['Nam', 'Nữ', 'Khác'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={styles.modalOption}
              onPress={() => {
                setEditedData(prev => ({ ...prev, gender }));
                setShowGenderModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                editedData.gender === gender && styles.selectedOption
              ]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowGenderModal(false)}
          >
            <Text style={styles.modalCancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDateModal = () => (
    <Modal
      visible={showDateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDateModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
          
          <View style={styles.dateInputContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Ngày</Text>
              <TextInput
                style={styles.dateTextInput}
                value={day}
                onChangeText={setDay}
                keyboardType="numeric"
                maxLength={2}
                placeholder="DD"
              />
            </View>
            
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Tháng</Text>
              <TextInput
                style={styles.dateTextInput}
                value={month}
                onChangeText={setMonth}
                keyboardType="numeric"
                maxLength={2}
                placeholder="MM"
              />
            </View>
            
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Năm</Text>
              <TextInput
                style={styles.dateTextInput}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
                placeholder="YYYY"
              />
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleDateChange}
            >
              <Text style={styles.modalButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={isEditing ? handlePickImage : null}
        >
          {editedData.avatar?.uri ? (
            <Image
              source={{ uri: editedData.avatar.uri }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Ionicons name="person" size={50} color={COLORS.gray} />
            </View>
          )}
          {isEditing && (
            <View style={styles.avatarEditOverlay}>
              <Ionicons name="camera" size={24} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={editedData.name}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, name: text }))}
              editable={isEditing}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData.phone}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => isEditing && setShowDateModal(true)}
            >
              <Text style={styles.dateText}>
                {formatDate(editedData.dateOfBirth)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <TouchableOpacity
              style={styles.genderButton}
              onPress={() => isEditing && setShowGenderModal(true)}
            >
              <Text style={styles.genderText}>
                {editedData.gender || 'Chọn giới tính'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {renderGenderModal()}
      {renderDateModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: COLORS.black,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
  },
  genderButton: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  genderText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalOptionText: {
    fontSize: 16,
  },
  selectedOption: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    padding: 12,
    marginTop: 8,
  },
  modalCancelText: {
    color: COLORS.gray,
    fontSize: 16,
    textAlign: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  dateTextInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
  },
  defaultAvatar: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileDetailScreen; 