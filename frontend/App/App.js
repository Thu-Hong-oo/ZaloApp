import React, { createContext, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "./components/colors";
import "@expo/metro-runtime";

// Import screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ChatScreen from "./screens/ChatScreen";
import Contacts from "./screens/ContactsScreen";
import Explore from "./screens/ExploreScreen";
import Journal from "./screens/JournalScreen";
import Personal from "./screens/PersonalScreen";
import OTPScreen from "./screens/OTPScreen";
import UserNameScreen from "./screens/UserNameScreen";
import EnterProfileInforScreen from "./screens/EnterProfileInforScreen";
import UpdateAvatarScreen from "./screens/UpdateAvatarScreen";
import TestCorsScreen from "./screens/TestCorsScreen";
import ProfileDetailScreen from "./screens/ProfileDetailScreen";
// Create Auth Context
export const AuthContext = createContext(null);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Auth stack
function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'card'
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="VerificationCode" component={OTPScreen} />
      <Stack.Screen 
        name="UserName" 
        component={UserNameScreen}
        options={{
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="EnterProfileInfor" 
        component={EnterProfileInforScreen}
        options={{
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="UpdateAvatar" 
        component={UpdateAvatarScreen}
        options={{
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="TestCors" 
        component={TestCorsScreen}
        options={{
          gestureEnabled: false
        }}
      />
    </Stack.Navigator>
  );
}

// Chat stack
function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={ChatScreen} />
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
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
    </Stack.Navigator>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          const iconSize = focused ? 28 : 24;

          if (route.name === "ChatTab") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "ContactsTab") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "ExploreTab") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "JournalTab") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "PersonalTab") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
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
        options={{ title: "Khám phá", headerShown: false }}
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  const authContext = {
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    token,
    setToken,
    refreshToken,
    setRefreshToken
  };

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {!isLoggedIn ? (
          <AuthStack />
        ) : (
          <BottomTabs />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
