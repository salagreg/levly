// ================================================================
// Contrôleur pour les récompenses
// ================================================================

const rewardsService = require("../services/rewardsServices");

// ================================================================
// GET /api/rewards - Récupérer les badges
// ================================================================
exports.getBadges = async (req, res) => {
  console.log("🏆🏆🏆 CONTROLLER getBadges appelé !");

  try {
    const userId = req.user?.userId || req.user?.id || 1;
    console.log("👤 userId:", userId);

    const data = await rewardsService.getBadges(userId);

    res.status(200).json(data);
  } catch (error) {
    console.error("Erreur getBadges:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des badges",
    });
  }
};
