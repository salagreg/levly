// ================================================================
// Écran des paramètres
// ================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getProfile } from "../services/settingsService";
import { logout } from "../services/authService";

const SettingsScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      Alert.alert("Erreur", "Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
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
          onPress: async () => {
            await logout();
            router.replace("/onboarding/step1");
          },
        },
      ]
    );
  };

  const handleOptionPress = (option) => {
    Alert.alert("Fonctionnalité à venir", `${option} sera disponible prochainement`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>
            Gérez votre compte et vos préférences
          </Text>
        </View>

        {/* Carte Utilisateur */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.prenom?.[0]}{profile?.nom?.[0]}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {profile?.prenom} {profile?.nom}
            </Text>
            <Text style={styles.userEmail}>{profile?.email}</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <SettingOption
            icon="person-outline"
            iconColor="#3B82F6"
            title="Mon profil"
            subtitle="Informations personnelles"
            onPress={() => handleOptionPress("Mon profil")}
          />
          <SettingOption
            icon="notifications-outline"
            iconColor="#10B981"
            title="Notifications"
            subtitle="Gérer les rappels"
            onPress={() => handleOptionPress("Notifications")}
          />
          <SettingOption
            icon="shield-checkmark-outline"
            iconColor="#8B5CF6"
            title="Confidentialité"
            subtitle="Sécurité et données"
            onPress={() => handleOptionPress("Confidentialité")}
          />
          <SettingOption
            icon="help-circle-outline"
            iconColor="#F59E0B"
            title="Aide & Support"
            subtitle="FAQ et contact"
            onPress={() => handleOptionPress("Aide & Support")}
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ================================================================
// Composant SettingOption
// ================================================================
const SettingOption = ({ icon, iconColor, title, subtitle, onPress }) => {
  return (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={[styles.optionIcon, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.optionInfo}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#64748B",
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  userCard: {
    backgroundColor: "#5B7EBD",
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5B7EBD",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#E0E7FF",
  },
  optionsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SettingsScreen;
