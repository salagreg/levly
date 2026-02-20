// ================================================================
// Routes Dashboard
// ================================================================

const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardControllers");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/dashboard
router.get("/dashboard", authMiddleware, dashboardController.getDashboard);

module.exports = router;
