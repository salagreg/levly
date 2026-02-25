// ================================================================
// Contrôleur pour la synchronisation
// ================================================================

const syncService = require("../services/syncServices");

// ================================================================
// GET /api/sync/status - Vérifier statut connexion apps
// ================================================================
exports.getStatus = async (req, res) => {
  console.log("🔄 CONTROLLER getStatus appelé !");

  try {
    const userId = req.user?.userId || req.user?.id || 1;
    console.log("👤 userId:", userId);

    const status = await syncService.getConnectionStatus(userId);

    res.status(200).json(status);
  } catch (error) {
    console.error("Erreur getStatus:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du statut",
    });
  }
};
