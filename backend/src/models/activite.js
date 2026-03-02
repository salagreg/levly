const pool = require("../config/database");

class Activite {
  // Créer une nouvelle activité
  static async create(activiteData) {
    const {
      id_utilisateur,
      id_pilier,
      date_activite,
      duree_minutes = null,
      nombre_episodes = null,
      source_externe,
      activite_validee,
    } = activiteData;

    const query = `
      INSERT INTO activite (
        id_utilisateur,
        id_pilier,
        date_activite,
        duree_minutes,
        nombre_episodes,
        source_externe,
        activite_validee
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      id_utilisateur,
      id_pilier,
      date_activite,
      duree_minutes,
      nombre_episodes,
      source_externe,
      activite_validee,
    ]);

    return result.rows[0];
  }

  // Récupérer toutes les activités d'un utilisateur
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

  // Vérifier si une activité existe déjà pour un jour donné
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

  // Compter les activités validées d'un utilisateur
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

  // Mettre à jour une activité existante
  static async update(activiteId, updateData) {
    const {
      duree_minutes,
      nombre_episodes,
      activite_validee,
    } = updateData;

    const query = `
      UPDATE activite
      SET 
        duree_minutes = $1,
        nombre_episodes = $2,
        activite_validee = $3
      WHERE id_activite = $4
      RETURNING *
    `;

    const result = await pool.query(query, [
      duree_minutes,
      nombre_episodes,
      activite_validee,
      activiteId,
    ]);

    return result.rows[0];
  }
}

module.exports = Activite;
