// ================================================================
// Routes pour les tâches
// ================================================================

const express = require("express");
const router = express.Router();

const tacheControllers = require("../controllers/tacheControllers");
const authMiddleware = require("../middlewares/authMiddleware");

// ================================================================
// Toutes les routes sont protégées (nécessitent authentification)
// ================================================================

/**
 * @route   GET /api/taches
 * @desc    Récupérer toutes les tâches de l'utilisateur
 */
router.get("/", authMiddleware, tacheControllers.getTaches);

/**
 * @route   POST /api/taches
 * @desc    Créer une nouvelle tâche
 */
router.post("/", authMiddleware, tacheControllers.createTache);

/**
 * @route   PUT /api/taches/:id
 * @desc    Mettre à jour une tâche (cocher/décocher)
 */
router.put("/:id", authMiddleware, tacheControllers.updateTache);

/**
 * @route   DELETE /api/taches/:id
 * @desc    Supprimer une tâche
 */
router.delete("/:id", authMiddleware, tacheControllers.deleteTache);

module.exports = router;
