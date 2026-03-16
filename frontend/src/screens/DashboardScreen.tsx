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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import {
  getDashboard,
  getTaches,
  toggleTache,
  createTache,
  deleteTache,
  validateDay,
} from "../services/dashboardService";

const { width } = Dimensions.get("window");
const BLUE = "#5B7EBD";
const BG = "#E8EDF6";

const APP_LOGOS: Record<string, any> = {
  spotify: require("../../assets/images/logo_spotify.png"),
  strava: require("../../assets/images/logo_strava.png"),
};

const APP_COLORS: Record<string, string> = {
  spotify: "#1DB954",
  strava: "#FC4C02",
};

const APP_BG: Record<string, string> = {
  spotify: "#191414",
  strava: "#FC4C02",
};

type App = {
  name: string;
  current: number;
  target: number;
  icon: string;
  iconColor: string;
};

type Task = {
  id: number;
  text: string;
  completed: boolean;
  category: string;
};

export default function DashboardScreen() {
  const [prenom, setPrenom] = useState("");
  const [tokens, setTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [apps, setApps] = useState<App[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    loadPrenom();
    loadDashboardData();
  }, []);

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
      const tachesData = await getTaches();
      setTasks(
        tachesData.map((t: any) => ({
          id: t.id_tache,
          text: t.titre,
          completed: t.completee,
          category: "Personnel",
        }))
      );
    } catch {
      Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const newState = !task.completed;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: newState } : t))
      );
      await toggleTache(taskId, newState);
    } catch {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      setCreatingTask(true);
      await createTache(newTaskTitle.trim());
      await loadDashboardData();
      setModalVisible(false);
      setNewTaskTitle("");
    } catch {
      Alert.alert("Erreur", "Impossible de créer la tâche");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    Alert.alert("Supprimer", "Supprimer cette tâche ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            await deleteTache(taskId);
          } catch {
            await loadDashboardData();
          }
        },
      },
    ]);
  };

  const renderRightActions = (_: any, dragX: any, taskId: number) => {
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
          <Ionicons name="trash" size={20} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const handleValidateDay = async () => {
    try {
      const response = await validateDay();
      await loadDashboardData();
      Alert.alert(
        response.data.journee_complete ? "Bravo ! 🎉" : "Bien joué ! 💪",
        `${response.data.piliers_valides}/${response.data.total_piliers} objectifs atteints\n\n` +
          `💰 Tokens gagnés : +${response.data.tokens_gagnes}\n` +
          `🔥 Série : ${response.data.serie} jour(s)`
      );
    } catch {
      Alert.alert("Erreur", "Impossible de valider la journée");
    }
  };

  const getAppLogo = (app: App) => APP_LOGOS[app.name?.toLowerCase()] || null;
  const getAppColor = (app: App) => APP_COLORS[app.name?.toLowerCase()] || BLUE;
  const getAppBg = (app: App) => APP_BG[app.name?.toLowerCase()] || BLUE;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG }}>
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

          {apps.map((app, index) => {
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
                      style={[styles.appIconBox, { backgroundColor: bgColor }]}
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
          })}
        </View>

        {/* Bouton Mettre à jour */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleValidateDay}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Mettre à jour</Text>
        </TouchableOpacity>

        {/* Card Tâches du jour */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="checkbox" size={22} color="#1B3A6B" />
            <Text style={[styles.cardTitle, { flex: 1 }]}>Tâches du jour</Text>
            <TouchableOpacity
              onPress={() => {
                setNewTaskTitle("");
                setModalVisible(true);
              }}
            >
              <Ionicons name="add-circle" size={26} color={BLUE} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done" size={44} color="#C8D7EE" />
              <Text style={styles.emptyText}>
                Aucune tâche pour aujourd'hui
              </Text>
              <Text style={styles.emptySubtext}>
                Appuyez sur + pour ajouter une tâche
              </Text>
            </View>
          ) : (
            tasks.map((task, index) => (
              <Swipeable
                key={task.id}
                renderRightActions={(p, d) => renderRightActions(p, d, task.id)}
                overshootRight={false}
              >
                <TouchableOpacity
                  style={[
                    styles.taskRow,
                    index < tasks.length - 1 && styles.taskRowBorder,
                  ]}
                  onPress={() => handleToggleTask(task.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      task.completed && styles.checkboxDone,
                    ]}
                  >
                    {task.completed && (
                      <Ionicons name="checkmark" size={13} color="#fff" />
                    )}
                  </View>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskText,
                        task.completed && styles.taskDone,
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

      {/* ── MODAL ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalBox}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Nouvelle tâche</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Faire la vaisselle"
                placeholderTextColor="#9AAED4"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
                maxLength={100}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnCreate}
                  onPress={handleCreateTask}
                  disabled={creatingTask}
                >
                  <Text style={styles.btnCreateText}>
                    {creatingTask ? "Création..." : "Ajouter"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────
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

  // ── Scroll ──────────────────────────────────────────────
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },

  // ── Cards ───────────────────────────────────────────────
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

  // ── Apps ────────────────────────────────────────────────
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

  // ── CTA ─────────────────────────────────────────────────
  ctaButton: {
    backgroundColor: BLUE,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // ── Tasks ───────────────────────────────────────────────
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  taskRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8EDF6",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#C8D7EE",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxDone: { backgroundColor: BLUE, borderColor: BLUE },
  taskContent: { flex: 1 },
  taskText: { fontSize: 14, fontWeight: "500", color: "#1A2B4A" },
  taskDone: { textDecorationLine: "line-through", color: "#C8D7EE" },
  taskCategory: { fontSize: 11, color: "#9AAED4", marginTop: 2 },
  deleteButton: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 12,
    marginVertical: 4,
  },

  // ── Empty ───────────────────────────────────────────────
  loadingText: { textAlign: "center", color: "#9AAED4", marginTop: 20 },
  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyText: {
    fontSize: 15,
    color: "#7A9ABF",
    marginTop: 12,
    fontWeight: "500",
  },
  emptySubtext: { fontSize: 13, color: "#9AAED4", marginTop: 6 },

  // ── Modal ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2B4A",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#C8D7EE",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1A2B4A",
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F0F4FB",
  },
  btnCancelText: { color: "#7A9ABF", fontSize: 15, fontWeight: "600" },
  btnCreate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: BLUE,
  },
  btnCreateText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
