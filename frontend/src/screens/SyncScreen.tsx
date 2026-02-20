// ================================================================
// SyncScreen - Synchroniser les applications externes
// ================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function SyncScreen() {
  const [cultureExpanded, setCultureExpanded] = useState(false);
  const [sportExpanded, setSportExpanded] = useState(false);

  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);

  const handleSpotifyConnect = async () => {
    const newState = !spotifyConnected;
    setSpotifyConnected(newState);
    try {
      await AsyncStorage.setItem("spotifyConnected", newState.toString());
    } catch (error) {
      console.error("Erreur sauvegarde Spotify:", error);
    }
  };

  const handleStravaConnect = async () => {
    const newState = !stravaConnected;
    setStravaConnected(newState);
    try {
      await AsyncStorage.setItem("stravaConnected", newState.toString());
    } catch (error) {
      console.error("Erreur sauvegarde Strava:", error);
    }
  };

  const handleContinue = () => {
    router.push("/duration");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Titre centré */}
        <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>
          Synchroniser vos applications
        </Text>

        {/* Sous-titre */}
        <Text style={styles.subtitle}>
          Connectez vos applications préférées (Spotify, Strava) et suivez
          automatiquement votre temps consacré à votre développement personnel.
        </Text>

        {/* Section Culture & Développement */}
        <PillarSection
          title="Culture & Développement"
          icon="book-outline"
          iconColor="#8B5CF6"
          expanded={cultureExpanded}
          onToggle={() => setCultureExpanded(!cultureExpanded)}
        >
          <AppCard
            name="Spotify"
            icon="musical-notes"
            iconColor="#1DB954"
            connected={spotifyConnected}
            onPress={handleSpotifyConnect}
          />
        </PillarSection>

        {/* Section Sport */}
        <PillarSection
          title="Sport"
          icon="fitness-outline"
          iconColor="#F59E0B"
          expanded={sportExpanded}
          onToggle={() => setSportExpanded(!sportExpanded)}
        >
          <AppCard
            name="Strava"
            icon="bicycle-outline"
            iconColor="#FC4C02"
            connected={stravaConnected}
            onPress={handleStravaConnect}
          />
        </PillarSection>

        {/* Note */}
        <Text style={styles.note}>
          Vous pourrez modifier ces paramètres plus tard
        </Text>

        {/* Bouton Continuer */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================================================================
// Composant PillarSection (Accordéon)
// ================================================================

interface PillarSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function PillarSection({
  title,
  icon,
  iconColor,
  expanded,
  onToggle,
  children,
}: PillarSectionProps) {
  return (
    <View style={styles.pillarSection}>
      {/* Header cliquable */}
      <TouchableOpacity
        style={styles.pillarHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.pillarLeft}>
          <View
            style={[
              styles.pillarIconContainer,
              { backgroundColor: iconColor + "20" },
            ]}
          >
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <Text style={styles.pillarTitle}>{title}</Text>
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {/* Contenu déroulant */}
      {expanded && <View style={styles.pillarContent}>{children}</View>}
    </View>
  );
}

// ================================================================
// Composant AppCard
// ================================================================

interface AppCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  connected: boolean;
  onPress: () => void;
}

function AppCard({ name, icon, iconColor, connected, onPress }: AppCardProps) {
  return (
    <View style={styles.appCard}>
      <View style={styles.appLeft}>
        <View
          style={[
            styles.appIconContainer,
            { backgroundColor: iconColor + "15" },
          ]}
        >
          <Ionicons name={icon} size={28} color={iconColor} />
        </View>
        <Text style={styles.appName}>{name}</Text>
      </View>

      <TouchableOpacity
        style={[styles.connectButton, connected && styles.connectButtonActive]}
        onPress={onPress}
      >
        {connected && (
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
        )}
        <Text
          style={[
            styles.connectButtonText,
            connected && styles.connectButtonTextActive,
          ]}
        >
          {connected ? "Connecté" : "Non connecté"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: width < 375 ? 22 : 26,
    fontWeight: "700",
    color: "#1B3A6B",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  pillarSection: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
  },
  pillarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  pillarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pillarIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pillarTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1B3A6B",
    flex: 1,
  },
  pillarContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  appLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B3A6B",
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  connectButtonActive: {
    backgroundColor: "#D1FAE5",
  },
  connectButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  connectButtonTextActive: {
    color: "#10B981",
    marginLeft: 6,
  },
  note: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 24,
    fontStyle: "italic",
  },
  continueButton: {
    backgroundColor: "#5B7EBD",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#5B7EBD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
