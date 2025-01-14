import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "./components/colors";
import "@expo/metro-runtime";

import Chat from "./screens/ChatScreen";
import Contacts from "./screens/ContactsScreen";
import Explore from "./screens/ExploreScreen";
import Journal from "./screens/JournalScreen";
import Personal from "./screens/PersonalScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Chat stack
function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}
// Contacts stack
function ContactsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Contacts" component={Contacts} />
    </Stack.Navigator>
  );
}

// Explore stack
function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore" component={Explore} />
    </Stack.Navigator>
  );
}

// Journal stack
function JournalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Journal" component={Journal} />
    </Stack.Navigator>
  );
}

// Personal stack
function PersonalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Personal" component={Personal} />
    </Stack.Navigator>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "ChatTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "ContactsTab") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "ExploreTab") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "JournalTab") {
            iconName = focused ? "timetime" : "time-outline";
          } else if (route.name === "PersonalTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{ title: "Tin nhắn", headerShown: false }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={ContactsStack}
        options={{ title: "Danh bạ", headerShown: false }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{ title: "Nhật ký", headerShown: false }}
      />
      <Tab.Screen
        name="JournalTab"
        component={JournalStack}
        options={{ title: "Nhật ký", headerShown: false }}
      />
      <Tab.Screen
        name="PersonalTab"
        component={PersonalStack}
        options={{ title: "Cá nhân", headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
}
