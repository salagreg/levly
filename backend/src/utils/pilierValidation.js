// ===============================================================
// Contient les schémas de validation pour les opérations liées aux piliers.
// ===============================================================

const Joi = require("joi");
const { getPiliersNames, getApplicationsIds } = require("../constants/piliers");

// ===============================================================
// Schéma de validation pour la création d'un pilier
// ===============================================================

const createPilierSchema = Joi.object({
  nom_pilier: Joi.string()
    .valid(...getPiliersNames())
    .required()
    .messages({
      "any.required": "Le nom du pilier est obligatoire",
      "any.only": `Le pilier doit être l'un des suivants : ${getPiliersNames().join(
        ", "
      )}`,
    }),

  duree_objectif_minutes: Joi.number()
    .integer()
    .min(5)
    .max(60)
    .required()
    .messages({
      "number.base": "La durée doit être un nombre",
      "number.integer": "La durée doit être un nombre entier",
      "number.min": "La durée minimale est de 5 minutes",
      "number.max": "La durée maximale est de 60 minutes",
      "any.required": "La durée objectif est obligatoire",
    }),

  source_externe: Joi.string()
    .valid(...getApplicationsIds())
    .required()
    .messages({
      "any.required": "La source externe est obligatoire",
      "any.only": `La source externe doit être l'une des suivantes : ${getApplicationsIds().join(
        ", "
      )}`,
    }),

  pilier_actif: Joi.boolean().optional().default(true).messages({
    "boolean.base": "Le statut du pilier doit être un booléen",
  }),
});

// ===============================================================
// Schéma de validation pour la mise à jour d'un pilier
// ===============================================================

const updatePilierSchema = Joi.object({
  nom_pilier: Joi.string()
    .valid(...getPiliersNames())
    .optional()
    .messages({
      "any.only": `Le pilier doit être l'un des suivants : ${getPiliersNames().join(
        ", "
      )}`,
    }),

  duree_objectif_minutes: Joi.number()
    .integer()
    .min(5)
    .max(60)
    .optional()
    .messages({}),

  source_externe: Joi.string()
    .valid(...getApplicationsIds())
    .optional()
    .messages({}),

  pilier_actif: Joi.boolean().optional().messages({
    "boolean.base": "Le statut du pilier doit être un booléen",
  }),
});

// ===============================================================
// Schéma de validation pour les paramètres d'ID dans les routes
// ===============================================================

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "L'ID doit être un nombre",
    "number.integer": "L'ID doit être un nombre entier",
    "number.positive": "L'ID doit être un nombre positif",
    "any.required": "L'ID est obligatoire",
  }),
});

module.exports = {
  createPilierSchema,
  updatePilierSchema,
  idParamSchema,
};
