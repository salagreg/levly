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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { connectStrava, getConnectionStatus } from "../services/syncService";
import { FONTS, COLORS } from "../config/theme";

export default function SyncScreen() {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const status = await getConnectionStatus();
      setStravaConnected(status.strava);
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

  const handleContinue = () => {
    if (!stravaConnected) {
      Alert.alert("Attention", "Connectez Strava pour profiter de Levly.", [
        {
          text: "Continuer quand même",
          onPress: () => router.replace("/duration"),
        },
        { text: "Annuler", style: "cancel" },
      ]);
    } else {
      router.replace("/duration");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Text style={styles.headerTitle}>Connecte tes apps</Text>
        <Text style={styles.headerSubtitle}>
          Tes activités seront détectées automatiquement{"\n"}Zéro friction
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
          {/* ── SPORT ── */}
          <Text style={styles.sectionLabel}>Sport</Text>

          <View style={styles.appCard}>
            <View style={styles.appLeft}>
              <View style={[styles.appIconBox, { backgroundColor: "#FC4C02" }]}>
                <Image
                  source={require("../../assets/images/logo_strava.png")}
                  style={styles.appIconImg}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.appName}>Strava</Text>
                <Text
                  style={[
                    styles.appStatus,
                    stravaConnected && styles.appStatusConnected,
                  ]}
                >
                  {stravaConnected ? "Connecté" : "Non connecté"}
                </Text>
              </View>
            </View>
            {stravaConnected ? (
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={handleConnectStrava}
                activeOpacity={0.8}
              >
                <Text style={styles.connectBtnText}>Connecter</Text>
              </TouchableOpacity>
            )}
          </View>

          <ComingSoonCard
            icon="watch-outline"
            iconBg="#1C1C1E"
            name="Garmin"
            category="Sport"
          />

          {/* ── BIEN-ÊTRE ── */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Bien-être</Text>

          <ComingSoonCard
            icon="moon-outline"
            iconBg="#6C63FF"
            name="Headspace"
            category="Méditation"
          />
          <ComingSoonCard
            icon="leaf-outline"
            iconBg="#2ECC71"
            name="Calm"
            category="Méditation"
          />

          {/* ── CULTURE ── */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Culture</Text>

          <ComingSoonCard
            icon="book-outline"
            iconBg="#E67E22"
            name="Kindle"
            category="Lecture"
          />
          <ComingSoonCard
            icon="school-outline"
            iconBg="#3498DB"
            name="Duolingo"
            category="Apprentissage"
          />

          <Text style={styles.note}>
            Tu pourras modifier ça dans les paramètres
          </Text>
        </ScrollView>

        {/* ── Bouton Continuer ── */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Composant app "bientôt disponible" ──
const ComingSoonCard = ({ icon, iconBg, name, category }) => (
  <View style={[styles.appCard, styles.appCardDisabled]}>
    <View style={styles.appLeft}>
      <View style={[styles.appIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <View>
        <Text style={[styles.appName, { color: COLORS.light }]}>{name}</Text>
        <Text style={styles.comingSoonText}>Partenariat à venir</Text>
      </View>
    </View>
    <View style={styles.comingSoonBadge}>
      <Text style={styles.comingSoonText}>Bientôt</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Top section ──
  topSection: {
    paddingHorizontal: 24,
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
    bottom: -20,
    left: -20,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
    marginBottom: 8,
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
    padding: 24,
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
  },

  // ── App card ──
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.lighter,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  appCardDisabled: {
    opacity: 0.45,
    borderStyle: "dashed",
  },
  appLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appIconImg: { width: 26, height: 26 },
  appName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 2,
  },
  appStatus: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.light,
  },
  appStatusConnected: {
    color: "#4CD97B",
    fontFamily: FONTS.semibold,
  },

  // ── Connected badge ──
  connectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Connect button ──
  connectBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  connectBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: FONTS.bold,
  },

  // ── Coming soon badge ──
  comingSoonBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lighter,
  },
  comingSoonText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
  },

  // ── Note ──
  note: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.light,
    marginTop: 8,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: COLORS.white,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
});
