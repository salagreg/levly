// ================================================================
// Middleware de validation pour les requêtes HTTP
// ================================================================

/**
 * Middleware de validation pour le body de la requête
 * @param {Object} schema - Schéma Joi à utiliser pour la validation
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);

      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors: errors,
      });
    }

    // Remplace req.body par les données validées
    req.body = value;
    next();
  };
};

/**
 * Middleware de validation pour les paramètres d'URL (:id)
 * @param {Object} schema - Schéma Joi à utiliser pour la validation
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validateBody,
  validateParams,
};
