// ================================================================
// statsServices.js - Logique métier des statistiques
// ================================================================

const db = require("../config/database");

// ================================================================
// Récupérer les statistiques de l'utilisateur
// ================================================================
exports.getStats = async (userId) => {
  try {
    console.log("📊 getStats appelé pour userId:", userId);

    // 1. Récupérer la série actuelle
    const serieQuery = `
      SELECT COALESCE(serie_actuelle, 0) as serie
      FROM serie
      WHERE id_utilisateur = $1
    `;
    const serieResult = await db.query(serieQuery, [userId]);
    const serie = parseInt(serieResult.rows[0]?.serie || 0);

    // 2. Récupérer le total de tokens
    const tokensQuery = `
      SELECT COALESCE(SUM(montant_jeton), 0) as total_tokens
      FROM jeton
      WHERE id_utilisateur = $1
    `;
    const tokensResult = await db.query(tokensQuery, [userId]);
    const totalTokens = parseInt(tokensResult.rows[0]?.total_tokens || 0);

    // 3. Générer les données de la semaine (mockées pour MVP)
    const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const today = new Date();

    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Ajuster dimanche

      weekData.push({
        day: jours[dayIndex],
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        validated: i >= 2, // Mock : les 5 derniers jours validés
      });
    }

    console.log("📅 Données semaine (mockées):", weekData);

    // 4. Calculer les stats (mockées pour MVP)
    const joursValidesCount = weekData.filter((d) => d.validated).length;
    const tauxReussite = Math.round((joursValidesCount / 7) * 100);

    const stats = {
      routines_completees: joursValidesCount * 2, // 2 routines par jour
      temps_total: "12h 30m",
      serie_actuelle: serie,
      taux_reussite: tauxReussite,
    };

    console.log("📊 Stats calculées:", stats);

    return {
      weekData,
      stats,
    };
  } catch (error) {
    console.error("❌ Erreur getStats:", error);
    throw error;
  }
};
