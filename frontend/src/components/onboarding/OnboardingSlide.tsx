// ================================================================
// OnboardingSlide - Composant réutilisable pour chaque slide
// ================================================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";

interface OnboardingSlideProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
}

export default function OnboardingSlide({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
}: OnboardingSlideProps) {
  return (
    <View style={[styles.container, { width: Dimensions.get("window").width }]}>
      {/* Icône */}
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={80} color={iconColor} />
      </View>
      {/* Titre */}
      <Text style={styles.title}>{title}</Text>
      {/* Description */}
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1B3A6B",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
