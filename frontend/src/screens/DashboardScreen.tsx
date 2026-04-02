// ================================================================
// DashboardScreen - Tableau de bord principal
// ================================================================

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { getDashboard } from "../services/dashboardService";

const BLUE = "#5B7EBD";
const BG = "#E8EDF6";

const APP_LOGOS: Record<string, any> = {
  strava: require("../../assets/images/logo_strava.png"),
};

const APP_COLORS: Record<string, string> = {
  strava: "#FC4C02",
};

const APP_BG: Record<string, string> = {
  strava: "#FC4C02",
};

type App = {
  name: string;
  current: number;
  target: number;
};

export default function DashboardScreen() {
  const [prenom, setPrenom] = useState("");
  const [tokens, setTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch {
      // Silencieux — le dashboard se recharge au focus
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

  const getAppLogo = (app: App) => APP_LOGOS[app.name?.toLowerCase()] || null;
  const getAppColor = (app: App) => APP_COLORS[app.name?.toLowerCase()] || BLUE;
  const getAppBg = (app: App) => APP_BG[app.name?.toLowerCase()] || BLUE;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* ── HEADER ── */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{prenom || "..."} 👋</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Image
                source={require("../../assets/images/flamme.png")}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeValue}>{streak}</Text>
            </View>
            <View style={styles.badge}>
              <Image
                source={require("../../assets/images/star.png")}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeValue}>{tokens}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* ── SCROLL ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Applications connectées */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="grid" size={20} color="#1A2B4A" />
            <Text style={styles.cardTitle}>Applications connectées</Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : apps.length === 0 ? (
            <Text style={styles.loadingText}>Aucune application connectée</Text>
          ) : (
            apps.map((app, index) => {
              const logo = getAppLogo(app);
              const barColor = getAppColor(app);
              const bgColor = getAppBg(app);
              const pct = Math.min((app.current / app.target) * 100, 100);

              return (
                <View
                  key={index}
                  style={[
                    styles.appRow,
                    index < apps.length - 1 && styles.appRowBorder,
                  ]}
                >
                  <View style={styles.appTop}>
                    <View style={styles.appLeft}>
                      <View
                        style={[
                          styles.appIconBox,
                          { backgroundColor: bgColor },
                        ]}
                      >
                        {logo ? (
                          <Image
                            source={logo}
                            style={styles.appIconImg}
                            resizeMode="contain"
                          />
                        ) : (
                          <Ionicons name="apps" size={20} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.appName}>{app.name}</Text>
                    </View>
                    <Text style={styles.appTime}>
                      {app.current} / {app.target} min
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeIcon: {
    width: 20,
    height: 20,
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
  },
  appRow: { paddingVertical: 12 },
  appRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8EDF6",
  },
  appTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
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
  appIconImg: { width: 26, height: 26 },
  appName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
  },
  appTime: {
    fontSize: 14,
    fontWeight: "600",
    color: BLUE,
  },
  progressTrack: {
    height: 7,
    backgroundColor: "#E8EDF6",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 99 },
  loadingText: {
    textAlign: "center",
    color: "#9AAED4",
    marginTop: 8,
    marginBottom: 8,
  },
});
