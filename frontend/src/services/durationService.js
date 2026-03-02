// ================================================================
// Service pour l'écran Définir les durées
// ================================================================

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";

// ================================================================
// Mettre à jour la durée d'un pilier
// ================================================================
export const updatePilierDuration = async (source, duration) => {
  try {
    const token = await AsyncStorage.getItem("token");

    console.log("⏱️ Mise à jour durée:", { source, duration });

    const response = await axios.put(
      `${API_BASE_URL}/piliers/duration`,
      { source, duration },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Durée mise à jour:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ Erreur updatePilierDuration:", error);
    throw error;
  }
};
