// ================================================================
// RewardsScreen - Récompenses et badges
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
import { getBadges } from "../services/rewardsService";
import { FONTS, COLORS } from "../config/theme";

const CATEGORIES = [
  {
    id: "serie",
    label: "Série",
    borderColor: "#FFD4B8",
    badges: [
      {
        id: "s1",
        icon: "🔥",
        name: "Premiers pas",
        desc: "3 jours consécutifs",
        target: 3,
        key: "serie",
      },
      {
        id: "s2",
        icon: "⚡",
        name: "En feu",
        desc: "7 jours consécutifs",
        target: 7,
        key: "serie",
      },
      {
        id: "s3",
        icon: "💥",
        name: "Inarrêtable",
        desc: "14 jours consécutifs",
        target: 14,
        key: "serie",
      },
      {
        id: "s4",
        icon: "🌟",
        name: "Légendaire",
        desc: "30 jours consécutifs",
        target: 30,
        key: "serie",
      },
      {
        id: "s5",
        icon: "👑",
        name: "Champion",
        desc: "100 jours consécutifs",
        target: 100,
        key: "serie",
      },
    ],
  },
  {
    id: "tokens",
    label: "Tokens",
    borderColor: "#FFE89A",
    badges: [
      {
        id: "t1",
        icon: "🪙",
        name: "Épargnant",
        desc: "100 tokens",
        target: 100,
        key: "tokens",
      },
      {
        id: "t2",
        icon: "💰",
        name: "Investisseur",
        desc: "500 tokens",
        target: 500,
        key: "tokens",
      },
      {
        id: "t3",
        icon: "💎",
        name: "Riche",
        desc: "1 000 tokens",
        target: 1000,
        key: "tokens",
      },
      {
        id: "t4",
        icon: "🏦",
        name: "Millionnaire",
        desc: "10 000 tokens",
        target: 10000,
        key: "tokens",
      },
    ],
  },
  {
    id: "activites",
    label: "Activités",
    borderColor: "#C8D7EE",
    badges: [
      {
        id: "a1",
        icon: "👟",
        name: "Débutant",
        desc: "1 activité",
        target: 1,
        key: "activites",
      },
      {
        id: "a2",
        icon: "🏃",
        name: "Régulier",
        desc: "10 activités",
        target: 10,
        key: "activites",
      },
      {
        id: "a3",
        icon: "🚴",
        name: "Athlète",
        desc: "50 activités",
        target: 50,
        key: "activites",
      },
      {
        id: "a4",
        icon: "🏆",
        name: "Pro",
        desc: "100 activités",
        target: 100,
        key: "activites",
      },
    ],
  },
  {
    id: "defis",
    label: "Défis",
    borderColor: "#B8EDD4",
    badges: [
      {
        id: "d1",
        icon: "🎯",
        name: "1ère victoire",
        desc: "1ère journée validée",
        target: 1,
        key: "defis",
      },
      {
        id: "d2",
        icon: "🚀",
        name: "Dépassement",
        desc: "Objectif dépassé x5",
        target: 5,
        key: "defis",
      },
      {
        id: "d3",
        icon: "🌈",
        name: "Polyvalent",
        desc: "7 jours de suite",
        target: 7,
        key: "defis",
      },
      {
        id: "d4",
        icon: "💪",
        name: "Iron Man",
        desc: "30 activités / 30 jours",
        target: 30,
        key: "defis",
      },
    ],
  },
];

const BadgeCard = ({ badge, unlocked, progress, borderColor }) => {
  const pct = Math.min((progress / badge.target) * 100, 100);

  return (
    <View
      style={[
        styles.badgeCard,
        { borderColor: unlocked ? COLORS.primary : borderColor },
        unlocked && styles.badgeCardUnlocked,
      ]}
    >
      <View style={styles.badgeIconBox}>
        <Text style={[styles.badgeEmoji, !unlocked && { opacity: 0.5 }]}>
          {badge.icon}
        </Text>
      </View>
      <Text
        style={[styles.badgeName, !unlocked && styles.textMuted]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>
      <Text style={styles.badgeDesc} numberOfLines={2}>
        {badge.desc}
      </Text>

      {unlocked ? (
        <View style={styles.unlockedBadge}>
          <Ionicons name="checkmark" size={11} color="#fff" />
          <Text style={styles.unlockedText}>Obtenu</Text>
        </View>
      ) : (
        <View style={styles.progressWrapper}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.min(progress, badge.target)}/{badge.target}
          </Text>
        </View>
      )}
    </View>
  );
};

const CategorySection = ({ category, stats }) => (
  <View style={styles.categorySection}>
    <Text style={styles.categoryLabel}>{category.label}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
      style={styles.carouselContainer}
      nestedScrollEnabled
    >
      {category.badges.map((item) => {
        const progress = stats[item.key] || 0;
        const unlocked = progress >= item.target;
        return (
          <BadgeCard
            key={item.id}
            badge={item}
            unlocked={unlocked}
            progress={progress}
            borderColor={category.borderColor}
          />
        );
      })}
    </ScrollView>
  </View>
);

const RewardsScreen = () => {
  const [stats, setStats] = useState({
    serie: 0,
    tokens: 0,
    activites: 0,
    defis: 0,
  });
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        try {
          setLoading(true);
          const data = await getBadges();
          setStats({
            serie: data.stats?.serie_actuelle || 0,
            tokens: data.stats?.total_tokens || 0,
            activites: data.stats?.total_activites || 0,
            defis: data.stats?.serie_actuelle || 0,
          });
        } catch {
          Alert.alert("Erreur", "Impossible de charger les récompenses");
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Text style={styles.headerTitle}>Récompenses</Text>
        <Text style={styles.headerSubtitle}>
          Débloque des badges en progressant chaque jour
        </Text>
      </View>

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
            {CATEGORIES.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                stats={stats}
              />
            ))}
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
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categorySection: {
    gap: 10,
  },
  categoryLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
  },
  carouselContainer: {
    height: 155,
  },
  carousel: {
    gap: 16,
    paddingRight: 4,
    alignItems: "center",
  },
  badgeCard: {
    width: 115,
    height: 140,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: { fontSize: 20 },
  badgeName: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    textAlign: "center",
    lineHeight: 12,
  },
  textMuted: { color: COLORS.light },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
    marginTop: 4,
  },
  unlockedText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: FONTS.semibold,
  },
  progressWrapper: {
    width: "100%",
    gap: 3,
    marginTop: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 99,
  },
  progressText: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.medium,
    textAlign: "center",
  },
});

export default RewardsScreen;
