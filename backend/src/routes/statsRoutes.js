// ================================================================
// Routes Stats
// ================================================================

const express = require("express");
const router = express.Router();

const statsController = require("../controllers/statsControllers");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/stats
router.get("/", authMiddleware, statsController.getStats);

module.exports = router;
