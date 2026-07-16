// ================================================================
// Service pour la synchronisation des apps externes
// ================================================================

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/api";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

// ================================================================
// Connecter Strava
// ================================================================
export const connectStrava = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/auth/generate-oauth-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const oauthToken = response.data.oauthToken;

    // Ouvre la page de connexion Strava.
    // En Expo Go, le deep link de retour ne fonctionne pas, donc on ne se
    // fie PAS au type de retour de la WebView : on vérifie directement en base.
    await WebBrowser.openAuthSessionAsync(
      `${API_BASE_URL}/strava/connect?token=${oauthToken}`
    );

    // Après fermeture de la WebView, on demande le vrai statut au backend.
    const status = await getConnectionStatus();

    if (status.strava === true) {
      return { success: true };
    } else {
      throw new Error("La connexion Strava n'a pas pu être confirmée");
    }
  } catch (error) {
    console.error("Erreur connectStrava:", error);
    throw error;
  }
};

// ================================================================
// Vérifier le statut de connexion Strava
// ================================================================
export const getConnectionStatus = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${API_BASE_URL}/strava/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur getConnectionStatus:", error);
    throw error;
  }
};
