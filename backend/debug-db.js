require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkStravaToken() {
  try {
    const result = await pool.query(`
      SELECT 
        id_pilier, 
        id_utilisateur, 
        access_token, 
        refresh_token, 
        token_expires_at,
        FLOOR(EXTRACT(EPOCH FROM NOW())) as now_timestamp
      FROM pilier 
      WHERE source_externe = 'strava'
    `);

    if (result.rows.length === 0) {
      process.exit(0);
    }

    const pilier = result.rows[0];
    const now = parseInt(pilier.now_timestamp);
    const expiresAt = parseInt(pilier.token_expires_at);

    if (now < expiresAt) {
      const remaining = expiresAt - now;
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
    } else {
      const expired = now - expiresAt;
      const hours = Math.floor(expired / 3600);
    }

    await pool.end();
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

checkStravaToken();
