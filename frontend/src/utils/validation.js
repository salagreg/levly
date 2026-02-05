// ===============================================================
// Vérification des champs
// ===============================================================
const validation = {
  // Validation email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validation mot de passe (min 6 caractères)
  isValidPassword: (password) => {
    return password && password.length >= 6;
  },

  // Validation champ non vide
  isNotEmpty: (value) => {
    return value && value.trim().length > 0;
  },

  // Validation date de naissance (format DD/MM/YYYY)
  isValidDate: (date) => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(date);
  },

  // Validation formulaire inscription complet
  validateRegisterForm: (formData) => {
    const errors = {};

    if (!validation.isNotEmpty(formData.prenom)) {
      errors.prenom = "Le prénom est obligatoire";
    }

    if (!validation.isNotEmpty(formData.nom)) {
      errors.nom = "Le nom est obligatoire";
    }

    if (!validation.isNotEmpty(formData.date_de_naissance)) {
      errors.date_de_naissance = "La date de naissance est obligatoire";
    }

    if (!validation.isValidEmail(formData.email)) {
      errors.email = "Email invalide";
    }

    if (!validation.isValidPassword(formData.mot_de_passe)) {
      errors.mot_de_passe =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Validation formulaire connexion
  validateLoginForm: (formData) => {
    const errors = {};

    if (!validation.isValidEmail(formData.email)) {
      errors.email = "Email invalide";
    }

    if (!validation.isValidPassword(formData.mot_de_passe)) {
      errors.mot_de_passe =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default validation;
