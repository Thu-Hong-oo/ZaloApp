import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../App';
import COLORS from '../components/colors';

const PersonalScreen = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setIsLoggedIn(false);
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderMenuItem = (icon, title, onPress) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <Image
          source={{ 
            uri: userData?.avatar || 
            `https://ui-avatars.com/api/?name=${userData?.fullName || 'U'}&background=random&color=fff&size=256` 
          }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.fullName}>{userData?.fullName || 'Loading...'}</Text>
          <Text style={styles.phoneNumber}>{userData?.phoneNumber || ''}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Tài khoản</Text>
        {renderMenuItem('person-outline', 'Thông tin cá nhân', () => navigation.navigate('ProfileDetail'))}
        {renderMenuItem('key-outline', 'Đổi mật khẩu', () => {})}
        {renderMenuItem('shield-outline', 'Bảo mật và quyền riêng tư', () => {})}
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Cài đặt</Text>
        {renderMenuItem('notifications-outline', 'Thông báo', () => {})}
        {renderMenuItem('moon-outline', 'Giao diện', () => {})}
        {renderMenuItem('language-outline', 'Ngôn ngữ', () => {})}
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Khác</Text>
        {renderMenuItem('help-circle-outline', 'Trợ giúp & phản hồi', () => {})}
        {renderMenuItem('information-circle-outline', 'Về ứng dụng', () => {})}
        {renderMenuItem('log-out-outline', 'Đăng xuất', handleLogout)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    padding: 8,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingVertical: 10,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default PersonalScreen;
