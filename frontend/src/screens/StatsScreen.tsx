// ================================================================
// Écran des statistiques
// ================================================================

import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStats } from "../services/statsService";

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
      console.error("Erreur chargement stats:", error);
      Alert.alert("Erreur", "Impossible de charger les statistiques");
    } finally {
      setLoading(false);
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
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Statistiques</Text>
          <Text style={styles.subtitle}>
            Suivez vos performances hebdomadaires
          </Text>
        </View>

        {/* Carte Semaine */}
        <View style={styles.weekCard}>
          <Text style={styles.weekTitle}>Cette semaine</Text>

          {/* Graphique */}
          <View style={styles.weekGraph}>
            {weekData.map((item, index) => (
              <View key={index} style={styles.dayContainer}>
                <View
                  style={[
                    styles.dayBox,
                    item.validated
                      ? styles.dayBoxValidated
                      : styles.dayBoxFailed,
                  ]}
                >
                  <Ionicons
                    name={item.validated ? "checkmark" : "close"}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
                <Text style={styles.dateLabel}>{item.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cartes Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="checkbox-outline"
            iconColor="#10B981"
            value={stats?.routines_completees || 0}
            label="Routines complétées"
          />
          <StatCard
            icon="time-outline"
            iconColor="#3B82F6"
            value={stats?.temps_total || "0h 0m"}
            label="Temps total"
          />
          <StatCard
            icon="flame-outline"
            iconColor="#F97316"
            value={`${stats?.serie_actuelle || 0} jours`}
            label="Série actuelle"
          />
          <StatCard
            icon="stats-chart-outline"
            iconColor="#8B5CF6"
            value={`${stats?.taux_reussite || 0}%`}
            label="Taux de réussite"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ================================================================
// Composant StatCard
// ================================================================
const StatCard = ({ icon, iconColor, value, label }) => {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={32} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  weekCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 20,
  },
  weekGraph: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dayContainer: {
    alignItems: "center",
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  dayBoxValidated: {
    backgroundColor: "#10B981",
  },
  dayBoxFailed: {
    backgroundColor: "#EF4444",
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 10,
    color: "#94A3B8",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
});

export default StatsScreen;
