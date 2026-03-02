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

    console.log("🔵 Génération token OAuth pour Strava...");

    // Générer un token OAuth temporaire
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
    console.log("✅ Token OAuth reçu:", oauthToken.substring(0, 30) + "...");

    const fullUrl = `${API_BASE_URL}/strava/connect?token=${oauthToken}`;
    console.log("🔗 URL complète:", fullUrl);

    const redirectUrl = Linking.createURL("strava-callback");

    // Ouvrir le navigateur avec le token OAuth temporaire
    console.log("🌐 Ouverture navigateur Strava...");
    const result = await WebBrowser.openAuthSessionAsync(
      `${API_BASE_URL}/strava/connect?token=${oauthToken}`,
      redirectUrl
    );

    console.log("Strava OAuth result:", result);

    // Accepter "dismiss" comme succès (l'utilisateur a fermé après connexion)
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
// Connecter Spotify
// ================================================================
export const connectSpotify = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    console.log("🎧 Génération token OAuth pour Spotify...");

    // Générer un token OAuth temporaire
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
    console.log("✅ Token OAuth reçu:", oauthToken.substring(0, 30) + "...");

    const redirectUri = Linking.createURL("spotify-callback");

    // Ouvrir le navigateur avec le token OAuth temporaire
    console.log("🌐 Ouverture navigateur Spotify...");
    const result = await WebBrowser.openAuthSessionAsync(
      `${API_BASE_URL}/spotify/connect?token=${oauthToken}`,
      redirectUri
    );

    console.log("Spotify OAuth result:", result);

    // Accepter "dismiss" comme succès
    if (result.type === "success" || result.type === "dismiss") {
      return { success: true };
    } else if (result.type === "cancel") {
      throw new Error("Connexion Spotify annulée");
    } else {
      throw new Error("Erreur lors de la connexion Spotify");
    }
  } catch (error) {
    console.error("Erreur connectSpotify:", error);
    throw error;
  }
};

// ================================================================
// Vérifier le statut de connexion des apps
// ================================================================
export const getConnectionStatus = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${API_BASE_URL}/sync/status`, {
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
