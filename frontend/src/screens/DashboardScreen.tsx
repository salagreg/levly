// ================================================================
// DashboardScreen - Tableau de bord principal
// ================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { getDashboard } from "../services/dashboardService";
import StoreScreen from "./StoreScreen";
import { FEATURES } from "../config/theme";

const BLUE = "#5B7EBD";
const GREEN = "#4CD97B";
const RED = "#EF4444";

// ================================================================
// Messages motivants selon le pourcentage
// ================================================================
const getVibeMessage = (pct: number) => {
  if (pct === 0)
    return {
      label: "C'est parti !",
      msg: "Lance-toi, chaque minute compte 💪",
    };
  if (pct < 25)
    return { label: "En route", msg: "Bon début, continue sur ta lancée !" };
  if (pct < 50)
    return { label: "En progression", msg: "Tu avances bien, accroche-toi !" };
  if (pct < 75)
    return { label: "À mi-chemin", msg: "La moitié est faite, lâche rien !" };
  if (pct < 100)
    return {
      label: "En pleine forme",
      msg: `Super rythme ! Encore ${100 - pct}% pour valider ta journée.`,
    };
  return {
    label: "Objectif atteint",
    msg: "Incroyable, tu as tout validé aujourd'hui !",
  };
};

// ================================================================
// Jauge demi-cercle SVG
// ================================================================
const GAUGE_WIDTH = 220;
const GAUGE_HEIGHT = 130;
const RADIUS = 85;
const CX = GAUGE_WIDTH / 2;
const CY = GAUGE_HEIGHT - 10;
const CIRCUMFERENCE = Math.PI * RADIUS;

