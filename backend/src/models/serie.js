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
  // Mettre à jour la série après une validation
  // ====================================================
  static async updateSerie(userId) {
    const today = new Date().toISOString().split("T")[0];

    // Calculer la date d'hier
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const hierDate = hier.toISOString().split("T")[0];

    console.log(`  📅 Aujourd'hui: ${today}`);
    console.log(`  📅 Hier: ${hierDate}`);

    // Récupérer la série existante
    const serieExistante = await this.findByUserId(userId);

    // Pas de série existante → Créer avec série = 1
    if (!serieExistante) {
      console.log(`  🆕 Première validation → Création série = 1`);

      const query = `
        INSERT INTO serie (id_utilisateur, serie_actuelle, derniere_validation)
        VALUES ($1, 1, $2)
        RETURNING *
      `;

      const result = await pool.query(query, [userId, today]);
      return result.rows[0];
    }

    const derniereValidation = serieExistante.derniere_validation
      ? serieExistante.derniere_validation.toISOString().split("T")[0]
      : null;

    console.log(`  📅 Dernière validation: ${derniereValidation}`);

    // Déjà validé aujourd'hui → Rien à faire
    if (derniereValidation === today) {
      console.log(`  ⚠️  Déjà validé aujourd'hui`);
      return serieExistante;
    }

    // Dernière validation = hier → Incrémenter
    if (derniereValidation === hierDate) {
      console.log(
        `  🔥 Continuité ! Série ${serieExistante.serie_actuelle} → ${
          serieExistante.serie_actuelle + 1
        }`
      );

      const query = `
        UPDATE serie 
        SET 
          serie_actuelle = serie_actuelle + 1,
          derniere_validation = $1
        WHERE id_utilisateur = $2
        RETURNING *
      `;

      const result = await pool.query(query, [today, userId]);
      return result.rows[0];
    }

    // Sinon → Reset à 1 (jours manqués)
    console.log(`  💔 Jours manqués ! Reset → série = 1`);

    const query = `
      UPDATE serie 
      SET 
        serie_actuelle = 1,
        derniere_validation = $1
      WHERE id_utilisateur = $2
      RETURNING *
    `;

    const result = await pool.query(query, [today, userId]);
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
