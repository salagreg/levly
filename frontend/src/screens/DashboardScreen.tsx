// ================================================================
// DashboardScreen - Tableau de bord principal
// ================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import quotes from "../data/quotes.json";
import {
  getDashboard,
  validateDay,
  toggleTask,
} from "../services/dashboardService";
import { Alert } from "react-native";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  // États pour les données
  const [tokens, setTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [apps, setApps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
    loadQuoteOfTheDay();
  }, []);

  // Fonction pour charger les données du dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();

      // Mettre à jour les états avec les données reçues
      setTokens(data.tokens || 0);
      setStreak(data.streak || 0);
      setApps(data.apps || []);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les données. Vérifiez que le backend est démarré."
      );
    } finally {
      setLoading(false);
    }
  };

  // Charger la citation du jour
  useEffect(() => {
    loadQuoteOfTheDay();
  }, []);

  const loadQuoteOfTheDay = () => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );
    const quoteIndex = dayOfYear % quotes.length;
    setQuote(quotes[quoteIndex]);
  };

  const handleValidateDay = async () => {
    try {
      await validateDay();

      // Recharger les données après validation
      await loadDashboardData();

      Alert.alert("Succès", "Journée validée ! 🎉");
    } catch (error) {
      console.error("Erreur validation:", error);
      Alert.alert("Erreur", "Impossible de valider la journée");
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      // Optimistic update (mise à jour immédiate de l'UI)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );

      // Appel API
      await toggleTask(taskId);
    } catch (error) {
      console.error("Erreur toggle task:", error);

      // Rollback en cas d'erreur
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );

      Alert.alert("Erreur", "Impossible de mettre à jour la tâche");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* BLOC FIXE */}
      <View style={styles.fixedHeader}>
        {/* Titre + Stats sur la même ligne */}
        <View style={styles.topRow}>
          {/* Titre à gauche */}
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Tableau de bord
          </Text>

          {/* Stats à droite */}
          <View style={styles.statsRow}>
            {/* Tokens */}
            <View style={styles.statBadge}>
              <Ionicons name="flame" size={16} color="#FFFFFF" />
              <Text style={styles.statValue}>{tokens}</Text>
            </View>

            {/* Série */}
            <View style={[styles.statBadge, styles.statBadgeStreak]}>
              <Ionicons name="disc" size={16} color="#FFFFFF" />
              <Text style={styles.statValue}>{streak}</Text>
            </View>
          </View>
        </View>

        {/* Citation du jour */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>
      </View>

      {/* SCROLLABLE */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Applications connectées */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps" size={22} color="#1B3A6B" />
            <Text style={styles.sectionTitle}>Applications connectées</Text>
          </View>

          {apps.map((app, index) => (
            <View key={index} style={styles.appCard}>
              {/* Header */}
              <View style={styles.appHeader}>
                <View style={styles.appLeft}>
                  <View
                    style={[
                      styles.appIcon,
                      { backgroundColor: app.iconColor + "15" },
                    ]}
                  >
                    <Ionicons
                      name={app.icon as any}
                      size={24}
                      color={app.iconColor}
                    />
                  </View>
                  <Text style={styles.appName}>{app.name}</Text>
                </View>
                <Text style={styles.appTime}>
                  {app.current}/{app.target} min
                </Text>
              </View>

              {/* Barre de progression */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(
                        (app.current / app.target) * 100,
                        100
                      )}%`,
                      backgroundColor: app.iconColor,
                    },
                  ]}
                />
              </View>
            </View>
          ))}

          {/* Bouton Valider ma journée */}
          <TouchableOpacity
            style={styles.validateButton}
            onPress={handleValidateDay}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.validateButtonText}>Valider ma journée</Text>
          </TouchableOpacity>
        </View>

        {/* Séparateur visuel */}
        <View style={styles.separator} />

        {/* Tâches du jour */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkbox" size={22} color="#1B3A6B" />
            <Text style={styles.sectionTitle}>Tâches du jour</Text>
          </View>

          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => handleToggleTask(task.id)}
              activeOpacity={0.7}
            >
              {/* Checkbox */}
              <View
                style={[
                  styles.checkbox,
                  task.completed && styles.checkboxCompleted,
                ]}
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </View>

              {/* Contenu */}
              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskText,
                    task.completed && styles.taskTextCompleted,
                  ]}
                >
                  {task.text}
                </Text>
                <Text style={styles.taskCategory}>{task.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  fixedHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: width < 375 ? 18 : 22,
    fontWeight: "700",
    color: "#1B3A6B",
    flex: 1,
    paddingRight: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  statBadgeStreak: {
    backgroundColor: "#6B7280",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  quoteContainer: {
    backgroundColor: "#EEF2FF",
    padding: 16,
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "right",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B3A6B",
    marginLeft: 10,
  },
  appCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  appIcon: {
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
  appTime: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B7EBD",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  validateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5B7EBD",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#5B7EBD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  validateButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: "#1B3A6B",
    marginBottom: 4,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  taskCategory: {
    fontSize: 13,
    color: "#6B7280",
  },
});
