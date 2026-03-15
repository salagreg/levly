// ================================================================
// Écran des statistiques
// ================================================================

import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getStats } from "../services/statsService";

const BLUE = "#5B7EBD";
const BG = "#E8EDF6";

const StatsScreen = () => {
  const [weekData, setWeekData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setWeekData(data.weekData);
      setStats(data.stats);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Statistiques</Text>
          <Text style={styles.headerSubtitle}>
            Suivez vos performances hebdomadaires
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : (
          <>
            {/* Semaine */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="calendar-outline" size={20} color="#1A2B4A" />
                <Text style={styles.cardTitle}>Cette semaine</Text>
              </View>
              <View style={styles.weekGraph}>
                {weekData.map((item, index) => (
                  <View key={index} style={styles.dayContainer}>
                    <View
                      style={[
                        styles.dayBox,
                        item.validated ? styles.dayValidated : styles.dayFailed,
                      ]}
                    >
                      <Ionicons
                        name={item.validated ? "checkmark" : "close"}
                        size={16}
                        color="#fff"
                      />
                    </View>
                    <Text style={styles.dayLabel}>{item.day}</Text>
                    <Text style={styles.dateLabel}>{item.date}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Grid stats */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="checkbox-outline"
                iconColor="#1DB954"
                value={stats?.routines_completees || 0}
                label="Routines complétées"
              />
              <StatCard
                icon="time-outline"
                iconColor={BLUE}
                value={stats?.temps_total || "0h 0m"}
                label="Temps total"
              />
              <StatCard
                icon="flame-outline"
                iconColor="#FC4C02"
                value={`${stats?.serie_actuelle || 0}j`}
                label="Série actuelle"
              />
              <StatCard
                icon="stats-chart-outline"
                iconColor="#F5A623"
                value={`${stats?.taux_reussite || 0}%`}
                label="Taux de réussite"
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const StatCard = ({ icon, iconColor, value, label }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBox, { backgroundColor: `${iconColor}18` }]}>
      <Ionicons name={icon} size={26} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
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
  loadingText: {
    textAlign: "center",
    color: "#9AAED4",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
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
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
  },
  weekGraph: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayContainer: {
    alignItems: "center",
    gap: 4,
  },
  dayBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayValidated: { backgroundColor: "#1DB954" },
  dayFailed: { backgroundColor: "#EF4444" },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7A9ABF",
  },
  dateLabel: {
    fontSize: 10,
    color: "#B0C4DE",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    width: "47.5%",
    alignItems: "center",
    gap: 8,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A2B4A",
  },
  statLabel: {
    fontSize: 12,
    color: "#7A9ABF",
    textAlign: "center",
  },
});

export default StatsScreen;
