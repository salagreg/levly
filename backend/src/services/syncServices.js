// ================================================================
// Vérifier statut connexion apps
// ================================================================

const db = require("../config/database");

// ================================================================
// Vérifier le statut de connexion des apps
// ================================================================
exports.getConnectionStatus = async (userId) => {
  try {
    // Vérifier si Strava est connecté
    const stravaQuery = `
      SELECT id_pilier, access_token
      FROM pilier
      WHERE id_utilisateur = $1 
        AND source_externe = 'strava'
        AND pilier_actif = true
    `;

    const stravaResult = await db.query(stravaQuery, [userId]);
    const stravaConnected =
      stravaResult.rows.length > 0 &&
      stravaResult.rows[0].access_token !== null;

    // Vérifier si Spotify est connecté
    const spotifyQuery = `
      SELECT id_pilier, access_token
      FROM pilier
      WHERE id_utilisateur = $1 
        AND source_externe = 'spotify'
        AND pilier_actif = true
    `;

    const spotifyResult = await db.query(spotifyQuery, [userId]);
    const spotifyConnected =
      spotifyResult.rows.length > 0 &&
      spotifyResult.rows[0].access_token !== null;

    return {
      strava: stravaConnected,
      spotify: spotifyConnected,
    };
  } catch (error) {
    console.error("❌ Erreur getConnectionStatus:", error);
    throw error;
  }
};
