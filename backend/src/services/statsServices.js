// ================================================================
// Logique métier des statistiques
// ================================================================

const db = require("../config/database");

exports.getStats = async (userId) => {
  try {
    // Série actuelle
    const serieQuery = `
      SELECT COALESCE(serie_actuelle, 0) as serie
      FROM serie
      WHERE id_utilisateur = $1
    `;
    const serieResult = await db.query(serieQuery, [userId]);
    const serie = parseInt(serieResult.rows[0]?.serie || 0);

    // ================================================================
    // Données des 7 derniers jours
    // ================================================================
    const weekQuery = `
      SELECT 
        date_activite::date as jour,
        BOOL_OR(activite_validee) as validated
      FROM activite
      WHERE id_utilisateur = $1
        AND date_activite >= CURRENT_DATE - INTERVAL '6 days'
        AND date_activite <= CURRENT_DATE
      GROUP BY date_activite::date
      ORDER BY date_activite::date ASC
    `;
    const weekResult = await db.query(weekQuery, [userId]);

    // Construire le tableau des 7 jours
    const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Formater la date en YYYY-MM-DD pour comparer avec les résultats SQL
      const dateStr = date.toISOString().split("T")[0];

      // Chercher si ce jour existe dans les résultats de la BDD
      const found = weekResult.rows.find(
        (row) => row.jour.toISOString().split("T")[0] === dateStr
      );

      weekData.push({
        day: jours[date.getDay()],
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        validated: found ? found.validated : false,
      });
    }

    // ================================================================
    // Routines complétées
    // ================================================================
    const routinesQuery = `
      SELECT COUNT(*) as total
      FROM activite
      WHERE id_utilisateur = $1
        AND activite_validee = true
    `;
    const routinesResult = await db.query(routinesQuery, [userId]);
    const routinesCompletees = parseInt(routinesResult.rows[0]?.total || 0);

    // ================================================================
    // Temps total
    // ================================================================
    const tempsQuery = `
      SELECT COALESCE(SUM(duree_minutes), 0) as total_minutes
      FROM activite
      WHERE id_utilisateur = $1
        AND activite_validee = true
    `;
    const tempsResult = await db.query(tempsQuery, [userId]);
    const totalMinutes = parseInt(tempsResult.rows[0]?.total_minutes || 0);

    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const tempsTotal = `${heures}h ${minutes}m`;

    // ================================================================
    // Taux de réussite
    // ================================================================
    const joursValidesCount = weekData.filter((d) => d.validated).length;
    const tauxReussite = Math.round((joursValidesCount / 7) * 100);

    const stats = {
      routines_completees: routinesCompletees,
      temps_total: tempsTotal,
      serie_actuelle: serie,
      taux_reussite: tauxReussite,
    };

    return { weekData, stats };
  } catch (error) {
    console.error("Erreur getStats:", error);
    throw error;
  }
};
