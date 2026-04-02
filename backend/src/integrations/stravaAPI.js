// =================================================================
// Module pour gérer l'intégration avec l'API Strava (OAuth, récupération d'activités, etc.)
// =================================================================
const axios = require("axios");

class StravaAPI {
  // Construire l'URL d'autorisation OAuth Strava
  static getAuthorizationUrl(userId) {
    const baseUrl = "https://www.strava.com/oauth/authorize";

    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID,
      redirect_uri: "http://localhost:3000/api/strava/callback",
      response_type: "code",
      approval_prompt: "auto", // 'force' pour toujours demander, 'auto' pour se souvenir
      scope: "activity:read_all", // Permission de lire toutes les activités
      state: userId.toString(), // Pour retrouver l'utilisateur au callback
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Échanger le code OAuth contre un access token
  static async exchangeCodeForToken(code) {
    try {
      const response = await axios.post("https://www.strava.com/oauth/token", {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: response.data.expires_at,
        athlete_id: response.data.athlete.id,
      };
    } catch (error) {
      console.error(
        "Erreur échange code Strava:",
        error.response?.data || error.message
      );
      throw new Error("Impossible d'obtenir le token Strava");
    }
  }

  // Renouveler un access token expiré
  static async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post("https://www.strava.com/oauth/token", {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: response.data.expires_at,
      };
    } catch (error) {
      console.error(
        "Erreur refresh token Strava:",
        error.response?.data || error.message
      );
      throw new Error("Impossible de renouveler le token Strava");
    }
  }

  static async getTodayActivities(accessToken) {
    try {
      // Calculer minuit aujourd'hui
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
            after: afterTimestamp, // Depuis 0h00 aujourd'hui
            per_page: 30,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erreur Strava:", error.response?.data || error.message);
      throw new Error("Impossible de récupérer les activités Strava");
    }
  }

  // Révoquer l'accès OAuth (déconnexion)
  static async revokeAccess(accessToken) {
    try {
      await axios.post("https://www.strava.com/oauth/deauthorize", null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error(
        "Erreur révocation token Strava:",
        error.response?.data || error.message
      );
      // On ne throw pas d'erreur car la suppression locale doit continuer
    }
  }
}

module.exports = StravaAPI;
