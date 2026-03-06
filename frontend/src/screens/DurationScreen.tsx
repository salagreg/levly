// ================================================================
// DurationScreen - Définir les durées quotidiennes
// ================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/common/BackButton";
import { getConnectionStatus } from "../services/syncService";
import { updatePilierDuration } from "../services/durationService";

const { width } = Dimensions.get("window");

export default function DurationScreen() {
  // État des connexions
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Durées des applications
  const [spotifyDuration, setSpotifyDuration] = useState(30);
  const [stravaDuration, setStravaDuration] = useState(30);

  // Charger les connexions depuis la DB
  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);

      // Récupérer le statut des connexions depuis la DB
      const status = await getConnectionStatus();

      setSpotifyConnected(status.spotify || false);
      setStravaConnected(status.strava || false);

      // Charger les durées depuis AsyncStorage (backup local)
      const savedSpotifyDuration = await AsyncStorage.getItem(
        "spotifyDuration"
      );
      const savedStravaDuration = await AsyncStorage.getItem("stravaDuration");

      if (savedSpotifyDuration) {
        setSpotifyDuration(parseInt(savedSpotifyDuration));
      }

      if (savedStravaDuration) {
        setStravaDuration(parseInt(savedStravaDuration));
      }
    } catch (error) {
      console.error("❌ Erreur chargement statut:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les connexions. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      // Sauvegarder les durées en base de données
      if (spotifyConnected) {
        await updatePilierDuration("spotify", spotifyDuration);
      }

      if (stravaConnected) {
        await updatePilierDuration("strava", stravaDuration);
      }

      // Sauvegarder aussi dans AsyncStorage (backup local)
      await AsyncStorage.setItem("spotifyDuration", spotifyDuration.toString());
      await AsyncStorage.setItem("stravaDuration", stravaDuration.toString());

      // Naviguer vers le dashboard
      router.replace("/(tabs)");
    } catch (error) {
      console.error("❌ Erreur sauvegarde durées:", error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder les durées. Vérifiez votre connexion."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header avec back button + titre */}
      <View style={styles.header}>
        <BackButton onPress={() => router.push("/sync")} />
        <Text style={styles.headerTitle} adjustsFontSizeToFit numberOfLines={1}>
          Définir les durées
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7EBD" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Message informatif */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#5B7EBD" />
            <Text style={styles.infoText}>
              Définissez la durée quotidienne que vous souhaitez consacrer à
              chaque activité
            </Text>
          </View>

          {/* Section Applications connectées */}
          {(spotifyConnected || stravaConnected) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Applications connectées</Text>

              {/* Spotify */}
              {spotifyConnected && (
                <AppDurationCard
                  name="Spotify"
                  icon="musical-notes"
                  iconColor="#1DB954"
                  duration={spotifyDuration}
                  onDurationChange={setSpotifyDuration}
                />
              )}

              {/* Strava */}
              {stravaConnected && (
                <AppDurationCard
                  name="Strava"
                  icon="bicycle-outline"
                  iconColor="#FC4C02"
                  duration={stravaDuration}
                  onDurationChange={setStravaDuration}
                />
              )}
            </View>
          )}

          {/* Message si aucune app connectée */}
          {!spotifyConnected && !stravaConnected && (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucune application connectée</Text>
              <Text style={styles.emptySubtext}>
                Retournez à l'écran précédent pour connecter Spotify ou Strava
              </Text>
            </View>
          )}

          {/* Bouton Terminé */}
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Terminé</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ================================================================
// Composant AppDurationCard
// ================================================================

interface AppDurationCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  duration: number;
  onDurationChange: (value: number) => void;
}

function AppDurationCard({
  name,
  icon,
  iconColor,
  duration,
  onDurationChange,
}: AppDurationCardProps) {
  return (
    <View style={styles.appCard}>
      {/* Header */}
      <View style={styles.appHeader}>
        <View style={styles.appLeft}>
          <View
            style={[
              styles.appIconContainer,
              { backgroundColor: iconColor + "15" },
            ]}
          >
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <Text style={styles.appName}>{name}</Text>
        </View>
        <Text style={styles.durationValue}>{duration} min</Text>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Durée quotidienne</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={60}
          step={5}
          value={duration}
          onValueChange={onDurationChange}
          minimumTrackTintColor={iconColor}
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={iconColor}
        />
        <View style={styles.sliderMinMax}>
          <Text style={styles.sliderMinMaxText}>10 min</Text>
          <Text style={styles.sliderMinMaxText}>60 min</Text>
        </View>
      </View>
    </View>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B3A6B",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  container: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1B3A6B",
    marginLeft: 12,
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B3A6B",
    marginBottom: 16,
  },
  appCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  appLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B3A6B",
  },
  durationValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B7EBD",
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderMinMax: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderMinMaxText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  finishButton: {
    backgroundColor: "#5B7EBD",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#5B7EBD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
