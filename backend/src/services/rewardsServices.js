// ================================================================
// rewardsServices.js - Logique métier des récompenses
// ================================================================

const db = require("../config/database");

// ================================================================
// Récupérer les badges de l'utilisateur
// ================================================================
exports.getBadges = async (userId) => {
  try {
    console.log("🏆 getBadges appelé pour userId:", userId);

    // 1. Récupérer la série actuelle de l'utilisateur
    const serieQuery = `
      SELECT COALESCE(serie_actuelle, 0) as serie
      FROM serie
      WHERE id_utilisateur = $1
    `;

    const serieResult = await db.query(serieQuery, [userId]);
    const serie = serieResult.rows[0]?.serie || 0;
    console.log("🔥 Série actuelle:", serie);

    // 2. Récupérer le total de tokens
    const tokensQuery = `
      SELECT COALESCE(SUM(montant_jeton), 0) as total_tokens
      FROM jeton
      WHERE id_utilisateur = $1
    `;

    const tokensResult = await db.query(tokensQuery, [userId]);
    const totalTokens = parseInt(tokensResult.rows[0]?.total_tokens || 0);
    console.log("💰 Total tokens:", totalTokens);

    // 3. Définir les badges avec logique de déblocage
    const badges = [
      {
        id: 1,
        name: "Première victoire",
        description: "Complétez votre première journée",
        icon: "🏆",
        unlocked: serie >= 1, // Débloqué dès 1 jour de série
      },
      {
        id: 2,
        name: "Série de 7 jours",
        description: "Maintenez une série de 7 jours consécutifs",
        icon: "🔥",
        unlocked: serie >= 7,
      },
      {
        id: 3,
        name: "Série de 30 jours",
        description: "Maintenez une série de 30 jours consécutifs",
        icon: "💎",
        unlocked: serie >= 30,
      },
      {
        id: 4,
        name: "Expert du temps",
        description: "Accumulez 1000 tokens",
        icon: "⏰",
        unlocked: totalTokens >= 1000,
      },
      {
        id: 5,
        name: "Millionnaire",
        description: "Accumulez 10 000 tokens",
        icon: "💰",
        unlocked: totalTokens >= 10000,
      },
    ];

    console.log("✅ Badges générés:", badges);

    return {
      badges,
      stats: {
        serie_actuelle: serie,
        total_tokens: totalTokens,
      },
    };
  } catch (error) {
    console.error("❌ Erreur getBadges:", error);
    throw error;
  }
};