const GaugeCircle = ({ pct }: { pct: number }) => {
  const filled = (pct / 100) * CIRCUMFERENCE;
  const empty = CIRCUMFERENCE - filled;
  const d = `M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${
    CX + RADIUS
  } ${CY}`;

  return (
    <Svg width={GAUGE_WIDTH} height={GAUGE_HEIGHT}>
      <Path
        d={d}
        fill="none"
        stroke="#E0E8F4"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <Path
        d={d}
        fill="none"
        stroke={pct === 100 ? GREEN : BLUE}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${empty}`}
      />
    </Svg>
  );
};

// ================================================================
// Types
// ================================================================
type App = {
  name: string;
  current: number;
  target: number;
};

type DayData = {
  date: string;
  label: string;
  validated: boolean;
  isToday: boolean;
};

// ================================================================
// App card du carrousel
// ================================================================
const APP_LOGOS: Record<string, any> = {
  strava: require("../../assets/images/logo_strava.png"),
};
const APP_COLORS: Record<string, string> = {
  strava: "#FC4C02",
};

const AppCard = ({ app }: { app: App }) => {
  const key = app.name?.toLowerCase();
  const logo = APP_LOGOS[key] || null;
  const color = APP_COLORS[key] || BLUE;
  const pct =
    app.target > 0 ? Math.min((app.current / app.target) * 100, 100) : 0;
  const tokensGagnes =
    app.current >= app.target
      ? app.target + Math.floor((app.current - app.target) * 0.5)
      : 0;

  return (
    <View style={styles.appCard}>
      <View style={styles.appCardHeader}>
        <View style={[styles.appIconBox, { backgroundColor: color }]}>
          {logo && (
            <Image
              source={logo}
              style={styles.appIconImg}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={styles.appCardName}>{app.name}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.appCardTime}>
        {app.current} / {app.target} min
      </Text>
      <Text style={styles.appCardTokens}>🪙 +{tokensGagnes}</Text>
    </View>
  );
};

// ================================================================
// Jauge semaine
// ================================================================
const WeekGauge = ({ weekData }: { weekData: DayData[] }) => {
  const validatedCount = weekData.filter((d) => d.validated).length;

  return (
    <View style={styles.weekCard}>
      <View style={styles.weekHeader}>
        <Text style={styles.weekTitle}>Ta semaine</Text>
        <View style={styles.weekScorePill}>
          <Text style={styles.weekScore}>{validatedCount} / 7 jours</Text>
        </View>
      </View>
      <View style={styles.weekDays}>
        {weekData.map((day, index) => {
          let circleStyle = styles.dayEmpty;
          let textStyle = styles.dayTextEmpty;
          let label = "•••";

          if (day.isToday && day.validated) {
            circleStyle = styles.daySuccess;
            textStyle = styles.dayTextSuccess;
            label = "✓";
          } else if (day.isToday) {
            circleStyle = styles.dayToday;
            textStyle = styles.dayTextToday;
            label = "•••";
          } else if (day.validated) {
            circleStyle = styles.daySuccess;
            textStyle = styles.dayTextSuccess;
            label = "✓";
          } else {
            circleStyle = styles.dayFail;
            textStyle = styles.dayTextFail;
            label = "✗";
          }

          return (
            <View key={index} style={styles.dayItem}>
              <View style={[styles.dayCircle, circleStyle]}>
                <Text style={[styles.dayLabel, textStyle]}>{label}</Text>
              </View>
              <Text style={styles.dayName}>{day.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ================================================================
// Dashboard principal
// ================================================================
export default function DashboardScreen() {
  const [prenom, setPrenom] = useState("");
  const [tokens, setTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [apps, setApps] = useState<App[]>([]);
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeVisible, setStoreVisible] = useState(false); // ← feature store

  const loadPrenom = async () => {
    const stored = await AsyncStorage.getItem("prenom");
    if (stored) setPrenom(stored);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setTokens(data.tokens || 0);
      setStreak(data.streak || 0);
      setApps(data.apps || []);
      setWeekData(data.weekData || []);
    } catch {
      // Silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrenom();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const globalPct =
    apps.length === 0
      ? 0
      : Math.round(
          apps.reduce(
            (sum, app) => sum + Math.min((app.current / app.target) * 100, 100),
            0
          ) / apps.length
        );

  const vibe = getVibeMessage(globalPct);

  return (
    <View style={{ flex: 1, backgroundColor: "#EEF3FB" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Salut,</Text>
              <Text style={styles.userName}>{prenom || "..."} 👋</Text>
            </View>
            <View style={styles.pills}>
              {/* Pill streak */}
              <View style={styles.pill}>
                <Text style={styles.pillIcon}>🔥</Text>
                <Text style={styles.pillValue}>{streak}</Text>
              </View>

              {/* Pill tokens — cliquable si FEATURES.store = true */}
              {FEATURES.store ? (
                <TouchableOpacity
                  style={styles.pill}
                  onPress={() => setStoreVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pillIcon}>🪙</Text>
                  <Text style={styles.pillValue}>
                    {tokens.toLocaleString("fr-FR")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.pill}>
                  <Text style={styles.pillIcon}>🪙</Text>
                  <Text style={styles.pillValue}>
                    {tokens.toLocaleString("fr-FR")}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── JAUGE DU JOUR ── */}
          <View style={styles.gaugeSection}>
            <Text style={styles.gaugeLabel}>Vibe du jour</Text>
            <View style={styles.gaugeWrap}>
              <GaugeCircle pct={globalPct} />
              <View style={styles.gaugePct}>
                <Text style={styles.gaugeNum}>{globalPct}</Text>
                <Text style={styles.gaugeSym}>%</Text>
              </View>
            </View>
            <View style={styles.gaugeMsg}>
              <Text style={styles.gaugeMsgText}>
                {vibe.label.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.motivational}>{vibe.msg}</Text>
          </View>

          {/* ── JAUGE SEMAINE ── */}
          {weekData.length > 0 && <WeekGauge weekData={weekData} />}

          {/* ── APPS CONNECTÉES ── */}
          <Text style={styles.sectionTitle}>Apps Connectées</Text>
          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : apps.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucune application connectée</Text>
              <Text style={styles.emptySubtext}>
                Connecte Strava dans les paramètres
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {apps.map((app, index) => (
                <AppCard key={index} app={app} />
              ))}
            </ScrollView>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ── STORE MODAL ── */}
      {FEATURES.store && (
        <StoreScreen
          visible={storeVisible}
          onClose={() => setStoreVisible(false)}
          userTokens={tokens}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    gap: 8,
  },
  headerLeft: { flex: 1, minWidth: 0 },
  greeting: {
    fontSize: 13,
    color: "#7A9ABF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  userName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A2B4A",
    fontFamily: "Poppins_700Bold",
  },
  pills: { flexDirection: "row", gap: 8, flexShrink: 0 },
  pill: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  pillIcon: { fontSize: 15 },
  pillValue: { fontSize: 15, fontWeight: "700", color: "#1A2B4A" },
  gaugeSection: { alignItems: "center", marginBottom: 24 },
  gaugeLabel: {
    fontSize: 11,
    color: "#7A9ABF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  gaugeWrap: {
    position: "relative",
    width: 220,
    height: 130,
    alignItems: "center",
  },
  gaugePct: {
    position: "absolute",
    bottom: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  gaugeNum: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1A2B4A",
    lineHeight: 52,
  },
  gaugeSym: { fontSize: 20, fontWeight: "600", color: BLUE, marginBottom: 6 },
  gaugeMsg: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 12,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gaugeMsgText: {
    fontSize: 12,
    fontWeight: "700",
    color: BLUE,
    letterSpacing: 1,
  },
  motivational: {
    fontSize: 13,
    color: "#7A9ABF",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  weekCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weekTitle: { fontSize: 15, fontWeight: "700", color: "#1A2B4A" },
  weekScorePill: {
    backgroundColor: "#EEF3FB",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weekScore: { fontSize: 12, fontWeight: "700", color: BLUE },
  weekDays: { flexDirection: "row", justifyContent: "space-between" },
  dayItem: { alignItems: "center", gap: 6 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  daySuccess: { backgroundColor: GREEN },
  dayFail: { backgroundColor: "#FEE2E2" },
  dayToday: { backgroundColor: BLUE },
  dayEmpty: { backgroundColor: "#E8EDF6" },
  dayLabel: { fontSize: 13, fontWeight: "700" },
  dayTextSuccess: { color: "#fff" },
  dayTextFail: { color: RED },
  dayTextToday: { color: "#fff" },
  dayTextEmpty: { color: "#B0C4DE" },
  dayName: { fontSize: 10, color: "#9AAED4", fontWeight: "600" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2B4A",
    marginBottom: 14,
  },
  carousel: { gap: 12, paddingRight: 4 },
  appCard: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  appCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  appIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  appIconImg: { width: 20, height: 20 },
  appCardName: { fontSize: 14, fontWeight: "700", color: "#1A2B4A" },
  progressTrack: {
    height: 5,
    backgroundColor: "#E8EDF6",
    borderRadius: 99,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 99 },
  appCardTime: { fontSize: 11, color: "#9AAED4", marginBottom: 6 },
  appCardTokens: { fontSize: 14, fontWeight: "700", color: BLUE },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  emptyText: { fontSize: 14, fontWeight: "600", color: "#7A9ABF" },
  emptySubtext: { fontSize: 12, color: "#9AAED4" },
  loadingText: { textAlign: "center", color: "#9AAED4", marginTop: 20 },
});
