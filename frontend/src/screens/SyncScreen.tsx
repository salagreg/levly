// ================================================================
// Écran de synchronisation des applications externes
// ================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  connectStrava,
  connectSpotify,
  getConnectionStatus,
} from "../services/syncService";

const SyncScreen = () => {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const status = await getConnectionStatus();
      setStravaConnected(status.strava);
      setSpotifyConnected(status.spotify);
    } catch (error) {
      console.error("Erreur chargement statut:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStrava = async () => {
    try {
      await connectStrava();
      Alert.alert("Succès", "Strava connecté !");
      await loadConnectionStatus(); // Recharger le statut
    } catch (error) {
      console.error("Erreur connexion Strava:", error);
      Alert.alert("Erreur", "Impossible de connecter Strava");
    }
  };

  const handleConnectSpotify = async () => {
    try {
      await connectSpotify();
      Alert.alert("Succès", "Spotify connecté !");
      await loadConnectionStatus(); // Recharger le statut
    } catch (error) {
      console.error("Erreur connexion Spotify:", error);
      Alert.alert("Erreur", "Impossible de connecter Spotify");
    }
  };

  const handleContinue = () => {
    if (!stravaConnected || !spotifyConnected) {
      Alert.alert(
        "Attention",
        "Il est recommandé de connecter les deux applications pour profiter pleinement de Levly.",
        [
          {
            text: "Continuer quand même",
            onPress: () => router.replace("/duration"),
          },
          { text: "Annuler", style: "cancel" },
        ]
      );
    } else {
      router.replace("/duration");
    }
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
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Synchroniser vos applications</Text>
        <Text style={styles.subtitle}>
          Connectez vos applications pour suivre automatiquement vos routines
        </Text>

        {/* Section Culture */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📚</Text>
            <Text style={styles.sectionTitle}>Culture & Développement</Text>
          </View>

          <AppCard
            name="Spotify"
            icon="musical-notes"
            iconColor="#1DB954"
            connected={spotifyConnected}
            onPress={handleConnectSpotify}
          />
        </View>

        {/* Section Sport */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💪</Text>
            <Text style={styles.sectionTitle}>Sport</Text>
          </View>

          <AppCard
            name="Strava"
            icon="bicycle-outline"
            iconColor="#FC4C02"
            connected={stravaConnected}
            onPress={handleConnectStrava}
          />
        </View>

        {/* Note */}
        <Text style={styles.note}>
          Vous pourrez modifier ces paramètres plus tard
        </Text>
      </View>

      {/* Bouton Continuer */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continuer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ================================================================
// Composant AppCard
// ================================================================
const AppCard = ({ name, icon, iconColor, connected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.appCard,
        connected ? styles.appCardConnected : styles.appCardDisconnected,
      ]}
      onPress={onPress}
      disabled={connected}
    >
      <View style={[styles.appIcon, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={32} color={iconColor} />
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appName}>{name}</Text>
        <Text style={styles.appStatus}>
          {connected ? "Connecté" : "Non connecté"}
        </Text>
      </View>

      {connected ? (
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      ) : (
        <View style={styles.connectButton}>
          <Text style={styles.connectButtonText}>Connecter</Text>
        </View>
      )}
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  appCardConnected: {
    borderColor: "#10B981",
  },
  appCardDisconnected: {
    borderColor: "#E2E8F0",
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  appStatus: {
    fontSize: 14,
    color: "#64748B",
  },
  connectButton: {
    backgroundColor: "#5B7EBD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 24,
  },
  continueButton: {
    backgroundColor: "#5B7EBD",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SyncScreen;
