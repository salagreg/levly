const bcrypt = require('bcrypt');
const User = require('../models/user');

const register = async (req, res) => {
  try {
    const { prenom, nom, date_de_naissance, email, mot_de_passe } = req.body;

    if (!prenom || !nom || !email || !mot_de_passe || !date_de_naissance) {
      return res.status(400).json({ 
        message: "Tous les champs sont obligatoires" 
      });
    }

    // 3. Vérifier si l'email existe déjà
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        message: "Cet email est déjà utilisé" 
      });
    }

    // 4. Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // 5. Créer l'utilisateur
    const newUser = await User.createUser({
      prenom,
      nom,
      date_de_naissance,
      email,
      mot_de_passe: hashedPassword,
    });

    // 6. Retourner la réponse (SANS le mot de passe)
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        prenom: newUser.prenom,
        nom: newUser.nom,
        date_de_naissance: newUser.date_de_naissance,
        email: newUser.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'inscription",
      error: error.message
    });
  }
};

const login = (req, res) => {
  // À implémenter plus tard
  res.status(501).json({ message: "Login pas encore implémenté" });
};

module.exports = {
  register,
  login
};
