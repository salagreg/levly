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

    return response.data;
  } catch (error) {
    console.error("Erreur getTaches:", error);
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

    return response.data;
  } catch (error) {
    console.error("Erreur createTache:", error);
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

    const response = await axios.delete(`${API_BASE_URL}/taches/${tacheId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur deleteTache:", error);
    throw error;
  }
};

// ================================================================
// Valider la journée
// ================================================================
export const validateDay = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    // Détection automatique du fuseau horaire
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const url = `${API_BASE_URL}/validation/recovery`;

    const response = await axios.post(
      url,
      { timezone },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Erreur validateDay:", error);
    console.error("❌ Détails erreur:", error.response?.data || error.message);
    throw error;
  }
};
