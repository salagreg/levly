// ================================================================
// Écran Paramètres
// ================================================================

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { logout } from "../services/authService";
import { FONTS, COLORS } from "../config/theme";

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Es-tu sûr de vouloir te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/onboarding/step1");
        },
      },
    ]);
  };

  const handleOptionPress = (option: string) => {
    Alert.alert(
      "Bientôt disponible",
      `${option} sera disponible dans une prochaine version`
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Text style={styles.headerTitle}>Paramètres</Text>
        <Text style={styles.headerSubtitle}>
          Gère ton compte et tes préférences
        </Text>
      </View>

      {/* ── Contenu ── */}
      <View style={styles.bottomSheet}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Compte ── */}
          <Text style={styles.sectionLabel}>Compte</Text>
          <View style={styles.card}>
            <SettingOption
              icon="apps-outline"
              iconColor={COLORS.primary}
              title="Applications"
              subtitle="Gérer les apps connectées"
              onPress={() => router.push("/sync")}
            />
            <SettingOption
              icon="person-outline"
              iconColor={COLORS.primary}
              title="Mon profil"
              subtitle="Informations personnelles"
              onPress={() => handleOptionPress("Mon profil")}
              border
            />
          </View>

          {/* ── Préférences ── */}
          <Text style={styles.sectionLabel}>Préférences</Text>
          <View style={styles.card}>
            <SettingOption
              icon="notifications-outline"
              iconColor="#4CD97B"
              title="Notifications"
              subtitle="Gérer les rappels"
              onPress={() => handleOptionPress("Notifications")}
            />
            <SettingOption
              icon="shield-checkmark-outline"
              iconColor="#F5A623"
              title="Confidentialité"
              subtitle="Sécurité et données"
              onPress={() => handleOptionPress("Confidentialité")}
              border
            />
            <SettingOption
              icon="help-circle-outline"
              iconColor="#FC4C02"
              title="Aide & Support"
              subtitle="FAQ et contact"
              onPress={() => handleOptionPress("Aide & Support")}
              border
            />
          </View>

          {/* ── Déconnexion ── */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Levly v1.0.0</Text>
        </ScrollView>
      </View>
    </View>
  );
};

const SettingOption = ({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  border = false,
}) => (
  <TouchableOpacity
    style={[styles.option, border && styles.optionBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.optionIconBox, { backgroundColor: `${iconColor}18` }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.optionInfo}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.lighter} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Top section ──
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
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
    bottom: -20,
    left: -20,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    lineHeight: 22,
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
  },

  scrollContent: {
    padding: 20,
    gap: 10,
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.medium,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
    marginTop: 6,
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.lighter,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  optionBorder: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lighter,
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionInfo: { flex: 1 },
  optionTitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.dark,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.light,
  },

  // ── Logout ──
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: FONTS.bold,
  },

  // ── Version ──
  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.light,
    marginTop: 4,
  },
});

export default SettingsScreen;
