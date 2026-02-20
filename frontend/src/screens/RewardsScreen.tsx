// ================================================================
// RewardsScreen - Écran des récompenses et badges
// ================================================================

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function RewardsScreen() {
  // Données des badges (mockées pour le MVP)
  const badges = [
    {
      id: 1,
      title: "Première victoire",
      description: "Complétez votre première routine",
      icon: "trophy",
      unlocked: true,
      color: "#F59E0B",
    },
    {
      id: 2,
      title: "Série de 7 jours",
      description: "Maintenez une série de 7 jours consécutifs",
      icon: "flame",
      unlocked: true,
      color: "#EF4444",
    },
    {
      id: 3,
      title: "Expert du temps",
      description: "Accumulez 100 heures de routines",
      icon: "time",
      unlocked: false,
      color: "#8B5CF6",
    },
    {
      id: 4,
      title: "Marathonien",
      description: "Maintenez une série de 30 jours consécutifs",
      icon: "ribbon",
      unlocked: false,
      color: "#10B981",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Titre de la page */}
        <Text style={styles.title}>Récompenses</Text>

        {/* Sous-titre */}
        <Text style={styles.subtitle}>
          Débloquez des badges en atteignant vos objectifs
        </Text>

        {/* Liste des badges */}
        <View style={styles.badgesList}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================================================================
// Composant BadgeCard
// ================================================================

interface BadgeCardProps {
  badge: {
    id: number;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    color: string;
  };
}

function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <View
      style={[
        styles.badgeCard,
        badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
      ]}
    >
      {/* Icône du badge */}
      <View
        style={[
          styles.badgeIcon,
          { backgroundColor: badge.unlocked ? badge.color + "20" : "#F3F4F6" },
        ]}
      >
        <Ionicons
          name={badge.icon as any}
          size={48}
          color={badge.unlocked ? badge.color : "#D1D5DB"}
        />
      </View>

      {/* Contenu */}
      <View style={styles.badgeContent}>
        <Text
          style={[
            styles.badgeTitle,
            !badge.unlocked && styles.badgeTitleLocked,
          ]}
        >
          {badge.title}
        </Text>
        <Text
          style={[
            styles.badgeDescription,
            !badge.unlocked && styles.badgeDescriptionLocked,
          ]}
        >
          {badge.description}
        </Text>

        {/* Badge débloqué */}
        {badge.unlocked && (
          <View style={styles.unlockedBadge}>
            <Ionicons name="trophy" size={14} color="#F59E0B" />
            <Text style={styles.unlockedText}>Débloqué</Text>
          </View>
        )}
      </View>

      {/* Cadenas si bloqué */}
      {!badge.unlocked && (
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
        </View>
      )}
    </View>
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
    padding: 20,
    paddingBottom: 100,
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
  badgesList: {
    gap: 16,
  },
  badgeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeUnlocked: {
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B3A6B",
    marginBottom: 4,
  },
  badgeTitleLocked: {
    color: "#9CA3AF",
  },
  badgeDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  badgeDescriptionLocked: {
    color: "#D1D5DB",
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 4,
  },
  lockIcon: {
    marginLeft: 12,
  },
});
