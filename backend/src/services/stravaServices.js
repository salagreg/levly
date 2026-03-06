// ================================================================
// Service pour interagir avec l'API Strava
// ================================================================

const axios = require("axios");
const Pilier = require("../models/pilier");

// ================================================================
// Récupérer et valider les activités Strava du jour
// ================================================================
exports.validateStrava = async (pilier, userId, today) => {
  try {
    // ================================================================
    // 1. Vérifier et refresh le token si nécessaire
    // ================================================================
    const now = Math.floor(Date.now() / 1000);
    let accessToken = pilier.access_token;

    if (now > pilier.token_expires_at) {
      const response = await axios.post("https://www.strava.com/oauth/token", {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: pilier.refresh_token,
      });

      const newTokens = response.data;

      await Pilier.update(pilier.id_pilier, {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        token_expires_at: newTokens.expires_at,
      });

      accessToken = newTokens.access_token;
    }

    // ================================================================
    // 2. Récupérer les activités du jour
    // ================================================================
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const afterTimestamp = Math.floor(startOfDay.getTime() / 1000);

    

    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          after: afterTimestamp,
          per_page: 50,
        },
      }
    );

    const activities = response.data;

    // ================================================================
    // 3. Calculer la durée totale en minutes
    // ================================================================
    const totalDuration = activities.reduce((sum, act) => {
      return sum + Math.floor(act.moving_time / 60);
    }, 0);

    // ================================================================
    // 4. Vérifier si l'objectif est atteint
    // ================================================================
    const target = pilier.objectif_config?.duree_minutes || 30;
    const validated = totalDuration >= target;

    

    return {
      success: true,
      pilier_id: pilier.id_pilier,
      source: "strava",
      nom: pilier.nom_pilier,
      target,
      current: totalDuration,
      validated,
      activities: activities.length,
    };
  } catch (error) {
    console.error(
      "❌ Erreur validation Strava:",
      error.response?.data || error.message
    );

    return {
      success: false,
      pilier_id: pilier.id_pilier,
      source: "strava",
      nom: pilier.nom_pilier,
      validated: false,
      current: 0,
      error: error.message,
    };
  }
};
