// ================================================================
// Intégration avec l'API Spotify pour récupérer les podcasts écoutés
// ================================================================
const axios = require("axios");

class SpotifyAPI {
  static BASE_URL = "https://api.spotify.com/v1";
  static AUTH_URL = "https://accounts.spotify.com";

  // Générer l'URL d'autorisation OAuth Spotify
  static getAuthorizationUrl(userId) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    // Scopes nécessaires pour récupérer l'historique d'écoute
    const scopes = "user-read-recently-played";

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scopes,
      state: userId.toString(),
    });

    return `${this.AUTH_URL}/authorize?${params.toString()}`;
  }

  // Échanger le code d'autorisation contre un access token
  static async exchangeCodeForToken(code) {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

      // Créer l'encodage Base64 pour l'authentification Basic
      const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );

      const response = await axios.post(
        `${this.AUTH_URL}/api/token`,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
      };
    } catch (error) {
      console.error("Erreur échange code Spotify:", error.response?.data);
      throw new Error("Impossible d'obtenir le token Spotify");
    }
  }

  // Renouveler un access token expiré
  static async refreshAccessToken(refreshToken) {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      const authString = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );

      const response = await axios.post(
        `${this.AUTH_URL}/api/token`,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || refreshToken,
        expires_at: Math.floor(Date.now() / 1000) + response.data.expires_in,
      };
    } catch (error) {
      console.error("Erreur refresh token Spotify:", error.response?.data);
      throw new Error("Impossible de renouveler le token Spotify");
    }
  }

  // Récupérer les podcasts écoutés du jour
  static async getTodayPodcasts(accessToken) {
    try {
      // Timestamp du début de la journée (en millisecondes)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const afterTimestamp = startOfDay.getTime();

      // Récupérer les 50 dernières écoutes
      const response = await axios.get(
        `${this.BASE_URL}/me/player/recently-played`,
        {
          params: {
            limit: 50,
            after: afterTimestamp,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const items = response.data.items || [];

      // Filtrer uniquement les épisodes de podcast (type = "episode")
      const podcasts = items
        .filter((item) => item.track?.type === "episode")
        .map((item) => ({
          id: item.track.id,
          name: item.track.name,
          show_name: item.track.show?.name,
          duration_ms: item.track.duration_ms,
          played_at: item.played_at,
        }));

      // Supprimer les doublons (même épisode écouté plusieurs fois)
      const uniquePodcasts = [];
      const seenIds = new Set();

      for (const podcast of podcasts) {
        if (!seenIds.has(podcast.id)) {
          seenIds.add(podcast.id);
          uniquePodcasts.push(podcast);
        }
      }

      return uniquePodcasts;
    } catch (error) {
      console.error(
        "Erreur récupération podcasts Spotify:",
        error.response?.data
      );
      throw new Error("Impossible de récupérer les podcasts Spotify");
    }
  }

  // Révoquer l'accès (optionnel)
  static async revokeAccess(accessToken) {
    // Spotify n'a pas d'endpoint public pour révoquer les tokens
    // La suppression côté Levly suffit
    
  }
}

module.exports = SpotifyAPI;
