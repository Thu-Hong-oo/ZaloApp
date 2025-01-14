import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ExploreScreen() {
  const menuItems = [
    {
      id: 1,
      title: "Zalo Video",
      icon: "play",
      color: "#FF3B30",
    },
    {
      id: 2,
      title: "Game Center",
      icon: "game-controller",
      color: "#34C759",
      showArrow: true,
    },
    {
      id: 3,
      title: "Tiện ích đời sống",
      subtitle: "Nạp điện thoại, Đổ vé số, Lịch bóng đá, ...",
      icon: "calendar",
      color: "#FF9500",
      showArrow: true,
    },
    {
      id: 4,
      title: "Tiện ích tài chính",
      icon: "grid",
      color: "#FF2D55",
    },
    {
      id: 5,
      title: "Dịch vụ công",
      icon: "business",
      color: "#007AFF",
    },
    {
      id: 6,
      title: "Mini App",
      icon: "layers",
      color: "#5856D6",
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
          <Ionicons name="qr-code" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index === menuItems.length - 1 && styles.lastMenuItem,
              (index === 0 || index === menuItems.length - 1) &&
                styles.standAloneItem,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${item.color}15` },
              ]}
            >
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              )}
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
    backgroundColor: "#F2F2F7",
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  standAloneItem: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
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
    backgroundColor: "#FF3B30",
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
