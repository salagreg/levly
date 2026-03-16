// ================================================================
// Écran des récompenses (badges)
// ================================================================

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getBadges } from "../services/rewardsService";

const BLUE = "#5B7EBD";
const BG = "#E8EDF6";

const RewardsScreen = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const data = await getBadges();
          setBadges(data.badges);
        } catch (error) {
          Alert.alert("Erreur", "Impossible de charger les badges");
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>

      {/* Header */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Récompenses</Text>
          <Text style={styles.headerSubtitle}>
            Débloquez des badges en atteignant vos objectifs
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : badges.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color="#C8D7EE" />
            <Text style={styles.emptyText}>Aucun badge disponible</Text>
          </View>
        ) : (
          badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const BadgeCard = ({ badge }) => {
  return (
    <View style={[styles.card, badge.unlocked && styles.cardUnlocked]}>
      <View style={[styles.badgeIconBox, { opacity: badge.unlocked ? 1 : 0.3 }]}>
        <Text style={styles.badgeEmoji}>{badge.icon}</Text>
      </View>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, !badge.unlocked && styles.textMuted]}>
          {badge.name}
        </Text>
        <Text style={[styles.badgeDesc, !badge.unlocked && styles.textMuted]}>
          {badge.description}
        </Text>
      </View>
      {badge.unlocked ? (
        <View style={styles.unlockedPill}>
          <Text style={styles.unlockedText}>Débloqué</Text>
        </View>
      ) : (
        <Ionicons name="lock-closed" size={20} color="#C8D7EE" />
      )}
    </View>
  );
};

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
    gap: 12,
  },
  loadingText: {
    textAlign: "center",
    color: "#9AAED4",
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#7A9ABF",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cardUnlocked: {
    borderColor: BLUE,
  },
  badgeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F4FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeEmoji: { fontSize: 28 },
  badgeInfo: { flex: 1 },
  badgeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B4A",
    marginBottom: 3,
  },
  badgeDesc: {
    fontSize: 13,
    color: "#7A9ABF",
  },
  textMuted: { color: "#C8D7EE" },
  unlockedPill: {
    backgroundColor: BLUE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  unlockedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default RewardsScreen;
