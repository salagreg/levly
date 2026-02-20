// ================================================================
// Contrôleur pour le dashboard
// ================================================================

const dashboardService = require("../services/dashboardServices");

// ================================================================
// GET /api/dashboard - Récupérer les données du dashboard
// ================================================================
// ✅ APRÈS
exports.getDashboard = async (req, res) => {
  console.log("🔥🔥🔥 CONTROLLER getDashboard appelé !");
  try {
    // Hardcoder userId = 1 pour tester SANS auth
    const userId = req.user?.userId || req.user?.id || 1;
    console.log("👤 userId:", userId);

    // Appeler le service pour récupérer les données
    const dashboardData = await dashboardService.getDashboardData(userId);

    // Renvoyer les données
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Erreur getDashboard:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des données du dashboard",
    });
  }
};
