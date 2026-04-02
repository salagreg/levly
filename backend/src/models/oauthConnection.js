// ==============================================================
// Modèle de données pour les connexions OAuth externes
// Centralise toutes les connexions (Strava, Garmin, Fitbit...)
// ===============================================================
const pool = require("../config/database");

class OAuthConnection {
  // Créer ou mettre à jour une connexion OAuth
  // ON CONFLICT permet de faire un "upsert" :
  // si la connexion existe déjà → on met à jour, sinon → on crée
  static async upsert(data) {
    const {
      id_utilisateur,
      source_externe,
      external_user_id,
      access_token,
      refresh_token,
      token_expires_at,
    } = data;

    const query = `
      INSERT INTO oauth_connection (
        id_utilisateur,
        source_externe,
        external_user_id,
        access_token,
        refresh_token,
        token_expires_at,
        date_maj
      )
      VALUES ($1, $2, $3, $4, $5, $6, now())
      ON CONFLICT (source_externe, external_user_id)
      DO UPDATE SET
        access_token     = EXCLUDED.access_token,
        refresh_token    = EXCLUDED.refresh_token,
        token_expires_at = EXCLUDED.token_expires_at,
        date_maj         = now()
      RETURNING *
    `;

    const result = await pool.query(query, [
      id_utilisateur,
      source_externe,
      external_user_id,
      access_token,
      refresh_token,
      token_expires_at,
    ]);

    return result.rows[0];
  }

  // Récupérer une connexion par utilisateur et source
  static async findByUserAndSource(userId, sourceExterne) {
    const query = `
      SELECT * FROM oauth_connection
      WHERE id_utilisateur = $1
      AND source_externe = $2
    `;
    const result = await pool.query(query, [userId, sourceExterne]);
    return result.rows[0] || null;
  }

  // Récupérer une connexion par l'ID externe (pour le webhook)
  // C'est la requête clé : "owner_id Strava 789 → quel utilisateur Levly ?"
  static async findByExternalUserId(sourceExterne, externalUserId) {
    const query = `
      SELECT * FROM oauth_connection
      WHERE source_externe = $1
      AND external_user_id = $2
    `;
    const result = await pool.query(query, [sourceExterne, externalUserId]);
    return result.rows[0] || null;
  }

  // Mettre à jour les tokens (après un refresh)
  static async updateTokens(id, tokens) {
    const query = `
      UPDATE oauth_connection
      SET
        access_token     = $1,
        refresh_token    = $2,
        token_expires_at = $3,
        date_maj         = now()
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      tokens.access_token,
      tokens.refresh_token,
      tokens.token_expires_at,
      id,
    ]);
    return result.rows[0] || null;
  }

  // Supprimer une connexion (déconnexion)
  static async delete(userId, sourceExterne) {
    const query = `
      DELETE FROM oauth_connection
      WHERE id_utilisateur = $1
      AND source_externe = $2
      RETURNING *
    `;
    const result = await pool.query(query, [userId, sourceExterne]);
    return result.rows[0] || null;
  }
}

module.exports = OAuthConnection;
