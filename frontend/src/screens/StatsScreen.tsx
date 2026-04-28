// ================================================================
// Écran Statistiques
// ================================================================

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getStats } from "../services/statsService";
import { FONTS, COLORS } from "../config/theme";

// ================================================================
// Calendrier mensuel
// ================================================================
const MonthCalendar = ({ validatedDays }: { validatedDays: number[] }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Text style={styles.cardTitle}>
          {monthNames[month]} {year}
        </Text>
        <View style={styles.calendarScorePill}>
          <Text style={styles.calendarScore}>
            {validatedDays.length} / {today} jours
          </Text>
        </View>
      </View>

      <View style={styles.calendarDayLabels}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <Text key={i} style={styles.calendarDayLabel}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {cells.map((day, index) => {
          if (!day)
            return <View key={`empty-${index}`} style={styles.calendarCell} />;
          const isValidated = validatedDays.includes(day);
          const isToday = day === today;
          const isFuture = day > today;

          return (
            <View
              key={day}
              style={[
                styles.calendarCell,
                isValidated && styles.calendarCellValidated,
                isToday && styles.calendarCellToday,
                isFuture && styles.calendarCellFuture,
              ]}
            >
              <Text
                style={[
                  styles.calendarCellText,
                  isValidated && styles.calendarCellTextLight,
                  isToday && styles.calendarCellTextLight,
                  isFuture && styles.calendarCellTextFuture,
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ================================================================
// Stat card
// ================================================================
const StatCard = ({ icon, iconColor, value, label }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBox, { backgroundColor: `${iconColor}18` }]}>
      <Ionicons name={icon} size={26} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ================================================================
// Écran principal
// ================================================================
const StatsScreen = () => {
  const [validatedDays, setValidatedDays] = useState<number[]>([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setValidatedDays(data.validatedDays || []);
      setStats(data.stats);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Text style={styles.headerTitle}>Statistiques</Text>
        <Text style={styles.headerSubtitle}>
          Suis tes performances et ta progression
        </Text>
      </View>

      {/* ── Contenu ── */}
      <View style={styles.bottomSheet}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Stats grid ── */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="checkbox-outline"
                iconColor="#4CD97B"
                value={stats?.routines_completees || 0}
                label="Activités validées"
              />
              <StatCard
                icon="time-outline"
                iconColor={COLORS.primary}
                value={stats?.temps_total || "0h 0m"}
                label="Temps total"
              />
              <StatCard
                icon="trophy-outline"
                iconColor="#FC4C02"
                value={`${stats?.meilleure_serie || 0}j`}
                label="Meilleure série"
              />
              <StatCard
                icon="stats-chart-outline"
                iconColor="#F5A623"
                value={`${stats?.taux_reussite || 0}%`}
                label="Taux de réussite"
              />
            </View>

            {/* ── Calendrier mensuel ── */}
            <MonthCalendar validatedDays={validatedDays} />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
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
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    lineHeight: 22,
  },
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
    padding: 20,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Stats grid ──
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 18,
    width: "47.5%",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.lighter,
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
    fontFamily: FONTS.extrabold,
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    textAlign: "center",
  },

  // ── Calendrier ──
  calendarCard: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.lighter,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  calendarScorePill: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  calendarScore: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  calendarDayLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  calendarDayLabel: {
    width: 32,
    textAlign: "center",
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.medium,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "space-around",
  },
  calendarCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCellValidated: {
    backgroundColor: "#4CD97B",
  },
  calendarCellToday: {
    backgroundColor: COLORS.primary,
  },
  calendarCellFuture: {
    opacity: 0.3,
  },
  calendarCellText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark,
  },
  calendarCellTextLight: {
    fontFamily: FONTS.bold,
    color: "#fff",
  },
  calendarCellTextFuture: {
    color: COLORS.light,
  },
});

export default StatsScreen;
