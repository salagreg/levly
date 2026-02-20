// ================================================================
// DurationScreen - Définir les durées quotidiennes
// ================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/common/BackButton";

const { width } = Dimensions.get("window");

export default function DurationScreen() {
  // État des connexions (récupéré de l'écran précédent)
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);

  // Durées des applications
  const [spotifyDuration, setSpotifyDuration] = useState(30);
  const [stravaDuration, setStravaDuration] = useState(30);

  // Tâches manuelles
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  // Charger les connexions et tâches au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger l'état des connexions
      const spotify = await AsyncStorage.getItem("spotifyConnected");
      const strava = await AsyncStorage.getItem("stravaConnected");

      setSpotifyConnected(spotify === "true");
      setStravaConnected(strava === "true");

      // Charger les tâches
      const savedTasks = await AsyncStorage.getItem("manualTasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
    }
  };

  const handleAddTask = async () => {
    if (newTaskText.trim()) {
      const updatedTasks = [...tasks, newTaskText.trim()];
      setTasks(updatedTasks);
      setNewTaskText("");
      setShowAddTask(false);

      // Sauvegarder dans AsyncStorage
      try {
        await AsyncStorage.setItem("manualTasks", JSON.stringify(updatedTasks));
      } catch (error) {
        console.error("Erreur sauvegarde tâche:", error);
      }
    }
  };

  const handleRemoveTask = async (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);

    // Sauvegarder dans AsyncStorage
    try {
      await AsyncStorage.setItem("manualTasks", JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Erreur suppression tâche:", error);
    }
  };

  const handleFinish = async () => {
    // Sauvegarder les durées
    try {
      await AsyncStorage.setItem("spotifyDuration", spotifyDuration.toString());
      await AsyncStorage.setItem("stravaDuration", stravaDuration.toString());
    } catch (error) {
      console.error("Erreur sauvegarde durées:", error);
    }

    // Naviguer vers le dashboard
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header avec back button + titre */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text
            style={styles.headerTitle}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            Définir les durées
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section Applications connectées */}
          {(spotifyConnected || stravaConnected) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Applications connectées</Text>

              {/* Spotify */}
              {spotifyConnected && (
                <AppDurationCard
                  name="Spotify"
                  icon="musical-notes"
                  iconColor="#1DB954"
                  duration={spotifyDuration}
                  onDurationChange={setSpotifyDuration}
                />
              )}

              {/* Strava */}
              {stravaConnected && (
                <AppDurationCard
                  name="Strava"
                  icon="bicycle-outline"
                  iconColor="#FC4C02"
                  duration={stravaDuration}
                  onDurationChange={setStravaDuration}
                />
              )}
            </View>
          )}

          {/* Section Tâches non trackées */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tâches non trackées</Text>

            {/* Liste des tâches */}
            {tasks.map((task, index) => (
              <View key={index} style={styles.taskCard}>
                <Text style={styles.taskText}>{task}</Text>
                <TouchableOpacity onPress={() => handleRemoveTask(index)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Input ajout tâche */}
            {showAddTask && (
              <View style={styles.addTaskInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de la tâche"
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                  autoFocus
                  onSubmitEditing={handleAddTask}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={handleAddTask}>
                  <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                </TouchableOpacity>
              </View>
            )}

            {/* Bouton Ajouter une tâche */}
            {!showAddTask && (
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => setShowAddTask(true)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#5B7EBD" />
                <Text style={styles.addTaskButtonText}>Ajouter une tâche</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bouton Terminé */}
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Terminé</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================================================================
// Composant AppDurationCard
// ================================================================

interface AppDurationCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  duration: number;
  onDurationChange: (value: number) => void;
}

function AppDurationCard({
  name,
  icon,
  iconColor,
  duration,
  onDurationChange,
}: AppDurationCardProps) {
  return (
    <View style={styles.appCard}>
      {/* Header */}
      <View style={styles.appHeader}>
        <View style={styles.appLeft}>
          <View
            style={[
              styles.appIconContainer,
              { backgroundColor: iconColor + "15" },
            ]}
          >
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <Text style={styles.appName}>{name}</Text>
        </View>
        <Text style={styles.durationValue}>{duration} min</Text>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Durée quotidienne</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={60}
          step={5}
          value={duration}
          onValueChange={onDurationChange}
          minimumTrackTintColor={iconColor}
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={iconColor}
        />
      </View>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B3A6B",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B3A6B",
    marginBottom: 16,
  },
  appCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  appLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appIconContainer: {
    width: 44,
    height: 44,
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
  durationValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B7EBD",
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  taskText: {
    fontSize: 16,
    color: "#1B3A6B",
    flex: 1,
  },
  addTaskInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#5B7EBD",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1B3A6B",
    paddingRight: 12,
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addTaskButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5B7EBD",
    marginLeft: 8,
  },
  finishButton: {
    backgroundColor: "#5B7EBD",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#5B7EBD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
