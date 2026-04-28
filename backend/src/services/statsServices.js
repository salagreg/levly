// ================================================================
// Logique métier des statistiques
// ================================================================
const db = require("../config/database");

exports.getStats = async (userId) => {
  try {
    // ================================================================
    // Série actuelle
    // ================================================================
    const serieResult = await db.query(
      `SELECT COALESCE(serie_actuelle, 0) as serie
       FROM serie WHERE id_utilisateur = $1`,
      [userId]
    );
    const serie = parseInt(serieResult.rows[0]?.serie || 0);

    // ================================================================
    // Données des 7 derniers jours
    // ================================================================
    const weekResult = await db.query(
      `SELECT 
        date_activite::date as jour,
        BOOL_OR(activite_validee) as validated
       FROM activite
       WHERE id_utilisateur = $1
         AND date_activite >= CURRENT_DATE - INTERVAL '6 days'
         AND date_activite <= CURRENT_DATE
       GROUP BY date_activite::date
       ORDER BY date_activite::date ASC`,
      [userId]
    );

    const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("fr-CA");
      const found = weekResult.rows.find(
        (row) => row.jour.toISOString().split("T")[0] === dateStr
      );
      weekData.push({
        label: jours[date.getDay()],
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        validated: found ? found.validated : false,
        isToday: i === 0,
      });
    }

    // ================================================================
    // Calendrier mensuel — jours validés du mois en cours
    // ================================================================
    const monthResult = await db.query(
      `SELECT DISTINCT date_activite::date as jour
       FROM activite
       WHERE id_utilisateur = $1
         AND activite_validee = true
         AND date_trunc('month', date_activite) = date_trunc('month', CURRENT_DATE)
       ORDER BY jour ASC`,
      [userId]
    );

    const validatedDays = monthResult.rows.map((row) =>
      new Date(row.jour).getDate()
    );

    // ================================================================
    // Routines complétées (total)
    // ================================================================
    const routinesResult = await db.query(
      `SELECT COUNT(*) as total
       FROM activite
       WHERE id_utilisateur = $1 AND activite_validee = true`,
      [userId]
    );
    const routinesCompletees = parseInt(routinesResult.rows[0]?.total || 0);

    // ================================================================
    // Temps total
    // ================================================================
    const tempsResult = await db.query(
      `SELECT COALESCE(SUM(duree_minutes), 0) as total_minutes
       FROM activite
       WHERE id_utilisateur = $1 AND activite_validee = true`,
      [userId]
    );
    const totalMinutes = parseInt(tempsResult.rows[0]?.total_minutes || 0);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const tempsTotal = `${heures}h ${minutes}m`;

    // ================================================================
    // Meilleure série jamais atteinte
    // ================================================================
    const bestSerieResult = await db.query(
      `WITH jours_valides AS (
        SELECT DISTINCT date_activite::date as jour
        FROM activite
        WHERE id_utilisateur = $1 AND activite_validee = true
        ORDER BY jour
      ),
      groupes AS (
        SELECT jour,
          jour - (ROW_NUMBER() OVER (ORDER BY jour))::int AS grp
        FROM jours_valides
      )
      SELECT COUNT(*) as longueur
      FROM groupes
      GROUP BY grp
      ORDER BY longueur DESC
      LIMIT 1`,
      [userId]
    );
    const meilleuresSerie = parseInt(bestSerieResult.rows[0]?.longueur || 0);

    // ================================================================
    // Taux de réussite mensuel
    // ================================================================
    const today = new Date().getDate();
    const tauxReussite =
      today > 0 ? Math.round((validatedDays.length / today) * 100) : 0;

    return {
      weekData,
      validatedDays,
      stats: {
        routines_completees: routinesCompletees,
        temps_total: tempsTotal,
        meilleure_serie: meilleuresSerie,
        taux_reussite: tauxReussite,
      },
    };
  } catch (error) {
    console.error("Erreur getStats:", error);
    throw error;
  }
};
