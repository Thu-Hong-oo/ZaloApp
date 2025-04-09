import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
    const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
 
      
      {/* Language selector */}
      <View style={styles.languageContainer}>
        <TouchableOpacity style={styles.languageSelector}>
          <Text style={styles.languageText}>Tiếng Việt</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>
      
      {/* Zalo logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Zalo</Text>
      </View>
      
    
      
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.cityBackground}>
          {/* Simple city outline background */}
          <View style={styles.cityOutline} />
        </View>
        
        <View style={styles.callIllustration}>
          <View style={styles.dashedCircle}>
            {/* User avatars */}
            <View style={[styles.userAvatar, styles.userAvatarLeft]}>
              <View style={styles.avatarIcon} />
            </View>
            
            <View style={styles.chatBubble}>
              <View style={styles.phoneIcon} />
            </View>
            
            <View style={[styles.userAvatar, styles.userAvatarRight]}>
              <View style={styles.avatarIcon} />
            </View>
            
            {/* Arrows */}
            <View style={[styles.arrow, styles.arrowTopRight]} />
            <View style={[styles.arrow, styles.arrowBottomRight]} />
            <View style={[styles.arrow, styles.arrowBottomLeft]} />
            <View style={[styles.arrow, styles.arrowTopLeft]} />
          </View>
        </View>
      </View>
      
      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Gọi video ổn định</Text>
        <Text style={styles.subtitle}>
          Trò chuyện thật đã với chất lượng video ổn định mọi lúc, mọi nơi
        </Text>
      </View>
      
      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.paginationDot, styles.activeDot]} />
        <View style={styles.paginationDot} />
        <View style={styles.paginationDot} />
        <View style={styles.paginationDot} />
        <View style={styles.paginationDot} />
      </View>
      
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.8} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerButton} activeOpacity={0.8} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  timeText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalText: {
    color: '#000000',
    fontSize: 12,
  },
  wifiText: {
    color: '#000000',
    marginLeft: 5,
    fontSize: 12,
  },
  batteryContainer: {
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  batteryText: {
    color: '#000000',
    fontSize: 10,
  },
 
  languageContainer: {
    alignSelf: 'flex-end',  
    marginTop: 10,
    marginRight: 20,  
  },
  
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  languageText: {
    color: '#000000',
    fontSize: 14,
    marginRight: 5,
  },
  dropdownIcon: {
    color: '#000000',
    fontSize: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoText: {
    color: '#0068FF',
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    height: 250,
  },
  cityBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cityOutline: {
    height: 100,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  callIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#AAAAAA',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  userAvatarLeft: {
    left: -10,
    top: 75,
  },
  userAvatarRight: {
    right: -10,
    top: 75,
  },
  avatarIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#BBDEFB',
  },
  chatBubble: {
    width: 80,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#BBDEFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  arrow: {
    width: 10,
    height: 10,
    position: 'absolute',
    backgroundColor: 'transparent',
    borderColor: '#AAAAAA',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  arrowTopRight: {
    top: 40,
    right: 40,
    transform: [{ rotate: '-45deg' }],
  },
  arrowBottomRight: {
    bottom: 40,
    right: 40,
    transform: [{ rotate: '45deg' }],
  },
  arrowBottomLeft: {
    bottom: 40,
    left: 40,
    transform: [{ rotate: '135deg' }],
  },
  arrowTopLeft: {
    top: 40,
    left: 40,
    transform: [{ rotate: '-135deg' }],
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#0068FF',
  },
  buttonContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#0068FF',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  navButton: {
    padding: 10,
  },
  testCorsButton: {
    backgroundColor: '#0068ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  testCorsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OnboardingScreen;