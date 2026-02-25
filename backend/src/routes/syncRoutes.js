// ================================================================
// Routes Sync
// ================================================================

const express = require("express");
const router = express.Router();

const syncController = require("../controllers/syncControllers");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/sync/status
router.get("/status", authMiddleware, syncController.getStatus);

module.exports = router;
