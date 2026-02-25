// ================================================================
// Service pour les données du dashboard
// ================================================================

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";

// ================================================================
// Récupérer les données du dashboard
// ================================================================
export const getDashboard = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${API_BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur getDashboard:", error);
    throw error;
  }
};

// ================================================================
// Valider la journée
// ================================================================
export const validateDay = async () => {
  try {
    const token = await AsyncStorage.getItem("token"); // ✅ AsyncStorage

    const response = await axios.post(
      `${API_BASE_URL}/validation-quotidienne`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur validateDay:", error);
    throw error;
  }
};

// ================================================================
// Toggle tâche complétée
// ================================================================
export const toggleTask = async (taskId) => {
  try {
    const token = await AsyncStorage.getItem("token"); // ✅ AsyncStorage

    const response = await axios.put(
      `${API_BASE_URL}/taches/${taskId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur toggleTask:", error);
    throw error;
  }
};

// ================================================================
// Créer une nouvelle tâche
// ================================================================
export const createTache = async (titre) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/taches`,
      { titre },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Tâche créée:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erreur createTache:", error);
    throw error;
  }
};

// ================================================================
// Récupérer les tâches de l'utilisateur
// ================================================================
export const getTaches = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${API_BASE_URL}/taches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📋 Tâches récupérées:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erreur getTaches:", error);
    throw error;
  }
};

// ================================================================
// Cocher/décocher une tâche
// ================================================================
export const toggleTache = async (tacheId, completee) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.put(
      `${API_BASE_URL}/taches/${tacheId}`,
      { completee },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Tâche mise à jour:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erreur toggleTache:", error);
    throw error;
  }
};

// ================================================================
// Supprimer une tâche
// ================================================================
export const deleteTache = async (tacheId) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.delete(
      `${API_BASE_URL}/taches/${tacheId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("🗑️ Tâche supprimée:", response.data);

    return response.data;
  } catch (error) {
    console.error("Erreur deleteTache:", error);
    throw error;
  }
};
