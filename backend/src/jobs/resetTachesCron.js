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
  // "0 0 * * *" = Tous les jours à 00h00
  cron.schedule("0 0 * * *", async () => {
    console.log("\n🌙 ════════════════════════════════════════");
    console.log("🗑️  CRON JOB: Suppression des tâches quotidiennes");
    console.log("⏰ Heure:", new Date().toLocaleString("fr-FR"));
    console.log("════════════════════════════════════════\n");

    try {
      // Supprimer TOUTES les tâches
      const query = `DELETE FROM tache`;

      const result = await db.query(query);

      console.log(`✅ ${result.rowCount} tâche(s) supprimée(s) !`);
      console.log("🆕 Nouvelle journée = Page blanche !");
      console.log("════════════════════════════════════════\n");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression des tâches:");
      console.error(error);
      console.log("════════════════════════════════════════\n");
    }
  });

  console.log("✅ CRON Job de suppression des tâches activé !");
  console.log("🗑️  Toutes les tâches seront supprimées chaque jour à 00h00");
};

module.exports = resetTachesQuotidiennes;
