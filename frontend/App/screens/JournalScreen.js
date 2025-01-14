import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const contacts = [
  { id: '1', name: 'Ái Vân', letter: 'A' },
  { id: '2', name: 'Ba Nam', letter: 'B' },
  { id: '3', name: 'Bảo Ngọc', letter: 'B' },
  { id: '4', name: 'Bee', letter: 'B' },
  { id: '5', name: 'Boss', letter: 'B' },
  { id: '6', name: 'Cường', letter: 'C' },
];

const ContactsScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.contactItem}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </View>
      <Text style={styles.contactName}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="phone" size={24} color="#1E88E5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="message" size={24} color="#1E88E5" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.letter}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bạn bè..."
          placeholderTextColor="#666"
        />
      </View>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="chat" size={24} color="#666" />
          <Text style={styles.navText}>Tin nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNav]}>
          <Icon name="contacts" size={24} color="#1E88E5" />
          <Text style={[styles.navText, styles.activeText]}>Danh bạ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="apps" size={24} color="#666" />
          <Text style={styles.navText}>Khám phá</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="notifications" size={24} color="#666" />
          <Text style={styles.navText}>Nhật ký</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person" size={24} color="#666" />
          <Text style={styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactName: {
    flex: 1,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeNav: {
    borderTopWidth: 2,
    borderTopColor: '#1E88E5',
  },
  activeText: {
    color: '#1E88E5',
  },
});

export default ContactsScreen;