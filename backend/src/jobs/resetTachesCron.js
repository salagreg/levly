// ================================================================
// CRON Job - Supprimer toutes les tâches quotidiennes à 00h00
// ================================================================

const cron = require("node-cron");
const db = require("../config/database");

// ================================================================
// Job qui s'exécute chaque jour à 00h00
// ================================================================
const resetTachesQuotidiennes = () => {
  // Syntaxe cron: seconde minute heure jour mois jour-semaine
  cron.schedule("0 0 * * *", async () => {
    try {
      // Supprimer TOUTES les tâches
      const query = `DELETE FROM tache`;

      const result = await db.query(query);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression des tâches:");
      console.error(error);
    }
  });
};

module.exports = resetTachesQuotidiennes;
