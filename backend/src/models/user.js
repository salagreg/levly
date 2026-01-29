const pool = require('../config/database');

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM utilisateur WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

const createUser = async (userData) => {
  const { prenom, nom, email, mot_de_passe, date_de_naissance } = userData;
  
  const query = `
    INSERT INTO utilisateur (prenom, nom, date_de_naissance, email, mot_de_passe)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const values = [prenom, nom, date_de_naissance, email, mot_de_passe];
  const result = await pool.query(query, values);
  
  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser
};
