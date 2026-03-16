// ================================================================
// Logique métier du dashboard
// ================================================================

const Jeton = require("../models/jeton");
const Serie = require("../models/serie");
const Pilier = require("../models/pilier");
const Tache = require("../models/tache");

// ================================================================
// Récupérer les données du dashboard
// ================================================================
exports.getDashboardData = async (userId) => {
  try {
    // Récupérer les tokens (solde total)
    const tokens = await Jeton.getBalance(userId);

    // Récupérer la série
    const serieResult = await Serie.findByUserId(userId);
    const streak = serieResult?.serie_actuelle || 0;

    // Récupérer les piliers connectés
    const piliers = await Pilier.findByUserId(userId);

    // Date du jour (format YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Mapper les piliers pour le frontend
    const apps = await Promise.all(
      piliers.map(async (pilier) => {
        // Extraire la durée depuis objectif_config
        const targetDuration =
          pilier.objectif_config?.duree_minutes ||
          pilier.duree_objectif_minutes ||
          30;

        // Récupérer l'activité du jour pour ce pilier
        const Activite = require("../models/activite");
        const activiteToday = await Activite.findByUserAndDate(
          userId,
          today,
          pilier.id_pilier
        );

        // Récupérer current depuis l'activité du jour
        const current = activiteToday?.duree_minutes || 0;
        const validated = activiteToday?.activite_validee || false;

        // Mapper les icônes et couleurs selon la source
        let icon = "apps";
        let iconColor = "#6B7280";
        let name = pilier.nom_pilier;

        if (pilier.source_externe === "spotify") {
          icon = "musical-notes";
          iconColor = "#1DB954";
          name = "Spotify";
        } else if (pilier.source_externe === "strava") {
          icon = "bicycle-outline";
          iconColor = "#FC4C02";
          name = "Strava";
        }

        return {
          name,
          icon,
          iconColor,
          current,
          target: targetDuration,
          validated,
        };
      })
    );

    // Récupérer les tâches du jour
    const taches = await Tache.findByUser(userId);

    // ================================================================
    // Retourner les données du dashboard
    // ================================================================
    const response = {
      tokens,
      streak,
      apps,
      tasks: taches || [],
    };

    return response;
  } catch (error) {
    console.error("❌ Erreur getDashboardData:", error);
    throw error;
  }
};
