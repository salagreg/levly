// ================================================================
// Écran des récompenses (badges)
// ================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBadges } from "../services/rewardsService";

const RewardsScreen = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const data = await getBadges();
      setBadges(data.badges);
    } catch (error) {
      console.error("Erreur chargement badges:", error);
      Alert.alert("Erreur", "Impossible de charger les badges");
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
          <Text style={styles.title}>Récompenses</Text>
          <Text style={styles.subtitle}>
            Débloquez des badges en atteignant vos objectifs !
          </Text>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ================================================================
// Composant BadgeCard
// ================================================================
const BadgeCard = ({ badge }) => {
  return (
    <View
      style={[
        styles.badgeCard,
        badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
      ]}
    >
      {/* Badge Icon */}
      <View style={[styles.badgeIcon, { opacity: badge.unlocked ? 1 : 0.3 }]}>
        <Text style={styles.badgeEmoji}>{badge.icon}</Text>
      </View>

      {/* Badge Info */}
      <View style={styles.badgeInfo}>
        <Text
          style={[
            styles.badgeName,
            { color: badge.unlocked ? "#1E293B" : "#94A3B8" },
          ]}
        >
          {badge.name}
        </Text>
        <Text
          style={[
            styles.badgeDescription,
            { color: badge.unlocked ? "#64748B" : "#CBD5E1" },
          ]}
        >
          {badge.description}
        </Text>
      </View>

      {/* Status */}
      <View style={styles.badgeStatus}>
        {badge.unlocked ? (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>Débloqué</Text>
          </View>
        ) : (
          <Ionicons name="lock-closed" size={24} color="#CBD5E1" />
        )}
      </View>
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
  badgesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  badgeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  badgeUnlocked: {
    borderColor: "#F97316",
  },
  badgeLocked: {
    borderColor: "#E2E8F0",
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
  },
  badgeStatus: {
    marginLeft: 12,
  },
  unlockedBadge: {
    backgroundColor: "#F97316",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unlockedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default RewardsScreen;
