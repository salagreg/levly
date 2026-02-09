// ================================================================
// Routes pour les piliers
// ===============================================================

const express = require("express");
const router = express.Router();

const pilierControllers = require("../controllers/pilierControllers");
const verifyToken = require("../middlewares/authMiddleware");
const { validateBody, validateParams } = require("../middlewares/validationMiddleware");
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
  pilierControllers.connectApp
);

/**
 * @route   GET /api/piliers
 * @desc    Récupérer toutes les applications connectées de l'utilisateur
 */
router.get("/", verifyToken, pilierControllers.getUserApps);

/**
 * @route   PATCH /api/piliers/:id/duree
 * @desc    Modifier la durée objectif d'une application
 */
router.patch(
  "/:id/duree",
  verifyToken,
  validateParams(idParamSchema), // Valider que :id est un nombre valide
  validateBody(updatePilierSchema),
  pilierControllers.updateDureeObjectif
);

/**
 * @route   DELETE /api/piliers/:id
 * @desc    Déconnecter une application
 */
router.delete(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  pilierControllers.disconnectApp
);

module.exports = router;
