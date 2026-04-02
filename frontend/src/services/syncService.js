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
    const redirectUrl = Linking.createURL("strava-callback");

    const result = await WebBrowser.openAuthSessionAsync(
      `${API_BASE_URL}/strava/connect?token=${oauthToken}`,
      redirectUrl
    );

    if (result.type === "success" || result.type === "dismiss") {
      return { success: true };
    } else if (result.type === "cancel") {
      throw new Error("Connexion Strava annulée");
    } else {
      throw new Error("Erreur lors de la connexion Strava");
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
