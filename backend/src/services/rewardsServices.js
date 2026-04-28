// ================================================================
// Logique métier des récompenses
// ================================================================
const db = require("../config/database");

// ================================================================
// Attribuer les récompenses après une activité validée
// Appelé automatiquement par le webhook Strava
// ================================================================
exports.processRewards = async (
  userId,
  pilierId,
  durationMinutes,
  targetMinutes
) => {
  try {
    const today = new Date().toLocaleDateString("fr-CA");

    const alreadyRewarded = await db.query(
      `SELECT id_activite FROM activite
       WHERE id_utilisateur = $1
       AND id_pilier = $2
       AND date_activite = $3
       AND activite_validee = true`,
      [userId, pilierId, today]
    );

    if (alreadyRewarded.rows.length > 0) {
      return { success: false, reason: "already_rewarded" };
    }

    await db.query(
      `INSERT INTO activite 
        (id_utilisateur, id_pilier, date_activite, duree_minutes, activite_validee, source_externe)
       VALUES ($1, $2, $3, $4, true, 'strava')
       ON CONFLICT (id_utilisateur, id_pilier, date_activite)
       DO UPDATE SET activite_validee = true, duree_minutes = $4`,
      [userId, pilierId, today, durationMinutes]
    );

    if (durationMinutes < targetMinutes) {
      return {
        success: true,
        tokens_gagnes: 0,
        reason: "objective_not_reached",
      };
    }

    const tokensBase = targetMinutes;
    const depassement = durationMinutes - targetMinutes;
    const tokensBonus = Math.floor(depassement * 0.5);
    const tokensGagnes = tokensBase + tokensBonus;

    await db.query(
      `INSERT INTO jeton (id_utilisateur, montant_jeton, origine_jeton)
       VALUES ($1, $2, 'activite_strava')`,
      [userId, tokensGagnes]
    );

    const serieResult = await db.query(
      `SELECT serie_actuelle, derniere_validation FROM serie
       WHERE id_utilisateur = $1`,
      [userId]
    );

    if (serieResult.rows.length === 0) {
      await db.query(
        `INSERT INTO serie (id_utilisateur, serie_actuelle, derniere_validation)
         VALUES ($1, 1, $2)`,
        [userId, today]
      );
    } else {
      const { serie_actuelle, derniere_validation } = serieResult.rows[0];
      const lastDate = derniere_validation
        ? new Date(derniere_validation).toISOString().split("T")[0]
        : null;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newSerie;

      if (lastDate === today) {
        return {
          success: true,
          tokens_gagnes: tokensGagnes,
          reason: "serie_already_updated",
        };
      } else if (lastDate === yesterdayStr) {
        newSerie = serie_actuelle + 1;
      } else {
        newSerie = 1;
      }

      await db.query(
        `UPDATE serie
         SET serie_actuelle = $1, derniere_validation = $2, date_maj = now()
         WHERE id_utilisateur = $3`,
        [newSerie, today, userId]
      );
    }

    return {
      success: true,
      tokens_gagnes: tokensGagnes,
      tokens_base: tokensBase,
      tokens_bonus: tokensBonus,
      duration: durationMinutes,
      target: targetMinutes,
    };
  } catch (error) {
    console.error("❌ Erreur processRewards:", error);
    throw error;
  }
};

// ================================================================
// Récupérer les stats pour les badges
// Les badges sont définis côté frontend — ici on retourne juste les stats
// ================================================================
exports.getBadges = async (userId) => {
  try {
    // Série actuelle
    const serieResult = await db.query(
      `SELECT COALESCE(serie_actuelle, 0) as serie
       FROM serie WHERE id_utilisateur = $1`,
      [userId]
    );
    const serie = serieResult.rows[0]?.serie || 0;

    // Total tokens
    const tokensResult = await db.query(
      `SELECT COALESCE(SUM(montant_jeton), 0) as total_tokens
       FROM jeton WHERE id_utilisateur = $1`,
      [userId]
    );
    const totalTokens = parseInt(tokensResult.rows[0]?.total_tokens || 0);

    // Total activités validées
    const activitesResult = await db.query(
      `SELECT COUNT(*) as total
       FROM activite
       WHERE id_utilisateur = $1 AND activite_validee = true`,
      [userId]
    );
    const totalActivites = parseInt(activitesResult.rows[0]?.total || 0);

    return {
      stats: {
        serie_actuelle: serie,
        total_tokens: totalTokens,
        total_activites: totalActivites,
      },
    };
  } catch (error) {
    console.error("❌ Erreur getBadges:", error);
    throw error;
  }
};
