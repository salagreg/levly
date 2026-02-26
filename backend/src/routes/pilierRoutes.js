// ================================================================
// Routes pour les piliers
// ================================================================

const express = require("express");
const router = express.Router();

const PilierControllers = require("../controllers/pilierControllers");
const verifyToken = require("../middlewares/authMiddleware");
const {
  validateBody,
  validateParams,
} = require("../middlewares/validationMiddleware");
const {
  createPilierSchema,
  updatePilierSchema,
  idParamSchema,
} = require("../utils/pilierValidation");

// ===============================================================
// Routes protégées (nécessitent un token JWT valide)
// ===============================================================

/**
 * @route   POST /api/piliers
 * @desc    Connecter une application externe
 */
router.post(
  "/",
  verifyToken,
  validateBody(createPilierSchema),
  PilierControllers.connectApp
);

/**
 * @route   GET /api/piliers
 * @desc    Récupérer toutes les applications connectées de l'utilisateur
 */
router.get("/", verifyToken, PilierControllers.getUserApps);

/**
 * @route   PATCH /api/piliers/:id/duree
 * @desc    Modifier la durée objectif d'une application
 */
router.patch(
  "/:id/duree",
  verifyToken,
  validateParams(idParamSchema), // Valider que :id est un nombre valide
  validateBody(updatePilierSchema),
  PilierControllers.updateDureeObjectif
);

/**
 * @route   PUT /api/piliers/duration
 * @desc    Mettre à jour la durée d'un pilier (écran Définir durées)
 */
router.put("/duration", verifyToken, PilierControllers.updateDuration);

/**
 * @route   DELETE /api/piliers/:id
 * @desc    Déconnecter une application
 */
router.delete(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  PilierControllers.disconnectApp
);

module.exports = router;
