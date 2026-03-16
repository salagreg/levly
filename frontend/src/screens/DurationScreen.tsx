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
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getConnectionStatus } from "../services/syncService";
import { updatePilierDuration } from "../services/durationService";

const BLUE = "#5B7EBD";
const BG = "#E8EDF6";

const APP_LOGOS: Record<string, any> = {
  spotify: require("../../assets/images/logo_spotify.png"),
  strava: require("../../assets/images/logo_strava.png"),
};

const APP_BG: Record<string, string> = {
  spotify: "#191414",
  strava: "#FC4C02",
};

const APP_COLORS: Record<string, string> = {
  spotify: "#1DB954",
  strava: "#FC4C02",
};

export default function DurationScreen() {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spotifyDuration, setSpotifyDuration] = useState(30);
  const [stravaDuration, setStravaDuration] = useState(30);

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const status = await getConnectionStatus();
      setSpotifyConnected(status.spotify || false);
      setStravaConnected(status.strava || false);
      const savedSpotify = await AsyncStorage.getItem("spotifyDuration");
      const savedStrava = await AsyncStorage.getItem("stravaDuration");
      if (savedSpotify) setSpotifyDuration(parseInt(savedSpotify));
      if (savedStrava) setStravaDuration(parseInt(savedStrava));
    } catch {
      Alert.alert("Erreur", "Impossible de charger les connexions.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      if (spotifyConnected)
        await updatePilierDuration("spotify", spotifyDuration);
      if (stravaConnected) await updatePilierDuration("strava", stravaDuration);
      await AsyncStorage.setItem("spotifyDuration", spotifyDuration.toString());
      await AsyncStorage.setItem("stravaDuration", stravaDuration.toString());
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder les durées.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header — même structure que les autres écrans */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerContent}>
          {/* Ligne back + titre sur la même ligne comme iOS natif */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.push("/sync")}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Définir les durées</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Personnalisez vos objectifs quotidiens
          </Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Info */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={BLUE} />
              <Text style={styles.infoText}>
                Définissez la durée quotidienne à consacrer à chaque activité
              </Text>
            </View>

            {/* Apps */}
            {(spotifyConnected || stravaConnected) && (
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="grid" size={20} color="#1A2B4A" />
                  <Text style={styles.cardTitle}>Applications connectées</Text>
                </View>

                {spotifyConnected && (
                  <AppDurationCard
                    appKey="spotify"
                    name="Spotify"
                    duration={spotifyDuration}
                    onDurationChange={setSpotifyDuration}
                    border={false}
                  />
                )}
                {stravaConnected && (
                  <AppDurationCard
                    appKey="strava"
                    name="Strava"
                    duration={stravaDuration}
                    onDurationChange={setStravaDuration}
                    border={spotifyConnected}
                  />
                )}
              </View>
            )}

            {!spotifyConnected && !stravaConnected && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#C8D7EE"
                />
                <Text style={styles.emptyText}>
                  Aucune application connectée
                </Text>
                <Text style={styles.emptySubtext}>
                  Retournez à l'écran précédent pour connecter Spotify ou Strava
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Bouton collé en bas */}
          <SafeAreaView edges={["bottom"]} style={styles.footer}>
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <Text style={styles.finishButtonText}>Terminé</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </>
      )}
    </View>
  );
}

interface AppDurationCardProps {
  appKey: string;
  name: string;
  duration: number;
  onDurationChange: (value: number) => void;
  border: boolean;
}

function AppDurationCard({
  appKey,
  name,
  duration,
  onDurationChange,
  border,
}: AppDurationCardProps) {
  const logo = APP_LOGOS[appKey];
  const bg = APP_BG[appKey];
  const color = APP_COLORS[appKey];

  return (
    <View style={[styles.appRow, border && styles.appRowBorder]}>
      <View style={styles.appTop}>
        <View style={styles.appLeft}>
          <View style={[styles.appIconBox, { backgroundColor: bg }]}>
            <Image
              source={logo}
              style={styles.appIconImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>{name}</Text>
        </View>
        <Text style={[styles.durationValue, { color }]}>{duration} min</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={10}
        maximumValue={60}
        step={5}
        value={duration}
        onValueChange={onDurationChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#E8EDF6"
        thumbTintColor={color}
      />
      <View style={styles.sliderMinMax}>
        <Text style={styles.sliderMinMaxText}>10 min</Text>
        <Text style={styles.sliderMinMaxText}>60 min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────
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
    paddingTop: 12,
    paddingBottom: 32,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    paddingLeft: 40, // aligné sous le titre
  },

  // ── Loading ─────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#9AAED4", fontSize: 15 },

  // ── Scroll ──────────────────────────────────────────────
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // ── Info card ───────────────────────────────────────────
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: BLUE,
    lineHeight: 20,
  },

  // ── Card ────────────────────────────────────────────────
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
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8EDF6",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
  },

  // ── App rows ────────────────────────────────────────────
  appRow: { paddingVertical: 14 },
  appRowBorder: {
    borderTopWidth: 0.5,
    borderTopColor: "#E8EDF6",
  },
  appTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  appLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appIconImg: { width: 24, height: 24 },
  appName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
  },
  durationValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  slider: { width: "100%", height: 36 },
  sliderMinMax: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderMinMaxText: { fontSize: 11, color: "#B0C4DE" },

  // ── Empty ───────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 15, color: "#7A9ABF", fontWeight: "500" },
  emptySubtext: {
    fontSize: 13,
    color: "#9AAED4",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // ── Footer collé en bas ─────────────────────────────────
  footer: {
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  finishButton: {
    backgroundColor: BLUE,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
