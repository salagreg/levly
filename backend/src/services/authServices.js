// ===============================================================
// Service d'authentification - Logique métier
// ===============================================================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// ===============================================================
// Inscription d'un nouvel utilisateur
// ===============================================================
const register = async (userData) => {
  const { prenom, nom, date_de_naissance, email, mot_de_passe } = userData;

  // Vérifier si l'email existe déjà
  const existingUser = await User.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Cet email est déjà utilisé");
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

  // Générer un token directement à l'inscription
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Retourner l'utilisateur créé (sans le mot de passe)
  return {
    token: token,
    user: {
      id: newUser.id,
      prenom: newUser.prenom,
      nom: newUser.nom,
      date_de_naissance: newUser.date_de_naissance,
      email: newUser.email,
    },
  };
};

// ===============================================================
// Connexion d'un utilisateur
// ===============================================================
const login = async (email, mot_de_passe) => {
  // Trouver l'utilisateur
  const user = await User.findUserByEmail(email);
  if (!user) {
    throw new Error("Email et/ou mot de passe incorrect(s)");
  }

  // Vérifier que le compte est actif
  if (!user.compte_actif) {
    throw new Error("Compte désactivé. Veuillez contacter le support.");
  }

  // Comparer le mot de passe
  const passwordMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
  if (!passwordMatch) {
    throw new Error("Email et/ou mot de passe incorrect(s)");
  }

  // Générer le JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Retourner les données
  return {
    token: token,
    user: {
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      date_de_naissance: user.date_de_naissance,
      email: user.email,
    },
  };
};

module.exports = {
  register,
  login,
};
