// ================================================================
// Routes Rewards
// ================================================================

const express = require("express");
const router = express.Router();

const rewardsController = require("../controllers/rewardsControllers");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/rewards
router.get("/", authMiddleware, rewardsController.getBadges);

module.exports = router;
