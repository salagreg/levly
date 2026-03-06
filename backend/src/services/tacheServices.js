// ================================================================
// Service pour la gestion des tâches
// ================================================================

const Tache = require("../models/tache");

// ================================================================
// Récupérer toutes les tâches d'un utilisateur
// ================================================================
exports.getTaches = async (userId) => {
  try {
    const taches = await Tache.findByUser(userId);

    return taches;
  } catch (error) {
    console.error("❌ Erreur getTaches:", error);
    throw error;
  }
};

// ================================================================
// Créer une nouvelle tâche
// ================================================================
exports.createTache = async (userId, titre) => {
  try {
    if (!titre || titre.trim() === "") {
      throw new Error("Le titre est obligatoire");
    }

    const tache = await Tache.create(userId, titre.trim());

    return tache;
  } catch (error) {
    console.error("❌ Erreur createTache:", error);
    throw error;
  }
};

// ================================================================
// Mettre à jour une tâche (cocher/décocher)
// ================================================================
exports.updateTache = async (tacheId, userId, completee) => {
  try {
    const tache = await Tache.update(tacheId, userId, completee);

    if (!tache) {
      throw new Error("Tâche non trouvée");
    }

    return tache;
  } catch (error) {
    console.error("❌ Erreur updateTache:", error);
    throw error;
  }
};

// ================================================================
// Supprimer une tâche
// ================================================================
exports.deleteTache = async (tacheId, userId) => {
  try {
    const tache = await Tache.delete(tacheId, userId);

    if (!tache) {
      throw new Error("Tâche non trouvée");
    }

    return tache;
  } catch (error) {
    console.error("❌ Erreur deleteTache:", error);
    throw error;
  }
};
