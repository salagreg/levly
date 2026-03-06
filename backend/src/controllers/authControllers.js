// ===============================================================
// Contrôleurs pour l'authentification des utilisateurs
// ===============================================================
const authServices = require("../services/authServices");
const { isValidEmail, isValidPassword } = require("../utils/validators");

// ===============================================================
// Inscription d'un nouvel utilisateur
// ===============================================================
const register = async (req, res) => {
  try {
    const { prenom, nom, date_de_naissance, email, mot_de_passe } = req.body;

    // Validation basique
    if (!prenom || !nom || !email || !mot_de_passe || !date_de_naissance) {
      return res.status(409).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    // Format email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Format d'email invalide",
      });
    }

    // Longueur mot de passe
    if (!isValidPassword(mot_de_passe)) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères",
      });
    }

    // Appeler le service
    const user = await authServices.register({
      prenom,
      nom,
      date_de_naissance,
      email,
      mot_de_passe,
    });

    // Retourner la réponse
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token: user.token,
      user: user.user,
    });
  } catch (error) {
    // Gestion des erreurs métier
    if (error.message === "Cet email est déjà utilisé") {
      return res.status(400).json({ message: error.message });
    }

    // Erreur serveur
    res.status(500).json({
      message: "Erreur lors de l'inscription",
      error: error.message,
    });
  }
};

// ===============================================================
// Connexion d'un utilisateur existant
// ===============================================================
const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation basique
    if (!email || !mot_de_passe) {
      return res.status(409).json({
        message: "Email et/ou mot de passe incorrect(s)",
      });
    }

    // Appeler le service
    const result = await authServices.login(email, mot_de_passe);

    // Retourner la réponse
    res.status(200).json({
      message: "Connexion réussie",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    // Gestion des erreurs métier
    if (error.message.includes("incorrect")) {
      return res.status(401).json({ message: error.message });
    }
    if (error.message.includes("désactivé")) {
      return res.status(403).json({ message: error.message });
    }

    // Erreur serveur
    res.status(500).json({
      message: "Erreur lors de la connexion",
      error: error.message,
    });
  }
};

// ===============================================================
// Récupérer les informations de l'utilisateur authentifié
// ===============================================================
const getMe = (req, res) => {
  res.status(200).json({
    message: "Utilisateur authentifié",
    user: req.user,
  });
};

// ================================================================
// Générer un token OAuth temporaire pour connexion apps externes
// ================================================================
const generateOAuthToken = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié",
      });
    }

    // Générer un token JWT temporaire (valide 5 minutes)
    const jwt = require("jsonwebtoken");
    const oauthToken = jwt.sign(
      {
        userId: userId,
        type: "oauth",
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.status(200).json({
      success: true,
      oauthToken: oauthToken,
    });
  } catch (error) {
    console.error("❌ Erreur génération token OAuth:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du token",
    });
  }
};

// ===============================================================
// Export des fonctions pour utilisation dans les routes
// ===============================================================
module.exports = {
  register,
  login,
  getMe,
  generateOAuthToken,
};
