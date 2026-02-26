// ================================================================
// Contrôleur pour le dashboard
// ================================================================

const dashboardService = require("../services/dashboardServices");

// ================================================================
// GET /api/dashboard - Récupérer les données du tableau de bord
// ================================================================
exports.getDashboard = async (req, res) => {
  console.log("📊📊📊 CONTROLLER getDashboard appelé !");

  try {
    const userId = req.user?.userId || req.user?.id;

    console.log("👤 userId:", userId);

    // Récupérer les données du dashboard
    const dashboardData = await dashboardService.getDashboardData(userId);

    console.log("✅ Dashboard data:", dashboardData);

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Erreur getDashboard:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du dashboard",
      error: error.message,
    });
  }
};
