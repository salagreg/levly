// ================================================================
// Service pour interagir avec l'API Strava
// ================================================================

const axios = require("axios");
const OAuthConnection = require("../models/oauthConnection");
const Pilier = require("../models/pilier");

// ================================================================
// Rafraîchir le token si expiré et retourner un access token valide
// Logique extraite pour être réutilisable par le webhook
// ================================================================
const getValidAccessToken = async (connection) => {
  const now = Math.floor(Date.now() / 1000);

  if (now <= connection.token_expires_at) {
    return connection.access_token;
  }

  // Token expiré → on le rafraîchit
  const response = await axios.post("https://www.strava.com/oauth/token", {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: connection.refresh_token,
  });

  const newTokens = response.data;

  await OAuthConnection.updateTokens(connection.id, {
    access_token: newTokens.access_token,
    refresh_token: newTokens.refresh_token,
    token_expires_at: newTokens.expires_at,
  });

  return newTokens.access_token;
};

// ================================================================
// Récupérer les activités Strava à partir d'un timestamp donné
// ================================================================
const getActivitiesSince = async (accessToken, afterTimestamp) => {
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
  return response.data;
};

// ================================================================
// Récupérer une activité spécifique par son ID
// Utilisé par le webhook qui reçoit uniquement l'ID de l'activité
// ================================================================
const getActivityById = async (accessToken, activityId) => {
  const response = await axios.get(
    `https://www.strava.com/api/v3/activities/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

// ================================================================
// Valider les activités Strava du jour pour un pilier donné
// Appelé depuis le webhook après réception d'un event Strava
// ================================================================
exports.validateStravaActivity = async (userId, activityId) => {
  try {
    // Récupérer la connexion OAuth de l'utilisateur
    const connection = await OAuthConnection.findByUserAndSource(
      userId,
      "strava"
    );

    if (!connection) {
      return {
        success: false,
        error: "Strava non connecté",
      };
    }

    // Récupérer un token valide
    const accessToken = await getValidAccessToken(connection);

    // Récupérer les détails de l'activité
    const activity = await getActivityById(accessToken, activityId);
    const durationMinutes = Math.floor(activity.moving_time / 60);

    // Récupérer le pilier Strava de l'utilisateur
    const pilier = await Pilier.findByUserAndSource(userId, "strava");

    if (!pilier) {
      return {
        success: false,
        error: "Pilier Strava introuvable",
      };
    }

    const target = pilier.objectif_config?.duree_minutes || 30;
    const validated = durationMinutes >= target;

    return {
      success: true,
      pilier_id: pilier.id_pilier,
      source: "strava",
      nom: pilier.nom_pilier,
      target,
      current: durationMinutes,
      validated,
      activity_id: activityId,
    };
  } catch (error) {
    console.error(
      "❌ Erreur validation Strava:",
      error.response?.data || error.message
    );
    return {
      success: false,
      validated: false,
      error: error.message,
    };
  }
};

// ================================================================
// Exposer getValidAccessToken pour réutilisation dans d'autres services
// ================================================================
exports.getValidAccessToken = getValidAccessToken;
