// ================================================================
// Contrôleur pour les statistiques
// ================================================================

const statsService = require("../services/statsServices");

// ================================================================
// GET /api/stats - Récupérer les statistiques
// ================================================================
exports.getStats = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || 1;

    const data = await statsService.getStats(userId);

    res.status(200).json(data);
  } catch (error) {
    console.error("Erreur getStats:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
    });
  }
};
