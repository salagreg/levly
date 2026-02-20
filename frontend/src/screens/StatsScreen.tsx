// ================================================================
// StatsScreen - Écran des statistiques
// ================================================================

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function StatsScreen() {
  // Données mockées de la semaine
  const weekData = [
    { day: "Lun", date: 30, validated: true },
    { day: "Mar", date: 31, validated: true },
    { day: "Mer", date: 1, validated: false },
    { day: "Jeu", date: 2, validated: true },
    { day: "Ven", date: 3, validated: true },
    { day: "Sam", date: 4, validated: false },
    { day: "Dim", date: 5, validated: false },
  ];

  // Stats mockées
  const stats = [
    {
      icon: "checkmark-circle",
      iconColor: "#10B981",
      label: "Routines complétées",
      value: "15",
    },
    {
      icon: "time",
      iconColor: "#6B7280",
      label: "Temps total",
      value: "12h 30m",
    },
    {
      icon: "flame",
      iconColor: "#EF4444",
      label: "Série actuelle",
      value: "60 jours",
    },
    {
      icon: "star",
      iconColor: "#5B7EBD",
      label: "Meilleure série",
      value: "72 jours",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Titre */}
        <Text style={styles.title}>Statistiques</Text>

        {/* Sous-titre */}
        <Text style={styles.subtitle}>
          Suivez vos performances hebdomadaires
        </Text>

        {/* Cette semaine */}
        <View style={styles.weekCard}>
          <Text style={styles.weekTitle}>Cette semaine</Text>

          {/* Graphique personnalisé */}
          <View style={styles.weekGraph}>
            {weekData.map((item, index) => (
              <View key={index} style={styles.dayContainer}>
                {/* Box jour */}
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
                    color={item.validated ? "#10B981" : "#EF4444"}
                  />
                </View>

                {/* Jour */}
                <Text style={styles.dayLabel}>{item.day}</Text>

                {/* Date */}
                <Text style={styles.dateLabel}>{item.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: stat.iconColor + "20" },
                ]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={24}
                  color={stat.iconColor}
                />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
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
  weekCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B3A6B",
    marginBottom: 20,
  },
  weekGraph: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  dayContainer: {
    alignItems: "center",
  },
  dayBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
  },
  dayBoxValidated: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  dayBoxFailed: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B3A6B",
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B3A6B",
  },
});
