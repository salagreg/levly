// ======================================================
// Modèle de données pour les séries (streaks)
// ======================================================

const pool = require("../config/database");

class Serie {
  // ====================================================
  // Récupérer la série d'un utilisateur
  // ====================================================
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM serie 
      WHERE id_utilisateur = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  // ====================================================
  // Créer une nouvelle série pour un utilisateur
  // ====================================================
  static async create(userId) {
    const query = `
      INSERT INTO serie (id_utilisateur, serie_actuelle, date_maj)
      VALUES ($1, 0, NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // ====================================================
  // Mettre à jour la série (incrémenter ou reset)
  // ====================================================
  static async update(userId, newStreak) {
    const query = `
      UPDATE serie 
      SET serie_actuelle = $1, date_maj = NOW()
      WHERE id_utilisateur = $2
      RETURNING *
    `;

    const result = await pool.query(query, [newStreak, userId]);
    return result.rows[0];
  }

  // ====================================================
  // Récupérer le numéro de série actuel
  // ====================================================
  static async getCurrentStreak(userId) {
    const serie = await this.findByUserId(userId);
    return serie ? serie.serie_actuelle : 0;
  }
}

module.exports = Serie;
