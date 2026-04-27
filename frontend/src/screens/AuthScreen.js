// ===============================================================
// AuthScreen - Écran d'authentification
// ===============================================================
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RegisterForm from "../components/auth/RegisterForm";
import LoginForm from "../components/auth/LoginForm";
import { FONTS, COLORS } from "../config/theme";

const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState("connexion");
  const insets = useSafeAreaInsets();

  // ── Animations ──
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-20)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Logo animé ── */}
        <Animated.View
          style={[
            styles.topSection,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          <View style={styles.logoBox}>
            <Image
              source={require("../../assets/images/icone_appli_levly.png")}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Levly</Text>
          <Text style={styles.tagline}>BECOME YOUR BEST SELF</Text>
        </Animated.View>

        {/* ── Sheet animée ── */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              opacity: sheetOpacity,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "inscription" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("inscription")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "inscription" && styles.tabTextActive,
                ]}
              >
                Inscription
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "connexion" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("connexion")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "connexion" && styles.tabTextActive,
                ]}
              >
                Connexion
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulaire scrollable */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.formContent,
              { paddingBottom: insets.bottom + 40 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === "inscription" ? <RegisterForm /> : <LoginForm />}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Top section ──
  topSection: {
    alignItems: "center",
    paddingVertical: 28,
    position: "relative",
  },
  circle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(91,126,189,0.08)",
    top: -40,
    right: -40,
  },
  circle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(91,126,189,0.06)",
    top: 15,
    left: -10,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImg: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  appName: {
    fontSize: 30,
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
    letterSpacing: 2,
  },

  // ── Bottom sheet ──
  bottomSheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
    overflow: "hidden",
  },

  // ── Tabs ──
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
  },
  tabTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },

  // ── Formulaire ──
  formContent: {
    flexGrow: 1,
  },
});

export default AuthScreen;