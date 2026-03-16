// ================================================================
// Modèle pour les tâches du jour
// ================================================================
const db = require("../config/database");

class Tache {
  // ================================================================
  // Récupérer toutes les tâches d'un utilisateur
  // ================================================================
  static async findByUser(userId) {
    const query = `
      SELECT 
        id_tache,
        id_utilisateur,
        titre,
        completee,
        date_creation,
        date_maj
      FROM tache
      WHERE id_utilisateur = $1
      ORDER BY date_creation DESC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // ================================================================
  // Créer une nouvelle tâche
  // ================================================================
  static async create(userId, titre) {
    const query = `
      INSERT INTO tache (id_utilisateur, titre, completee)
      VALUES ($1, $2, false)
      RETURNING *
    `;

    const result = await db.query(query, [userId, titre]);
    return result.rows[0];
  }

  // ================================================================
  // Mettre à jour une tâche (cocher/décocher)
  // ================================================================
  static async update(tacheId, userId, completee) {
    const query = `
      UPDATE tache
      SET 
        completee = $1,
        date_maj = CURRENT_TIMESTAMP
      WHERE id_tache = $2 AND id_utilisateur = $3
      RETURNING *
    `;

    const result = await db.query(query, [completee, tacheId, userId]);
    return result.rows[0];
  }

  // ================================================================
  // Supprimer une tâche
  // ================================================================
  static async delete(tacheId, userId) {
    const query = `
      DELETE FROM tache
      WHERE id_tache = $1 AND id_utilisateur = $2
      RETURNING *
    `;

    const result = await db.query(query, [tacheId, userId]);
    return result.rows[0];
  }
}

module.exports = Tache;
