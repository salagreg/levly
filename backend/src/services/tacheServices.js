// ================================================================
// Service pour la gestion des tâches
// ================================================================

const Tache = require("../models/tache");

// ================================================================
// Récupérer toutes les tâches d'un utilisateur
// ================================================================
exports.getTaches = async (userId) => {
  try {
    console.log("📋 getTaches appelé pour userId:", userId);

    const taches = await Tache.findByUser(userId);

    console.log("✅ Tâches récupérées:", taches.length);

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
    console.log("➕ createTache appelé:", { userId, titre });

    if (!titre || titre.trim() === "") {
      throw new Error("Le titre est obligatoire");
    }

    const tache = await Tache.create(userId, titre.trim());

    console.log("✅ Tâche créée:", tache);

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
    console.log("✏️ updateTache appelé:", { tacheId, userId, completee });

    const tache = await Tache.update(tacheId, userId, completee);

    if (!tache) {
      throw new Error("Tâche non trouvée");
    }

    console.log("✅ Tâche mise à jour:", tache);

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
    console.log("🗑️ deleteTache appelé:", { tacheId, userId });

    const tache = await Tache.delete(tacheId, userId);

    if (!tache) {
      throw new Error("Tâche non trouvée");
    }

    console.log("✅ Tâche supprimée:", tache);

    return tache;
  } catch (error) {
    console.error("❌ Erreur deleteTache:", error);
    throw error;
  }
};
