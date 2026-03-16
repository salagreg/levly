// ================================================================
// Contrôleur pour les récompenses
// ================================================================

const rewardsService = require("../services/rewardsServices");

// ================================================================
// Récupérer les badges
// ================================================================
exports.getBadges = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || 1;

    const data = await rewardsService.getBadges(userId);

    res.status(200).json(data);
  } catch (error) {
    console.error("Erreur getBadges:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des badges",
    });
  }
};
