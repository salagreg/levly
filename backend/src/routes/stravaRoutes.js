// ================================================================
// Routes pour l'intégration avec Strava
// ================================================================

const express = require("express");
const router = express.Router();

const stravaControllers = require("../controllers/stravaControllers");
const verifyToken = require("../middlewares/authMiddleware");

/**
 * @route   GET /api/strava/connect
 * @desc    Initier la connexion OAuth Strava
 */
router.get("/connect", stravaControllers.connect);

/**
 * @route   GET /api/strava/callback
 * @desc    Callback OAuth Strava
 */
router.get("/callback", stravaControllers.callback);

/**
 * @route   GET /api/strava/activities
 * @desc    Récupérer les activités Strava du jour
 */
router.get("/activities", verifyToken, stravaControllers.getActivities);

/**
 * @route   GET /api/strava/status
 * @desc    Vérifier si Strava est connecté pour l'utilisateur
 */
router.get("/status", verifyToken, stravaControllers.getStatus);

/**
 * @route   GET /api/strava/webhook
 * @desc    Validation du webhook par Strava (challenge)
 * @note    Pas de verifyToken ici — c'est Strava qui appelle, pas l'utilisateur
 */
router.get("/webhook", stravaControllers.webhookChallenge);

/**
 * @route   POST /api/strava/webhook
 * @desc    Réception des événements Strava
 * @note    Pas de verifyToken ici — c'est Strava qui appelle, pas l'utilisateur
 */
router.post("/webhook", stravaControllers.webhookEvent);

module.exports = router;
