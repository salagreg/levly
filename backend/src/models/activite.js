// ==============================================================
// Modèle de données pour les activités des utilisateurs
// ===============================================================
const pool = require("../config/database");

class Activite {
  static async create(activiteData) {
    const {
      id_utilisateur,
      id_pilier,
      date_activite,
      duree_minutes = null,
      source_externe,
      activite_validee,
    } = activiteData;

    const query = `
      INSERT INTO activite (
        id_utilisateur,
        id_pilier,
        date_activite,
        duree_minutes,
        source_externe,
        activite_validee
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      id_utilisateur,
      id_pilier,
      date_activite,
      duree_minutes,
      source_externe,
      activite_validee,
    ]);

    return result.rows[0];
  }

  static async findByUserId(userId, limit = 30) {
    const query = `
      SELECT * FROM activite 
      WHERE id_utilisateur = $1 
      ORDER BY date_activite DESC 
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async findByUserAndDate(userId, date, pilierId) {
    const query = `
      SELECT * FROM activite 
      WHERE id_utilisateur = $1 
        AND date_activite = $2 
        AND id_pilier = $3
    `;

    const result = await pool.query(query, [userId, date, pilierId]);
    return result.rows[0] || null;
  }

  static async countValidatedByUserId(userId) {
    const query = `
      SELECT COUNT(*) 
      FROM activite 
      WHERE id_utilisateur = $1 
        AND activite_validee = true
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  static async update(activiteId, updateData) {
    const { duree_minutes, activite_validee } = updateData;

    const query = `
      UPDATE activite
      SET 
        duree_minutes = $1,
        activite_validee = $2
      WHERE id_activite = $3
      RETURNING *
    `;

    const result = await pool.query(query, [
      duree_minutes,
      activite_validee,
      activiteId,
    ]);

    return result.rows[0];
  }
}

module.exports = Activite;
