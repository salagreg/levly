// ================================================================
// dashboardServices.js - Logique métier du dashboard
// ================================================================

const Jeton = require("../models/jeton");
const Serie = require("../models/serie");
const Pilier = require("../models/pilier");
const Tache = require("../models/tache");

// ================================================================
// Récupérer les données du dashboard (100% dynamique)
// ================================================================
exports.getDashboardData = async (userId) => {
  try {
    console.log("📊 getDashboardData pour userId:", userId);

    // ================================================================
    // 1. Récupérer les tokens (solde total)
    // ================================================================
    const tokens = await Jeton.getBalance(userId);
    console.log("💰 Tokens récupérés:", tokens);

    // ================================================================
    // 2. Récupérer la série
    // ================================================================
    const serieResult = await Serie.findByUserId(userId);
    const streak = serieResult?.serie_actuelle || 0;
    console.log("🔥 Série récupérée:", streak);

    // ================================================================
    // 3. Récupérer les piliers connectés
    // ================================================================
    const piliers = await Pilier.findByUserId(userId);
    console.log("🧱 Piliers trouvés:", piliers);

    // Date du jour (format YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Mapper les piliers pour le frontend
    const apps = await Promise.all(
      piliers.map(async (pilier) => {
        console.log("🔍 Pilier en cours:", {
          nom: pilier.nom_pilier,
          source: pilier.source_externe,
          objectif_config: pilier.objectif_config,
        });

        // Extraire la durée depuis objectif_config
        const targetDuration =
          pilier.objectif_config?.duree_minutes ||
          pilier.duree_objectif_minutes ||
          30;

        console.log("⏱️ Durée extraite:", targetDuration);

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

        console.log("📊 Activité du jour:", {
          pilier: pilier.nom_pilier,
          current,
          target: targetDuration,
          validated,
        });

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

    console.log("📱 Apps formatées:", JSON.stringify(apps, null, 2));

    // ================================================================
    // 4. Récupérer les tâches manuelles (100% dynamique depuis DB)
    // ================================================================
    const taches = await Tache.findByUser(userId);
    console.log("📋 Tâches récupérées:", taches);

    // ================================================================
    // 5. Retourner TOUTES les données du dashboard
    // ================================================================
    const response = {
      tokens,
      streak,
      apps,
      tasks: taches || [],
    };

    console.log(
      "✅ Dashboard data complète:",
      JSON.stringify(response, null, 2)
    );

    return response;
  } catch (error) {
    console.error("❌ Erreur getDashboardData:", error);
    throw error;
  }
};
