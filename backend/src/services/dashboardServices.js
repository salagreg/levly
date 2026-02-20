// ================================================================
// dashboardServices.js - Logique métier du dashboard
// ================================================================

const db = require("../config/database");

// ================================================================
// Récupérer toutes les données du dashboard pour un utilisateur
// ================================================================
exports.getDashboardData = async (userId) => {
  try {
    console.log("📊 getDashboardData appelé pour userId:", userId);

    // 1. Récupérer les tokens et la série
    const userStatsQuery = `
      SELECT 
        COALESCE(SUM(j.montant_jeton), 0) as total_tokens,
        COALESCE(s.serie_actuelle, 0) as streak
      FROM utilisateur u
      LEFT JOIN jeton j ON u.id = j.id_utilisateur
      LEFT JOIN serie s ON u.id = s.id_utilisateur
      WHERE u.id = $1
      GROUP BY u.id, s.serie_actuelle
    `;

    console.log("🔍 Exécution requête stats...");
    const statsResult = await db.query(userStatsQuery, [userId]);
    const stats = statsResult.rows[0] || { total_tokens: 0, streak: 0 };
    console.log("✅ Stats récupérées:", stats);

    // 2. Récupérer les piliers (applications connectées)
    const piliersQuery = `
      SELECT 
        p.id_pilier,
        p.nom_pilier,
        p.objectif_config,
        p.source_externe,
        COALESCE(SUM(a.duree_minutes), 0) as duree_actuelle
      FROM pilier p
      LEFT JOIN activite a ON p.id_pilier = a.id_pilier 
        AND DATE(a.date_activite) = CURRENT_DATE
      WHERE p.id_utilisateur = $1 AND p.pilier_actif = true
      GROUP BY p.id_pilier
    `;

    console.log("🔍 Exécution requête piliers...");
    const piliersResult = await db.query(piliersQuery, [userId]);
    console.log("✅ Piliers récupérés:", piliersResult.rows);

    // Formatter les piliers pour le frontend
    const apps = piliersResult.rows.map((pilier) => {
      // Extraire l'objectif depuis le JSON
      const objectif_minutes = pilier.objectif_config?.objectif_minutes || 30;

      return {
        name: pilier.source_externe === "strava" ? "Strava" : "Spotify",
        icon:
          pilier.source_externe === "strava"
            ? "bicycle-outline"
            : "musical-notes",
        iconColor: pilier.source_externe === "strava" ? "#FC4C02" : "#1DB954",
        current: parseInt(pilier.duree_actuelle),
        target: objectif_minutes,
        validated: parseInt(pilier.duree_actuelle) >= objectif_minutes,
      };
    });

    console.log("✅ Apps formatées:", apps);

    // 3. Récupérer les tâches du jour (mockées pour le MVP)
    const tasks = [
      {
        id: 1,
        text: "Rendez-vous chez le médecin à 15h",
        category: "Santé",
        completed: false,
      },
      {
        id: 2,
        text: "Acheter du pain et du lait",
        category: "Courses",
        completed: true,
      },
      {
        id: 3,
        text: "Regarder un documentaire sur l'histoire",
        category: "Culture",
        completed: false,
      },
    ];

    // 4. Construire la réponse
    const response = {
      tokens: parseInt(stats.total_tokens),
      streak: parseInt(stats.streak),
      apps: apps,
      tasks: tasks,
    };

    console.log("🎉 Réponse finale:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("❌ Erreur getDashboardData:", error);
    throw error;
  }
};
