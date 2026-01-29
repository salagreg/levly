// Démarre le serveur web Express et gère les routes API.
require("dotenv").config();
const cors = require('cors');
const express = require("express");

const authRoutes = require('./src/routes/authRoutes');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);


const port = process.env.PORT || 3000;


app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API Levly",
    version: "1.0.0",
    endpoints: {
      health: "/health"
    }
  });
});


// Import du pool de connexions à la base de données
const pool = require('./src/config/database');


app.get("/health", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    
    res.status(200).json({
      status: "OK",
      message: "L'API Levly est en cours d'exécution.",
      database: "connecté",
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Échec de la connexion à la base de données",
      error: error.message
    });
  }
});


app.listen(port, () => {
  console.log(`🚀 Serveur Levly démarré sur le port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
});
