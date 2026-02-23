// ================================================================
// Service pour les statistiques
// ================================================================

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";

// ================================================================
// Récupérer les statistiques
// ================================================================
export const getStats = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${API_BASE_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur getStats:", error);
    throw error;
  }
};
