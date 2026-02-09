// ==============================================================
// Modèle de données pour les piliers
// ===============================================================

const pool = require("../config/database");

// ===============================================================
// Classe Pilier pour interagir avec la table "pilier" dans la base de données
// ===============================================================

class Pilier {
  static async create(pilierData) {
    const {
      nom_pilier,
      duree_objectif_minutes,
      source_externe,
      pilier_actif = true,
      id_utilisateur,
    } = pilierData;

    const query = `
      INSERT INTO pilier (
        nom_pilier, 
        duree_objectif_minutes, 
        source_externe, 
        pilier_actif, 
        id_utilisateur
      ) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;

    const values = [
      nom_pilier,
      duree_objectif_minutes,
      source_externe,
      pilier_actif,
      id_utilisateur,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Récupérer tous les piliers d'un utilisateur
  static async findByUserId(userId) {
    const query = "SELECT * FROM pilier WHERE id_utilisateur = $1";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Récupérer un pilier par son ID
  static async findById(pilierId) {
    const query = "SELECT * FROM pilier WHERE id_pilier = $1";
    const result = await pool.query(query, [pilierId]);
    return result.rows[0] || null;
  }

  // Mettre à jour un pilier
  static async update(pilierId, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    // Mise à jour automatique de date_maj
    updates.date_maj = new Date();

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    if (fields.length === 0) {
      throw new Error("Aucun champ à mettre à jour");
    }

    const query = `
      UPDATE pilier 
      SET ${fields.join(", ")} 
      WHERE id_pilier = $${index} 
      RETURNING *
    `;
    values.push(pilierId);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Supprimer un pilier
  static async delete(pilierId) {
    const query = "DELETE FROM pilier WHERE id_pilier = $1 RETURNING *";
    const result = await pool.query(query, [pilierId]);
    return result.rows[0] || null;
  }

  // Compter les piliers actifs d'un utilisateur
  static async countActiveByUserId(userId) {
    const query =
      "SELECT COUNT(*) FROM pilier WHERE id_utilisateur = $1 AND pilier_actif = true";
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  // Vérifier si une source externe existe déjà pour cet utilisateur
  static async findByUserAndSource(userId, sourceExterne) {
    const query =
      "SELECT * FROM pilier WHERE id_utilisateur = $1 AND source_externe = $2";
    const result = await pool.query(query, [userId, sourceExterne]);
    return result.rows[0] || null;
  }
}

module.exports = Pilier;
