// ================================================================
// Service pour interagir avec l'API Spotify
// ================================================================

const axios = require("axios");
const moment = require("moment-timezone");
const Pilier = require("../models/pilier");

// ================================================================
// Récupérer et valider les podcasts Spotify du jour
// ================================================================
exports.validateSpotify = async (pilier, userId, today, timezone) => {
  console.log("🎧 Validation Spotify...");

  try {
    // ================================================================
    // 1. Vérifier et refresh le token si nécessaire
    // ================================================================
    const currentTimestamp = Math.floor(Date.now() / 1000);
    let accessToken = pilier.access_token;

    if (currentTimestamp > pilier.token_expires_at) {
      console.log("🔄 Token Spotify expiré, renouvellement...");

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: pilier.refresh_token,
        }),
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const newTokens = response.data;
      const expiresAt = Math.floor(Date.now() / 1000) + newTokens.expires_in;

      await Pilier.update(pilier.id_pilier, {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || pilier.refresh_token,
        token_expires_at: expiresAt,
      });

      accessToken = newTokens.access_token;
      console.log("✅ Token Spotify renouvelé");
    }

    // ================================================================
    // 2. Calculer le début de journée selon le fuseau utilisateur
    // ================================================================
    const userTimezone = timezone || "UTC";

    const startOfDay = moment.tz(userTimezone).startOf("day");
    const afterTimestamp = startOfDay.valueOf();

    console.log("🌍 Fuseau utilisateur:", userTimezone);
    console.log("🕐 Date actuelle (UTC):", moment().utc().format());
    console.log("🕐 Minuit utilisateur:", startOfDay.format());
    console.log("🕐 Timestamp after:", afterTimestamp);

    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/recently-played",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: 50,
          after: afterTimestamp,
        },
      }
    );

    const items = response.data.items || [];
    console.log(`📊 ${items.length} élément(s) Spotify récupéré(s)`);

    // Filtrer uniquement les podcasts (type "episode")
    console.log("\n🔍 ANALYSE DÉTAILLÉE DES ÉLÉMENTS SPOTIFY:");
    items.forEach((item, index) => {
      console.log(`\n  Élément ${index + 1}:`);
      console.log(`    Nom: ${item.track.name}`);
      console.log(`    Type: ${item.track.type}`);
      console.log(
        `    Durée: ${Math.floor(item.track.duration_ms / 1000 / 60)} min`
      );
      console.log(`    Joué à: ${item.played_at}`);
    });

    const musiques = items.filter((item) => item.track.type === "track");
    console.log(`\n🎵 ${musiques.length} musique(s) trouvée(s) (type "track")`);

    // Pour les musiques, on compte TOUTES (pas de filtre de durée minimale)
    // On additionne juste la durée totale
    const totalDuration = musiques.reduce((sum, item) => {
      return sum + Math.floor(item.track.duration_ms / 1000 / 60);
    }, 0);

    console.log(`📊 ${musiques.length} musique(s) comptabilisée(s)`);

    // ================================================================
    // 6. Vérifier si l'objectif est atteint
    // ================================================================
    const target = pilier.objectif_config?.duree_minutes || 30;
    const validated = totalDuration >= target;

    console.log(`🎯 Objectif Spotify: ${target} min`);
    console.log(
      `${validated ? "✅" : "❌"} ${validated ? "VALIDÉ" : "NON VALIDÉ"}`
    );

    return {
      success: true,
      pilier_id: pilier.id_pilier,
      source: "spotify",
      nom: pilier.nom_pilier,
      target,
      current: totalDuration,
      validated,
      tracks: musiques.length,
    };
  } catch (error) {
    console.error(
      "❌ Erreur validation Spotify:",
      error.response?.data || error.message
    );

    return {
      success: false,
      pilier_id: pilier.id_pilier,
      source: "spotify",
      nom: pilier.nom_pilier,
      validated: false,
      current: 0,
      error: error.message,
    };
  }
};
