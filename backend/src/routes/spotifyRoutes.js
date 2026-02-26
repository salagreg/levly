const express = require("express");
const router = express.Router();

const SpotifyControllers = require("../controllers/spotifyControllers");
const verifyToken = require("../middlewares/authMiddleware");

// ==============================================================
// Routes OAuth Spotify
// ==============================================================

/**
 * @route   GET /api/spotify/connect
 * @desc    Initier la connexion OAuth Spotify
 */
router.get("/connect", SpotifyControllers.connect);

/**
 * @route   GET /api/strava/callback
 * @desc    Callback OAuth Spotify
 */
router.get("/callback", SpotifyControllers.callback);

/**
 * @route   GET /api/strava/podcasts
 * @desc    Récupérer les podcasts écoutés de l'utilisateur
 */
router.get("/podcasts", verifyToken, SpotifyControllers.getTodayPodcasts);

module.exports = router;
