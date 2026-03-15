// ================================================================
// Écran des paramètres
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { logout } from "../services/authService";

const BLUE = "#5B7EBD";
const BG = "#E8EDF6";

const SettingsScreen = () => {
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
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
    <View style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>
            Gérez votre compte et vos préférences
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <SettingOption
            icon="apps-outline"
            iconColor={BLUE}
            title="Applications"
            subtitle="Gérer les applications connectées"
            onPress={() => router.push("/sync")}
          />
          <SettingOption
            icon="person-outline"
            iconColor={BLUE}
            title="Mon profil"
            subtitle="Informations personnelles"
            onPress={() => handleOptionPress("Mon profil")}
            border
          />
          <SettingOption
            icon="notifications-outline"
            iconColor="#1DB954"
            title="Notifications"
            subtitle="Gérer les rappels"
            onPress={() => handleOptionPress("Notifications")}
            border
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Levly v1.0.0</Text>
      </ScrollView>
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
    <Ionicons name="chevron-forward" size={18} color="#C8D7EE" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: BLUE,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#1A3A6B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 18,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  optionBorder: {
    borderTopWidth: 0.5,
    borderTopColor: "#E8EDF6",
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionInfo: { flex: 1 },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#9AAED4",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#B0C4DE",
  },
});

export default SettingsScreen;
