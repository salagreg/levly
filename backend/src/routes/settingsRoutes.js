// ================================================================
// Routes Settings
// ================================================================

const express = require("express");
const router = express.Router();

const settingsController = require("../controllers/settingsControllers");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/settings/profile
router.get("/profile", authMiddleware, settingsController.getProfile);

module.exports = router;
