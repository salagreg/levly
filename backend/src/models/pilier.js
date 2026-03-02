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
      source_externe,
      pilier_actif = true,
      id_utilisateur,
      access_token = null,
      refresh_token = null,
      token_expires_at = null,
      type_validation = "duree",
      objectif_config = {},
    } = pilierData;

    const query = `
      INSERT INTO pilier (
        nom_pilier, 
        source_externe, 
        pilier_actif, 
        id_utilisateur,
        access_token,
        refresh_token,
        token_expires_at,
        type_validation,
        objectif_config
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `;

    const result = await pool.query(query, [
      nom_pilier,
      source_externe,
      pilier_actif,
      id_utilisateur,
      access_token,
      refresh_token,
      token_expires_at,
      type_validation,
      JSON.stringify(objectif_config),
    ]);

    return result.rows[0];
  }

  // Récupérer tous les piliers d'un utilisateur
  static async findByUserId(userId) {
    const query = "SELECT * FROM pilier WHERE id_utilisateur = $1";
    const result = await pool.query(query, [userId]);

    // Parser le JSON pour chaque pilier
    return result.rows.map((pilier) => ({
      ...pilier,
      objectif_config:
        typeof pilier.objectif_config === "string"
          ? JSON.parse(pilier.objectif_config)
          : pilier.objectif_config,
    }));
  }

  // Récupérer un pilier par son ID
  static async findById(pilierId) {
    const query = "SELECT * FROM pilier WHERE id_pilier = $1";
    const result = await pool.query(query, [pilierId]);

    if (!result.rows[0]) return null;

    const pilier = result.rows[0];
    return {
      ...pilier,
      objectif_config:
        typeof pilier.objectif_config === "string"
          ? JSON.parse(pilier.objectif_config)
          : pilier.objectif_config,
    };
  }

  // Vérifier si une source externe existe déjà pour cet utilisateur
  static async findByUserAndSource(userId, sourceExterne) {
    const query =
      "SELECT * FROM pilier WHERE id_utilisateur = $1 AND source_externe = $2";
    const result = await pool.query(query, [userId, sourceExterne]);

    if (!result.rows[0]) return null;

    const pilier = result.rows[0];
    return {
      ...pilier,
      objectif_config:
        typeof pilier.objectif_config === "string"
          ? JSON.parse(pilier.objectif_config)
          : pilier.objectif_config,
    };
  }

  // Mettre à jour un pilier
  static async update(pilierId, updates) {
    try {
      console.log("✏️ Mise à jour pilier:", pilierId, updates);

      const fields = [];
      const values = [];
      let index = 1;

      // Mise à jour automatique de date_maj
      updates.date_maj = new Date();

      // Si objectif_config est un objet, le convertir en JSON
      if (
        updates.objectif_config &&
        typeof updates.objectif_config === "object"
      ) {
        updates.objectif_config = JSON.stringify(updates.objectif_config);
      }

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

      console.log("📝 Query:", query);
      console.log("📝 Values:", values);

      const result = await pool.query(query, values);

      if (!result.rows[0]) return null;

      const pilier = result.rows[0];
      
      console.log("✅ Pilier mis à jour:", pilier);

      return {
        ...pilier,
        objectif_config:
          typeof pilier.objectif_config === "string"
            ? JSON.parse(pilier.objectif_config)
            : pilier.objectif_config,
      };
    } catch (error) {
      console.error("❌ Erreur update pilier:", error);
      throw error;
    }
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
}

module.exports = Pilier;
