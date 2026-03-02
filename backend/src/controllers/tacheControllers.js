// ================================================================
// Contrôleur pour les tâches
// ================================================================

const tacheService = require("../services/tacheServices");

// ================================================================
// GET /api/taches - Récupérer toutes les tâches
// ================================================================
exports.getTaches = async (req, res) => {
  console.log("📋📋📋 CONTROLLER getTaches appelé !");

  try {
    const userId = req.user?.userId || req.user?.id || 1;
    console.log("👤 userId:", userId);

    const taches = await tacheService.getTaches(userId);

    res.status(200).json(taches);
  } catch (error) {
    console.error("Erreur getTaches:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des tâches",
    });
  }
};

// ================================================================
// POST /api/taches - Créer une nouvelle tâche
// ================================================================
exports.createTache = async (req, res) => {
  console.log("➕➕➕ CONTROLLER createTache appelé !");

  try {
    const userId = req.user?.userId || req.user?.id || 1;
    const { titre } = req.body;

    console.log("👤 userId:", userId);
    console.log("📝 titre:", titre);

    if (!titre) {
      return res.status(400).json({
        message: "Le titre est obligatoire",
      });
    }

    const tache = await tacheService.createTache(userId, titre);

    res.status(201).json(tache);
  } catch (error) {
    console.error("Erreur createTache:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la tâche",
    });
  }
};

// ================================================================
// PUT /api/taches/:id - Mettre à jour une tâche
// ================================================================
exports.updateTache = async (req, res) => {
  console.log("✏️✏️✏️ CONTROLLER updateTache appelé !");

  try {
    const userId = req.user?.userId || req.user?.id || 1;
    const tacheId = parseInt(req.params.id);
    const { completee } = req.body;

    console.log("👤 userId:", userId);
    console.log("🆔 tacheId:", tacheId);
    console.log("✅ completee:", completee);

    if (typeof completee !== "boolean") {
      return res.status(400).json({
        message: "Le champ 'completee' doit être un booléen",
      });
    }

    const tache = await tacheService.updateTache(tacheId, userId, completee);

    res.status(200).json(tache);
  } catch (error) {
    console.error("Erreur updateTache:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la tâche",
    });
  }
};

// ================================================================
// DELETE /api/taches/:id - Supprimer une tâche
// ================================================================
exports.deleteTache = async (req, res) => {
  console.log("🗑️🗑️🗑️ CONTROLLER deleteTache appelé !");

  try {
    const userId = req.user?.userId || req.user?.id || 1;
    const tacheId = parseInt(req.params.id);

    console.log("👤 userId:", userId);
    console.log("🆔 tacheId:", tacheId);

    await tacheService.deleteTache(tacheId, userId);

    res.status(200).json({
      message: "Tâche supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteTache:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de la tâche",
    });
  }
};
