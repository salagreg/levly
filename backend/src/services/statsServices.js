// ================================================================
// statsServices.js - Logique métier des statistiques
// ================================================================

const db = require("../config/database");

exports.getStats = async (userId) => {
  try {
    // ----------------------------------------------------------------
    // 1. Série actuelle (déjà réel, on garde)
    // ----------------------------------------------------------------
    const serieQuery = `
      SELECT COALESCE(serie_actuelle, 0) as serie
      FROM serie
      WHERE id_utilisateur = $1
    `;
    const serieResult = await db.query(serieQuery, [userId]);
    const serie = parseInt(serieResult.rows[0]?.serie || 0);

    // ----------------------------------------------------------------
    // 2. Données des 7 derniers jours (VRAI - depuis table activite)
    // ----------------------------------------------------------------
    // On demande à PostgreSQL : pour chaque jour des 7 derniers jours,
    // est-ce qu'il existe AU MOINS UNE activité validée pour cet utilisateur ?
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
    // On doit afficher TOUS les 7 jours même si certains n'ont pas d'activité
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
        // Si le jour existe en BDD et est validé → true, sinon false
        validated: found ? found.validated : false,
      });
    }

    // ----------------------------------------------------------------
    // 3. Routines complétées (VRAI - nombre total d'activités validées)
    // ----------------------------------------------------------------
    // On compte simplement toutes les activités où activite_validee = true
    const routinesQuery = `
      SELECT COUNT(*) as total
      FROM activite
      WHERE id_utilisateur = $1
        AND activite_validee = true
    `;
    const routinesResult = await db.query(routinesQuery, [userId]);
    const routinesCompletees = parseInt(routinesResult.rows[0]?.total || 0);

    // ----------------------------------------------------------------
    // 4. Temps total (VRAI - somme des duree_minutes validées)
    // ----------------------------------------------------------------
    // On additionne toutes les minutes des activités validées
    // puis on convertit en heures et minutes pour l'affichage
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

    // ----------------------------------------------------------------
    // 5. Taux de réussite (VRAI - basé sur les 7 derniers jours réels)
    // ----------------------------------------------------------------
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
