// Contrôleurs pour l'inscription et la connexion des utilisateurs

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


// ===============================================================
// Inscription d'un nouvel utilisateur
// ===============================================================
const register = async (req, res) => {
  try {
    const { prenom, nom, date_de_naissance, email, mot_de_passe } = req.body;

    if (!prenom || !nom || !email || !mot_de_passe || !date_de_naissance) {
      return res.status(400).json({ 
        message: "Tous les champs sont obligatoires" 
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        message: "Cet email est déjà utilisé" 
      });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // Créer l'utilisateur
    const newUser = await User.createUser({
      prenom,
      nom,
      date_de_naissance,
      email,
      mot_de_passe: hashedPassword,
    });

    // Retourner la réponse (sans le mot de passe)
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


// ===============================================================
// Connexion d'un utilisateur existant
// ===============================================================
const login = async (req, res) => {
  try {
    // Récupération des données
    const { email, mot_de_passe } = req.body;

    // Validation
    if (!email || !mot_de_passe) {
      return res.status(400).json({ 
        message: "Tous les champs sont obligatoires" 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        message: "Email et/ou mot de passe incorrect(s)" 
      });
    }

    // Vérifier que le compte est actif
    if (!user.compte_actif) {
      return res.status(403).json({ 
        message: "Compte désactivé. Veuillez contacter le support." 
      });
    }

    // Comparer le mot de passe
    const passwordMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!passwordMatch) {
      return res.status(401).json({ 
        message: "Email et/ou mot de passe incorrect(s)" 
      });
    }

    // Générer le JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },  // Payload
      process.env.JWT_SECRET,                   // Secret
      { expiresIn: '24h' }                      // Options
    );

    // Retourner le token + infos user
    res.status(200).json({
      message: "Connexion réussie",
      token: token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        date_de_naissance: user.date_de_naissance,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la connexion",
      error: error.message
    });
  }
};


module.exports = {
  register,
  login
};
