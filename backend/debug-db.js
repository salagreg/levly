require('dotenv').config();
const { Pool } = require('pg');

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
      console.log('❌ Aucun pilier Strava trouvé');
      process.exit(0);
    }

    const pilier = result.rows[0];
    const now = parseInt(pilier.now_timestamp);
    const expiresAt = parseInt(pilier.token_expires_at);
    
    console.log('\n🔍 Pilier Strava trouvé:');
    console.log('  ID pilier:', pilier.id_pilier);
    console.log('  User ID:', pilier.id_utilisateur);
    console.log('  Access token:', pilier.access_token ? pilier.access_token.substring(0, 30) + '...' : '❌ NULL');
    console.log('  Refresh token:', pilier.refresh_token ? pilier.refresh_token.substring(0, 30) + '...' : '❌ NULL');
    console.log('\n⏰ Expiration:');
    console.log('  Expires at (timestamp):', expiresAt);
    console.log('  Expires at (date):', new Date(expiresAt * 1000).toISOString());
    console.log('  Now (timestamp):', now);
    console.log('  Now (date):', new Date(now * 1000).toISOString());
    console.log('\n📊 Status:');
    console.log('  Expiré ?', now > expiresAt ? '❌ OUI - Token périmé' : '✅ NON - Token valide');
    
    if (now < expiresAt) {
      const remaining = expiresAt - now;
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      console.log('  Temps restant:', hours, 'heures et', minutes, 'minutes\n');
    } else {
      const expired = now - expiresAt;
      const hours = Math.floor(expired / 3600);
      console.log('  Expiré depuis:', hours, 'heures\n');
    }

    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkStravaToken();
