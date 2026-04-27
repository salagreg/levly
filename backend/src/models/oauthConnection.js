// ==============================================================
// Modèle de données pour les connexions OAuth externes
// Centralise toutes les connexions (Strava, Garmin, Fitbit...)
// ===============================================================
const pool = require("../config/database");

class OAuthConnection {
  // Créer ou mettre à jour une connexion OAuth
  static async upsert(data) {
    try {
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
        ON CONFLICT (id_utilisateur, source_externe)
        DO UPDATE SET
          access_token     = EXCLUDED.access_token,
          refresh_token    = EXCLUDED.refresh_token,
          token_expires_at = EXCLUDED.token_expires_at,
          external_user_id = EXCLUDED.external_user_id,
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

      console.log("✅ oauth_connection upsert result:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ oauth_connection upsert ERROR:", error.message);
      throw error;
    }
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
