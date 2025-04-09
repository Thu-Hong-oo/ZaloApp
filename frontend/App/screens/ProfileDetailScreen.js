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
    fullName: '',
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
          fullName: parsedData.fullName || '',
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
        // Lấy uri và các thông tin khác từ asset
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop();
        const fileType = asset.uri.endsWith('.png') ? 'image/png' : (
                          asset.uri.endsWith('.gif') ? 'image/gif' : (
                          asset.uri.endsWith('.webp') ? 'image/webp' : 'image/jpeg'));
        
        // Log để debug
        console.log('Selected image:', {
          uri: asset.uri,
          type: fileType,
          name: fileName
        });
        
        // Lưu trữ thông tin ảnh
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

      const response = await UserService.updateProfile({
        ...editedData,
        dateOfBirth: editedData.dateOfBirth.toISOString(),
        phoneNumber: userData.phoneNumber // Thêm phoneNumber từ userData hiện tại
      });

      if (response.success) {
        // Cập nhật AsyncStorage
        const updatedUserData = {
          ...userData,
          ...editedData,
          dateOfBirth: editedData.dateOfBirth.toISOString()
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

          <View style={styles.modalButtonContainer}>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (isEditing) {
              Alert.alert(
                'Xác nhận',
                'Bạn có muốn hủy các thay đổi?',
                [
                  {
                    text: 'Tiếp tục chỉnh sửa',
                    style: 'cancel'
                  },
                  {
                    text: 'Hủy thay đổi',
                    onPress: () => {
                      setIsEditing(false);
                      loadUserData();
                    }
                  }
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.editButtonText}>
              {isEditing ? 'Lưu' : 'Sửa'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: typeof editedData.avatar === 'object' && editedData.avatar.uri ? 
                   editedData.avatar.uri : 
                   (editedData.avatar || `https://ui-avatars.com/api/?name=${editedData.fullName || 'U'}&background=random&color=fff&size=256`) 
            }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={handlePickImage}
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedData.fullName}
                onChangeText={(text) => setEditedData(prev => ({ ...prev, fullName: text }))}
                placeholder="Nhập họ và tên"
              />
            ) : (
              <Text style={styles.value}>{userData?.fullName || 'Chưa cập nhật'}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            {isEditing ? (
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDateModal(true)}
              >
                <Text style={styles.datePickerText}>
                  {formatDate(editedData.dateOfBirth)}
                </Text>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>
                {userData?.dateOfBirth ? formatDate(new Date(userData.dateOfBirth)) : 'Chưa cập nhật'}
              </Text>
            )}
          </View>

          {/* Gender */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Giới tính</Text>
            {isEditing ? (
              <TouchableOpacity
                style={styles.genderButton}
                onPress={() => setShowGenderModal(true)}
              >
                <Text style={styles.genderButtonText}>
                  {editedData.gender || 'Chọn giới tính'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>{userData?.gender || 'Chưa cập nhật'}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {renderDateModal()}
      {renderGenderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
  },
  changeAvatarButton: {
    position: 'absolute',
    right: '35%',
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  form: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  formGroup: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedOption: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 15,
  },
  modalCancelText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ProfileDetailScreen; 