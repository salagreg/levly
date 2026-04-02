// ===============================================================
// Démarre le serveur web Express et gère les routes API.
// ===============================================================

require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const pilierRoutes = require("./src/routes/pilierRoutes");
const stravaRoutes = require("./src/routes/stravaRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const rewardsRoutes = require("./src/routes/rewardsRoutes");
const statsRoutes = require("./src/routes/statsRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");

const app = express();

// ===============================================================
// Middleware
// ===============================================================

app.use(cors());
app.use(express.json());

// ===============================================================
// Servir les fichiers statiques (images, logos)
// ===============================================================

app.use("/assets", express.static(path.join(__dirname, "src/public/assets")));

// ===============================================================
// Routes API
// ===============================================================

app.use("/api/auth", authRoutes);
app.use("/api/piliers", pilierRoutes);
app.use("/api/strava", stravaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/settings", settingsRoutes);

const port = process.env.PORT || 3000;

// ===============================================================
// Route de base pour vérifier que le serveur fonctionne
// ===============================================================

app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API Levly",
    version: "1.0.0",
    endpoints: {
      health: "/health",
    },
  });
});

// ===============================================================
// Import du pool de connexions à la base de données
// ===============================================================

const pool = require("./src/config/database");

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "OK",
      message: "L'API Levly est en cours d'exécution.",
      database: "connecté",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Échec de la connexion à la base de données",
      error: error.message,
    });
  }
});

app.listen(port, () => {});
