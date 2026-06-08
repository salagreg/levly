// ================================================================
// Écran pour définir les durées quotidiennes
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getConnectionStatus } from "../services/syncService";
import { updatePilierDuration } from "../services/durationService";
import { FONTS, COLORS } from "../config/theme";

export default function DurationScreen() {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stravaDuration, setStravaDuration] = useState(30);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const status = await getConnectionStatus();
      setStravaConnected(status.strava || false);
      const savedStrava = await AsyncStorage.getItem("stravaDuration");
      if (savedStrava) setStravaDuration(parseInt(savedStrava));
    } catch {
      Alert.alert("Erreur", "Impossible de charger les connexions.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      if (stravaConnected) {
        await updatePilierDuration("strava", stravaDuration);
        await AsyncStorage.setItem("stravaDuration", stravaDuration.toString());
      }
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder les durées.");
    }
  };

  const tokensBase = stravaDuration;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Bouton retour + titre sur la même ligne */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push("/sync")}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ton objectif</Text>
        </View>

        <Text style={styles.headerSubtitle}>
          Définis la durée quotidienne que tu veux consacrer à chaque activité
        </Text>
      </View>

      {/* ── Contenu ── */}
      <View style={styles.bottomSheet}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + 100 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {stravaConnected ? (
                <View style={styles.card}>
                  {/* App header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.appLeft}>
                      <View
                        style={[
                          styles.appIconBox,
                          { backgroundColor: "#FC4C02" },
                        ]}
                      >
                        <Image
                          source={require("../../assets/images/logo_strava.png")}
                          style={styles.appIconImg}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.appName}>Strava</Text>
                    </View>
                    <Text style={styles.durationValue}>
                      {stravaDuration} min
                    </Text>
                  </View>

                  {/* Slider */}
                  <Slider
                    style={styles.slider}
                    minimumValue={10}
                    maximumValue={60}
                    step={5}
                    value={stravaDuration}
                    onValueChange={setStravaDuration}
                    minimumTrackTintColor="#FC4C02"
                    maximumTrackTintColor={COLORS.lighter}
                    thumbTintColor="#FC4C02"
                  />
                  <View style={styles.sliderMinMax}>
                    <Text style={styles.sliderMinMaxText}>10 min</Text>
                    <Text style={styles.sliderMinMaxText}>60 min</Text>
                  </View>

                  {/* Token preview dynamique */}
                  <View style={styles.tokenPreview}>
                    <View style={styles.tokenRow}>
                      <Text style={styles.tokenLabel}>🪙 Objectif atteint</Text>
                      <Text style={styles.tokenValue}>
                        +{tokensBase} tokens
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.tokenRow}>
                      <Text style={styles.tokenLabel}>
                        ⚡ Bonus dépassement
                      </Text>
                      <Text style={styles.tokenValue}>+0.5 token/min</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={COLORS.lighter}
                  />
                  <Text style={styles.emptyText}>
                    Aucune application connectée
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Retourne à l'écran précédent pour connecter Strava
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* ── Bouton Terminé ── */}
            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinish}
                activeOpacity={0.85}
              >
                <Text style={styles.finishButtonText}>Terminé</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    lineHeight: 22,
    paddingLeft: 48,
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
  },

  // ── Loading ──
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.lighter,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  appLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appIconImg: { width: 28, height: 28 },
  appName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  durationValue: {
    fontSize: 24,
    fontFamily: FONTS.extrabold,
    color: "#FC4C02",
  },

  // ── Slider ──
  slider: { width: "100%", height: 36 },
  sliderMinMax: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
    marginBottom: 4,
  },
  sliderMinMaxText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.light,
  },

  // ── Token preview ──
  tokenPreview: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
  },
  tokenValue: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.lighter,
  },

  // ── Empty ──
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.light,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: COLORS.white,
  },
  finishButton: {
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
  finishButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
});
