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
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import quotes from "../data/quotes.json";
import {
  getDashboard,
  getTaches,
  toggleTache,
  createTache,
  deleteTache,
} from "../services/dashboardService";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  // États pour les données
  const [tokens, setTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [apps, setApps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour le modal d'ajout de tâche
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

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

      // Mettre à jour les tokens, streak et apps
      setTokens(data.tokens || 0);
      setStreak(data.streak || 0);
      setApps(data.apps || []);

      // ✅ Charger les tâches (déjà supprimées par le CRON si nouvelle journée)
      const tachesData = await getTaches();

      // Mapper le format
      const mappedTasks = tachesData.map((tache: any) => ({
        id: tache.id_tache,
        text: tache.titre,
        completed: tache.completee,
        category: "Personnel",
      }));

      setTasks(mappedTasks);
      console.log("✅ Tâches chargées:", mappedTasks.length);
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
  const loadQuoteOfTheDay = () => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );
    const quoteIndex = dayOfYear % quotes.length;
    setQuote(quotes[quoteIndex]);
  };

  // Cocher/décocher une tâche
  const handleToggleTask = async (taskId: number) => {
    try {
      const currentTask = tasks.find((task) => task.id === taskId);
      if (!currentTask) return;

      const newCompletedState = !currentTask.completed;

      // Optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: newCompletedState } : task
        )
      );

      // Appel API
      await toggleTache(taskId, newCompletedState);
      console.log("✅ Tâche mise à jour:", taskId, newCompletedState);
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

  // Ouvrir le modal d'ajout
  const handleOpenAddModal = () => {
    setNewTaskTitle("");
    setModalVisible(true);
  };

  // Créer une nouvelle tâche
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un titre pour la tâche");
      return;
    }

    try {
      setCreatingTask(true);
      console.log("➕ Création tâche:", newTaskTitle);

      // Appel API
      await createTache(newTaskTitle.trim());

      // Recharger les tâches
      await loadDashboardData();

      // Fermer le modal
      setModalVisible(false);
      setNewTaskTitle("");

      Alert.alert("Succès", "Tâche ajoutée ! 🎉");
    } catch (error) {
      console.error("Erreur création tâche:", error);
      Alert.alert("Erreur", "Impossible de créer la tâche");
    } finally {
      setCreatingTask(false);
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId: number) => {
    Alert.alert(
      "Supprimer la tâche",
      "Êtes-vous sûr de vouloir supprimer cette tâche ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ Suppression tâche:", taskId);

              // Optimistic update
              setTasks((prev) => prev.filter((task) => task.id !== taskId));

              // Appel API
              await deleteTache(taskId);

              Alert.alert("Succès", "Tâche supprimée ! 🗑️");
            } catch (error) {
              console.error("Erreur suppression tâche:", error);

              // Rollback
              await loadDashboardData();

              Alert.alert("Erreur", "Impossible de supprimer la tâche");
            }
          },
        },
      ]
    );
  };

  // Bouton de suppression (affiché lors du swipe)
  const renderRightActions = (progress: any, dragX: any, taskId: number) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(taskId)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Valider la journée
  const handleValidateDay = () => {
    Alert.alert(
      "Fonctionnalité à venir",
      "La validation quotidienne sera implémentée dans Sprint 6"
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* BLOC FIXE */}
        <View style={styles.fixedHeader}>
          {/* Titre + Stats */}
          <View style={styles.topRow}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Tableau de bord
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Ionicons name="flame" size={16} color="#FFFFFF" />
                <Text style={styles.statValue}>{tokens}</Text>
              </View>

              <View style={[styles.statBadge, styles.statBadgeStreak]}>
                <Ionicons name="disc" size={16} color="#FFFFFF" />
                <Text style={styles.statValue}>{streak}</Text>
              </View>
            </View>
          </View>

          {/* Citation */}
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

            {/* Bouton Valider */}
            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidateDay}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.validateButtonText}>Valider ma journée</Text>
            </TouchableOpacity>
          </View>

          {/* Séparateur */}
          <View style={styles.separator} />

          {/* Tâches du jour */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkbox" size={22} color="#1B3A6B" />
              <Text style={styles.sectionTitle}>Tâches du jour</Text>

              {/* Bouton + pour ajouter */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleOpenAddModal}
              >
                <Ionicons name="add-circle" size={28} color="#5B7EBD" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <Text style={styles.loadingText}>Chargement...</Text>
            ) : tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                  Aucune tâche pour aujourd'hui
                </Text>
                <Text style={styles.emptySubtext}>
                  Appuyez sur + pour ajouter une tâche
                </Text>
              </View>
            ) : (
              tasks.map((task) => (
                <Swipeable
                  key={task.id}
                  renderRightActions={(progress, dragX) =>
                    renderRightActions(progress, dragX, task.id)
                  }
                  overshootRight={false}
                >
                  <TouchableOpacity
                    style={styles.taskCard}
                    onPress={() => handleToggleTask(task.id)}
                    activeOpacity={0.7}
                  >
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
                </Swipeable>
              ))
            )}
          </View>
        </ScrollView>

        {/* Modal d'ajout de tâche */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalContent}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={styles.modalTitle}>Nouvelle tâche</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ex: Faire la vaisselle"
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  autoFocus
                  maxLength={100}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.createButton]}
                    onPress={handleCreateTask}
                    disabled={creatingTask}
                  >
                    <Text style={styles.createButtonText}>
                      {creatingTask ? "Création..." : "Ajouter"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    flex: 1,
  },
  addButton: {
    padding: 4,
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
  loadingText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    marginTop: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
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
  deleteButton: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B3A6B",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1B3A6B",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#5B7EBD",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
