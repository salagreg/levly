// ===============================================================
// Routes d'authentification
// ===============================================================

const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authControllers = require("../controllers/authControllers");
const router = express.Router();

// ===============================================================
// Routes publiques (pas de middleware d'authentification)
// ===============================================================

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);

// ===============================================================
// Routes protégées (nécessitent un token JWT valide)
// ===============================================================
router.get("/me", verifyToken, authControllers.getMe);

module.exports = router;
