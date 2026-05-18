// ================================================================
// Logique métier du dashboard
// ================================================================
const Jeton = require("../models/jeton");
const Serie = require("../models/serie");
const Pilier = require("../models/pilier");
const Activite = require("../models/activite");
const pool = require("../config/database");

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
        const targetDuration =
          pilier.objectif_config?.duree_minutes ||
          pilier.duree_objectif_minutes ||
          30;

        const activiteToday = await Activite.findByUserAndDate(
          userId,
          today,
          pilier.id_pilier
        );

        const current = activiteToday?.duree_minutes || 0;
        const validated = activiteToday?.activite_validee || false;

        let icon = "apps";
        let iconColor = "#6B7280";
        let name = pilier.nom_pilier;

        if (pilier.source_externe === "strava") {
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

    // ================================================================
    // Récupérer les 7 derniers jours pour la jauge semaine
    // Pour chaque jour : est-ce qu'au moins un pilier a été validé ?
    // ================================================================
    const weekData = await getWeekData(userId);

    return {
      tokens,
      streak,
      apps,
      weekData,
    };
  } catch (error) {
    console.error("❌ Erreur getDashboardData:", error);
    throw error;
  }
};

// ================================================================
// Générer les données des 7 derniers jours
// ================================================================
const getWeekData = async (userId) => {
  const days = [];
  const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("fr-CA");
    const dayLabel = dayLabels[date.getDay()];
    const isToday = i === 0;

    // Vérifier si au moins une activité validée ce jour
    const result = await pool.query(
      `SELECT COUNT(*) FROM activite
       WHERE id_utilisateur = $1
       AND date_activite = $2
       AND activite_validee = true`,
      [userId, dateStr]
    );

    const validated = parseInt(result.rows[0].count, 10) > 0;

    console.log(`📅 ${dateStr} → validated: ${validated}`);

    days.push({
      date: dateStr,
      label: dayLabel,
      validated,
      isToday,
    });
  }

  return days;
};
