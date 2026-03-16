// ================================================================
// Logique métier des paramètres
// ================================================================

const db = require("../config/database");

// ================================================================
// Récupérer les informations de l'utilisateur
// ================================================================
exports.getUserProfile = async (userId) => {
  try {
    const query = `
      SELECT 
        id,
        prenom,
        nom,
        email,
        date_de_naissance,
        compte_actif,
        date_creation
      FROM utilisateur
      WHERE id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new Error("Utilisateur non trouvé");
    }

    const user = result.rows[0];

    return {
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      date_de_naissance: user.date_de_naissance,
      compte_actif: user.compte_actif,
      date_creation: user.date_creation,
    };
  } catch (error) {
    console.error("❌ Erreur getUserProfile:", error);
    throw error;
  }
};
