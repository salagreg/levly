// ================================================================
// Routes pour l'intégration avec Strava (OAuth et récupération des activités)
// ================================================================

const express = require("express");
const router = express.Router();

const stravaControllers = require("../controllers/stravaControllers");
const verifyToken = require("../middlewares/authMiddleware");

// ===============================================================
// Routes OAuth Strava
// ===============================================================

/**
 * @route   GET /api/strava/connect
 * @desc    Initier la connexion OAuth Strava
 */
router.get("/connect", verifyToken, stravaControllers.connect);

/**
 * @route   GET /api/strava/callback
 * @desc    Callback OAuth Strava (appelé par Strava après autorisation)
 */
router.get("/callback", stravaControllers.callback);

/**
 * @route   GET /api/strava/activities
 * @desc    Récupérer les activités Strava de l'utilisateur
 */
router.get("/activities", verifyToken, stravaControllers.getActivities);

module.exports = router;
