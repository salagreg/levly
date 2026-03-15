// ================================================================
// app/(tabs)/_layout.tsx
// ================================================================

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, Image, StyleSheet, Pressable } from "react-native";

const BLUE = "#5B7EBD";
const INACTIVE = "#B0C4DE";
const TAB_HEIGHT = Platform.OS === "ios" ? 70 : 60;
const BOTTOM_PAD = Platform.OS === "ios" ? 20 : 8;

function LevlyLogo() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require("../../assets/images/icone_appli_levly.png")}
        style={styles.logoImage}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          height: TAB_HEIGHT,
          paddingBottom: BOTTOM_PAD,
          paddingTop: 8,
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          shadowColor: BLUE,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.13,
          shadowRadius: 16,
          elevation: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="levly"
        options={{
          tabBarIcon: () => <LevlyLogo />,
          tabBarButton: (props) => (
            <Pressable
              style={props.style}
              onPress={() => {}}
              android_ripple={null}
            >
              {props.children}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
});