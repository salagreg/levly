// ================================================================
// SyncScreen - Synchroniser les applications
// ================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  connectStrava,
  connectSpotify,
  getConnectionStatus,
} from "../services/syncService";

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

export default function SyncScreen() {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedCulture, setExpandedCulture] = useState(true);
  const [expandedSport, setExpandedSport] = useState(true);

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const status = await getConnectionStatus();
      setStravaConnected(status.strava);
      setSpotifyConnected(status.spotify);
    } catch {
      console.error("Erreur chargement statut");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStrava = async () => {
    try {
      await connectStrava();
      await loadConnectionStatus();
    } catch {
      Alert.alert("Erreur", "Impossible de connecter Strava");
    }
  };

  const handleConnectSpotify = async () => {
    try {
      await connectSpotify();
      await loadConnectionStatus();
    } catch {
      Alert.alert("Erreur", "Impossible de connecter Spotify");
    }
  };

  const handleContinue = () => {
    if (!stravaConnected && !spotifyConnected) {
      Alert.alert(
        "Attention",
        "Connectez au moins une application pour profiter de Levly.",
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

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>
              Synchroniser vos applications
            </Text>
            <Text style={styles.headerSubtitle}>
              Connectez vos apps pour suivre vos routines automatiquement
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Culture & Développement */}
        <View style={styles.card}>
          {/* Header accordéon */}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setExpandedCulture(!expandedCulture)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionEmoji}>📚</Text>
            <Text style={styles.accordionTitle}>Culture & Développement</Text>
            <Ionicons
              name={expandedCulture ? "chevron-up" : "chevron-down"}
              size={18}
              color="#B0C4DE"
            />
          </TouchableOpacity>

          {/* Contenu */}
          {expandedCulture && (
            <View style={styles.accordionContent}>
              <AppRow
                appKey="spotify"
                name="Spotify"
                connected={spotifyConnected}
                onPress={handleConnectSpotify}
              />
            </View>
          )}
        </View>

        {/* Sport */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setExpandedSport(!expandedSport)}
            activeOpacity={0.7}
          >
            <Text style={styles.accordionEmoji}>💪</Text>
            <Text style={styles.accordionTitle}>Sport</Text>
            <Ionicons
              name={expandedSport ? "chevron-up" : "chevron-down"}
              size={18}
              color="#B0C4DE"
            />
          </TouchableOpacity>

          {expandedSport && (
            <View style={styles.accordionContent}>
              <AppRow
                appKey="strava"
                name="Strava"
                connected={stravaConnected}
                onPress={handleConnectStrava}
              />
            </View>
          )}
        </View>

        <Text style={styles.note}>
          Vous pourrez modifier ces paramètres plus tard
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── AppRow ────────────────────────────────────────────────────────
const AppRow = ({ appKey, name, connected, onPress }) => (
  <View style={styles.appRow}>
    <View style={[styles.appIconBox, { backgroundColor: APP_BG[appKey] }]}>
      <Image
        source={APP_LOGOS[appKey]}
        style={styles.appIconImg}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.appName}>{name}</Text>

    {connected ? (
      <View style={styles.connectedPill}>
        <Ionicons name="checkmark" size={14} color="#fff" />
        <Text style={styles.connectedText}>Connecté</Text>
      </View>
    ) : (
      <TouchableOpacity style={styles.connectBtn} onPress={onPress}>
        <Text style={styles.connectBtnText}>Se connecter</Text>
      </TouchableOpacity>
    )}
  </View>
);

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
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },

  // ── Scroll ──────────────────────────────────────────────
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },

  // ── Cards accordéon ──────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
  },
  accordionEmoji: { fontSize: 18 },
  accordionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
  },
  accordionContent: {
    borderTopWidth: 0.5,
    borderTopColor: "#E8EDF6",
    paddingHorizontal: 18,
  },

  // ── App row ──────────────────────────────────────────────
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  appIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  appIconImg: { width: 26, height: 26 },
  appName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
  },
  connectedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1DB954",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
  },
  connectedText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  connectBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  connectBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Note ────────────────────────────────────────────────
  note: {
    textAlign: "center",
    fontSize: 13,
    color: "#9AAED4",
  },

  // ── Footer ──────────────────────────────────────────────
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  continueButton: {
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
  continueText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
