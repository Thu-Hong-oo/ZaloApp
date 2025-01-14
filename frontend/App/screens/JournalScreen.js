import React from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TimelineScreen() {
  const quickActions = [
    { id: 1, title: 'Ảnh', icon: 'image-outline', color: '#4CAF50' },
    { id: 2, title: 'Video', icon: 'videocam-outline', color: '#E91E63' },
    { id: 3, title: 'Album', icon: 'images-outline', color: '#2196F3' },
    { id: 4, title: 'Kỷ niệm', icon: 'time-outline', color: '#FF9800' },
  ];

  const stories = [
    { id: 1, name: 'Tạo mới', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sqamYjU6BDzT6wDDSAUCug9p96k00s.png', isAdd: true },
    { id: 2, name: 'Hà Hảo', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sqamYjU6BDzT6wDDSAUCug9p96k00s.png' },
    { id: 3, name: 'Gd My Mom...', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sqamYjU6BDzT6wDDSAUCug9p96k00s.png' },
    { id: 4, name: 'Thảo Vy', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sqamYjU6BDzT6wDDSAUCug9p96k00s.png' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#fff" />
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="#fff"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="image" size={24} color="#fff" />
          <Ionicons name="add" size={16} color="#fff" style={styles.addIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Quan tâm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Khác</Text>
          </TouchableOpacity>
        </View>

        {/* Status Update */}
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <Image
              source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sqamYjU6BDzT6wDDSAUCug9p96k00s.png' }}
              style={styles.statusAvatar}
            />
            <Text style={styles.statusPrompt}>Hôm nay bạn thế nào?</Text>
          </View>

          <View style={styles.quickActions}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.actionButton}>
                <Ionicons name={action.icon} size={24} color={action.color} />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stories */}
        <View style={styles.storiesSection}>
          <Text style={styles.sectionTitle}>Khoảnh khắc</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
            {stories.map(story => (
              <TouchableOpacity key={story.id} style={styles.storyItem}>
                <View style={styles.storyImageContainer}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                  {story.isAdd && (
                    <View style={styles.addStoryButton}>
                      <Ionicons name="add" size={24} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={styles.storyName} numberOfLines={1}>{story.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Feed Post */}
        <View style={styles.post}>
          <View style={styles.postHeader}>
            <Image
              source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sqamYjU6BDzT6wDDSAUCug9p96k00s.png' }}
              style={styles.postAvatar}
            />
            <View style={styles.postHeaderInfo}>
              <Text style={styles.postAuthor}>Hà Hảo</Text>
              <Text style={styles.postTime}>8 phút trước</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.postContent}>
            <Text style={styles.postText}>
              💥Nhà hàng Sushi Masa tuyển Bếp Nóng Thời Vụ Tết từ 25-28 ÂL; Mùng 2 - Mùng 5 ÂL{'\n\n'}
              Lương lên đến 120.000 / giờ{'\n\n'}
              YÊU CẦU: Có kinh nghiệm bếp nóng nhà hàng từ 1 năm{'\n'}
              Tuổi: từ 18-30 tuổi...
            </Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Xem thêm</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sqamYjU6BDzT6wDDSAUCug9p96k00s.png' }}
              style={styles.postImage}
            />
          </View>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#1877f2',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
  },
  headerButton: {
    marginLeft: 16,
    position: 'relative',
  },
  addIcon: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#1877f2',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1877f2',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#1877f2',
    fontWeight: '500',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  statusPrompt: {
    color: '#666',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  storiesSection: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  storiesContainer: {
    flexDirection: 'row',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 80,
  },
  storyImageContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addStoryButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1877f2',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: {
    fontSize: 12,
    textAlign: 'center',
  },
  post: {
    backgroundColor: '#fff',
    padding: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '500',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    paddingHorizontal: 4,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  readMore: {
    color: '#666',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavItem: {
    color: '#1877f2',
  },
  activeNavText: {
    color: '#1877f2',
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 20,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 6,
  },
});