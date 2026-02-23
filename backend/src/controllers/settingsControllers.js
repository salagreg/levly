// ================================================================
// Contrôleur pour les paramètres
// ================================================================

const settingsService = require("../services/settingsServices");

// ================================================================
// GET /api/settings/profile - Récupérer le profil
// ================================================================
exports.getProfile = async (req, res) => {
  console.log("⚙️⚙️⚙️ CONTROLLER getProfile appelé !");

  try {
    const userId = req.user?.userId || req.user?.id || 1;
    console.log("👤 userId:", userId);

    const profile = await settingsService.getUserProfile(userId);

    res.status(200).json(profile);
  } catch (error) {
    console.error("Erreur getProfile:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du profil",
    });
  }
};
