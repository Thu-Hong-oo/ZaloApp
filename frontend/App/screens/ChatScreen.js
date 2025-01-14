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

export default function GroupScreen() {
  const groups = [
    {
      id: 1,
      name: "[05] SẢN SALE CÙNG YU...",
      message: "[Hình ảnh] Lựa đơn sớm theo lịch đêm...",
      time: "47 phút",
      members: 83,
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6f9f7fafd3476f193656.jpg-AIojiglZ54unyt5ssBKrOvRfa3FOiv.jpeg",
    },
    {
      id: 2,
      name: "Công nghệ mới 😭",
      message: "mình cần chọn 1 ngày có định họp nhóm...",
      time: "2 giờ",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6f9f7fafd3476f193656.jpg-AIojiglZ54unyt5ssBKrOvRfa3FOiv.jpeg",
    },
    // Add more groups as needed
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
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Nhóm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>OA</Text>
        </TouchableOpacity>
      </View>

      {/* Create New Group Button */}
      <TouchableOpacity style={styles.createGroup}>
        <View style={styles.createGroupIcon}>
          <Ionicons name="people" size={24} color="#1877f2" />
          <Ionicons
            name="add"
            size={16}
            color="#1877f2"
            style={styles.addIcon}
          />
        </View>
        <Text style={styles.createGroupText}>Tạo nhóm mới</Text>
      </TouchableOpacity>

      {/* Groups List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Nhóm đang tham gia (83)</Text>
        <TouchableOpacity>
          <Text style={styles.sortButton}>↓ Sắp xếp</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.groupList}>
        {groups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.groupItem}>
            <Image source={{ uri: group.avatar }} style={styles.groupAvatar} />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupMessage}>{group.message}</Text>
            </View>
            <Text style={styles.groupTime}>{group.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1877f2",
  },
  tabText: {
    color: "#666",
    fontSize: 16,
  },
  activeTabText: {
    color: "#1877f2",
    fontWeight: "500",
  },
  createGroup: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  createGroupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e7f3ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addIcon: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "#e7f3ff",
    borderRadius: 8,
  },
  createGroupText: {
    fontSize: 16,
    color: "#000",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  sortButton: {
    color: "#666",
  },
  groupList: {
    flex: 1,
  },
  groupItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  groupMessage: {
    color: "#666",
  },
  groupTime: {
    color: "#666",
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeNavText: {
    color: "#1877f2",
  },
  navBadge: {
    position: "absolute",
    top: -2,
    right: 20,
    backgroundColor: "#1877f2",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
});
