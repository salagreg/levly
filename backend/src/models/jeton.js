// ==============================================================
// Modèle de données pour les jetons (tokens)
// ===============================================================

const pool = require("../config/database");

class Jeton {
  // Ajouter des tokens à un utilisateur
  static async addTokens(userId, montant, origine) {
    const query = `
      INSERT INTO jeton (
        id_utilisateur,
        montant_jeton,
        origine_jeton
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(query, [userId, montant, origine]);
    return result.rows[0];
  }

  // Récupérer le solde total d'un utilisateur
  static async getBalance(userId) {
    const query = `
      SELECT SUM(montant_jeton) as solde
      FROM jeton 
      WHERE id_utilisateur = $1
    `;

    const result = await pool.query(query, [userId]);

    // Si aucune transaction, retourner 0
    return parseInt(result.rows[0].solde || 0, 10);
  }

  // Récupérer l'historique des transactions d'un utilisateur
  static async getHistory(userId, limit = 10) {
    const query = `
      SELECT * FROM jeton 
      WHERE id_utilisateur = $1 
      ORDER BY date_creation DESC 
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Compter le nombre de transactions d'un utilisateur
  static async countTransactions(userId) {
    const query = `
      SELECT COUNT(*) 
      FROM jeton 
      WHERE id_utilisateur = $1
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = Jeton;
