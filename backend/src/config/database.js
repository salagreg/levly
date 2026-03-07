// Configuration de la connexion à la base de données PostgreSQL
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Requis pour Render
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
);

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Erreur de connexion à PostgreSQL:", err.stack);
  } else {
    release();
  }
});

module.exports = pool;
