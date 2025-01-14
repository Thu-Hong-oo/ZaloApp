import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const menuItems = [
    {
      id: 1,
      icon: "brush",
      title: "zStyle – Nổi bật trên Zalo",
      subtitle: "Hình nền và nhạc cho cuộc gọi Zalo",
      color: "#1877f2",
    },
    {
      id: 2,
      icon: "qr-code",
      title: "Ví QR",
      subtitle: "Lưu trữ và xuất trình các mã QR quan trọng",
      color: "#1877f2",
    },
    {
      id: 3,
      icon: "cloud",
      title: "Cloud của tôi",
      subtitle: "Lưu trữ các tin nhắn quan trọng",
      color: "#1877f2",
      showArrow: true,
    },
    {
      id: 4,
      icon: "cloud-upload",
      title: "zCloud",
      subtitle: "Không gian lưu trữ dữ liệu trên đám mây",
      color: "#1877f2",
      showArrow: true,
    },
    {
      id: 5,
      icon: "time",
      title: "Dữ liệu trên máy",
      subtitle: "Quản lý dữ liệu Zalo của bạn",
      color: "#1877f2",
      showArrow: true,
    },
    {
      id: 6,
      icon: "shield-checkmark",
      title: "Tài khoản và bảo mật",
      color: "#1877f2",
      showArrow: true,
    },
    {
      id: 7,
      icon: "lock-closed",
      title: "Quyền riêng tư",
      color: "#1877f2",
      showArrow: true,
    },
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
        <TouchableOpacity>
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <TouchableOpacity style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Image
              source={{
                uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NyiV3wMhXaD2iykmXUcYyu4sJT0paU.png",
              }}
              style={styles.avatar}
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>Thu Hồng Nguyên</Text>
              <Text style={styles.profileSubtext}>Xem trang cá nhân</Text>
            </View>
          </View>
          <Ionicons name="sync" size={24} color="#1877f2" />
        </TouchableOpacity>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index === 1 && styles.menuItemBorder,
              index === 2 && styles.menuItemBorder,
              index === 4 && styles.menuItemBorder,
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            {item.showArrow && (
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    backgroundColor: "#1877f2",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileText: {
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: "#666",
  },
  menuItem: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemBorder: {
    borderTopWidth: 8,
    borderTopColor: "#f0f2f5",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeNavItem: {
    color: "#1877f2",
  },
  activeNavText: {
    color: "#1877f2",
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: 20,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 6,
  },
});
