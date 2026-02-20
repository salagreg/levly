// ================================================================
// SettingsScreen - Écran des paramètres
// ================================================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SettingsScreen() {
  // Données mockées de l'utilisateur
  const user = {
    name: "Grégory Sala",
    email: "gregory@levly.com",
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: () => {
            // TODO: Appeler l'API de déconnexion
            router.replace("/auth");
          },
        },
      ]
    );
  };

  const handleProfile = () => {
    Alert.alert("Mon profil", "Fonctionnalité à venir !");
  };

  const handleNotifications = () => {
    Alert.alert("Notifications", "Fonctionnalité à venir !");
  };

  const handleApplications = () => {
    Alert.alert("Applications", "Fonctionnalité à venir !");
  };

  const handleSupport = () => {
    Alert.alert("Aide & Support", "Fonctionnalité à venir !");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Titre */}
        <Text style={styles.title}>Paramètres</Text>

        {/* Sous-titre */}
        <Text style={styles.subtitle}>
          Gérez votre compte et vos préférences
        </Text>

        {/* Carte utilisateur */}
        <View style={styles.userCard}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#5B7EBD" />
          </View>

          {/* Infos */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          <SettingOption
            icon="person-outline"
            iconColor="#5B7EBD"
            title="Mon profil"
            subtitle="Gérer vos informations personnelles"
            onPress={handleProfile}
          />

          <SettingOption
            icon="notifications-outline"
            iconColor="#8B5CF6"
            title="Notifications"
            subtitle="Configurer vos rappels"
            onPress={handleNotifications}
          />

          <SettingOption
            icon="apps"
            iconColor="#10B981"
            title="Applications"
            subtitle="Gérer les intégrations"
            onPress={handleApplications}
          />

          <SettingOption
            icon="help-circle-outline"
            iconColor="#F59E0B"
            title="Aide & Support"
            subtitle="Obtenir de l'aide"
            onPress={handleSupport}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        {/* Bouton déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ================================================================
// Composant SettingOption
// ================================================================

interface SettingOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function SettingOption({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
}: SettingOptionProps) {
  return (
    <TouchableOpacity style={styles.optionCard} onPress={onPress}>
      {/* Icône */}
      <View style={[styles.optionIcon, { backgroundColor: iconColor + "20" }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>

      {/* Contenu */}
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>

      {/* Flèche */}
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1B3A6B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B7EBD",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#5B7EBD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  optionsList: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B3A6B",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  version: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
