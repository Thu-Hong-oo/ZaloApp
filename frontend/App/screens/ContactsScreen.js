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

export default function ContactsScreen() {
  const quickAccess = [
    {
      id: 1,
      icon: "people",
      title: "Lời mời kết bạn",
      count: 5,
      color: "#1877f2",
    },
    {
      id: 2,
      icon: "phone-portrait",
      title: "Danh bạ máy",
      subtitle: "Các liên hệ có dùng Zalo",
      color: "#1877f2",
    },
    {
      id: 3,
      icon: "gift",
      title: "Sinh nhật",
      color: "#1877f2",
    },
  ];

  const contacts = [
    {
      id: 1,
      name: "_Tre 🌴",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2a71df177fe5c3bb9af4.jpg-4H0hgbCfFquIv3dgBo2E4mwTjX0Nk4.jpeg",
      section: "#",
    },
    {
      id: 2,
      name: "An",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2a71df177fe5c3bb9af4.jpg-4H0hgbCfFquIv3dgBo2E4mwTjX0Nk4.jpeg",
      section: "A",
    },
    {
      id: 3,
      name: "Anh Em Nhà Táo",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2a71df177fe5c3bb9af4.jpg-4H0hgbCfFquIv3dgBo2E4mwTjX0Nk4.jpeg",
      business: true,
      section: "A",
    },
    {
      id: 4,
      name: "Ánh Như",
      avatar:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2a71df177fe5c3bb9af4.jpg-4H0hgbCfFquIv3dgBo2E4mwTjX0Nk4.jpeg",
      section: "A",
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
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Nhóm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>OA</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Access */}
        {quickAccess.map((item) => (
          <TouchableOpacity key={item.id} style={styles.quickAccessItem}>
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: `${item.color}20` },
              ]}
            >
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.quickAccessInfo}>
              <Text style={styles.quickAccessTitle}>
                {item.title}
                {item.count && (
                  <Text style={styles.count}> ({item.count})</Text>
                )}
              </Text>
              {item.subtitle && (
                <Text style={styles.quickAccessSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Filters */}
        <View style={styles.filters}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Tất cả 173</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonOutline]}
          >
            <Text style={styles.filterTextOutline}>Mới truy cập</Text>
          </TouchableOpacity>
        </View>

        {/* Contacts List */}
        {contacts.map((contact, index) => (
          <React.Fragment key={contact.id}>
            {(index === 0 ||
              contacts[index - 1].section !== contact.section) && (
              <Text style={styles.section}>{contact.section}</Text>
            )}
            <View style={styles.contactItem}>
              <Image source={{ uri: contact.avatar }} style={styles.avatar} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.business && (
                  <View style={styles.businessTag}>
                    <Text style={styles.businessText}>Business</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="call-outline" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="videocam-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </React.Fragment>
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
    backgroundColor: "#0068FF",
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
  content: {
    flex: 1,
  },
  quickAccessItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  quickAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickAccessInfo: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  quickAccessSubtitle: {
    color: "#666",
    marginTop: 4,
  },
  count: {
    color: "#666",
  },
  filters: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterText: {
    color: "#000",
  },
  filterTextOutline: {
    color: "#666",
  },
  section: {
    backgroundColor: "#f0f2f5",
    padding: 8,
    paddingLeft: 16,
    color: "#666",
  },
  contactItem: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
  },
  businessTag: {
    backgroundColor: "#e7f3ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  businessText: {
    color: "#1877f2",
    fontSize: 12,
  },
  actionButton: {
    padding: 8,
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
    backgroundColor: "#1877f2",
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
