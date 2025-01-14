import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatListScreen() {
  const chats = [
    {
      id: "1",
      title: "DHKHMT18ATT_QLDA",
      message: "Nguyễn Tuấn Hùng: em có ạ em mới xin...",
      time: "CN",
      avatars: [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
      ],
      memberCount: "51",
    },
    {
      id: "2",
      title: "422000191402_17BTT_HK2_20...",
      message: "Thangdhcn tham gia bằng link nhóm",
      time: "T7",
      avatars: [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
      ],
      memberCount: "52",
    },
    {
      id: "3",
      title: "CNM-HK2-24-25KTPM17BTT-Sa...",
      message: "Trần Thanh Tùng: Lớp mình còn nhóm nào...",
      time: "T4",
      avatars: ["GK"],
      memberCount: "47",
    },
    {
      id: "4",
      title: "IUH HK2 2025 Big Data",
      message: "Huỳnh Nam: [Hình ảnh]",
      time: "T7",
      isGroup: true,
      avatars: [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
      ],
      memberCount: "99+",
    },
    {
      id: "5",
      title: "Cloud của tôi",
      message: "[Hình ảnh]",
      time: "1 phút",
      avatars: [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
      ],
      verified: true,
    },
    {
      id: "6",
      title: "[05] SẢN SALE CÙNG YU...",
      message: "Nguyễn Ngân: MÃ SHOPEE 18H 🌺 KOL ...",
      time: "20 phút",
      isGroup: true,
      avatars: [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1Wnzj5HvHoKmoGtn37ydNzwz3rFIOc.png",
      ],
    },
  ];

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        {item.avatars.length > 1 ? (
          <View style={styles.groupAvatars}>
            {item.avatars.slice(0, 4).map((avatar, index) => (
              <View
                key={index}
                style={[
                  styles.groupAvatarItem,
                  index > 1 && styles.groupAvatarBottom,
                ]}
              >
                {typeof avatar === "string" && avatar.length <= 2 ? (
                  <View style={styles.letterAvatar}>
                    <Text style={styles.letterAvatarText}>{avatar}</Text>
                  </View>
                ) : (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                )}
              </View>
            ))}
            {item.memberCount && (
              <View style={styles.memberCount}>
                <Text style={styles.memberCountText}>{item.memberCount}</Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {typeof item.avatars[0] === "string" &&
            item.avatars[0].length <= 2 ? (
              <View style={styles.letterAvatar}>
                <Text style={styles.letterAvatarText}>{item.avatars[0]}</Text>
              </View>
            ) : (
              <Image
                source={{ uri: item.avatars[0] }}
                style={styles.singleAvatar}
              />
            )}
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#1877f2" />
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {item.isGroup && (
              <Ionicons
                name="people"
                size={16}
                color="#666"
                style={styles.groupIcon}
              />
            )}
            {item.title}
          </Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          <Ionicons name="qr-code" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Ưu tiên</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>
            Khác
            <View style={styles.notificationDot} />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
      />
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
  headerButton: {
    marginLeft: 16,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1877f2",
  },
  tabText: {
    color: "#666",
    fontSize: 16,
    position: "relative",
  },
  activeTabText: {
    color: "#1877f2",
    fontWeight: "500",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff3b30",
  },
  filterButton: {
    marginLeft: "auto",
    padding: 8,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  singleAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupAvatars: {
    width: 50,
    height: 50,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupAvatarItem: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  groupAvatarBottom: {
    marginTop: -2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  letterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  letterAvatarText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  memberCount: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#666",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  memberCountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  groupIcon: {
    marginRight: 4,
  },
  chatTime: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  chatMessage: {
    color: "#666",
    fontSize: 14,
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
