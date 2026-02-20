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
