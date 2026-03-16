// ================================================================
// Service de gestion des piliers (applications connectées)
// ===============================================================

const Pilier = require("../models/pilier");
const { PILIERS } = require("../constants/piliers");
const StravaAPI = require("../integrations/stravaAPI");

// ===============================================================
// Contient la logique métier pour gérer les piliers
// ===============================================================
class PilierService {
  // Récupérer le nom user-friendly d'une application depuis les constantes
  static getAppDisplayName(sourceExterne) {
    for (const pilier of Object.values(PILIERS)) {
      for (const app of Object.values(pilier.applications)) {
        if (app.id === sourceExterne) {
          return app.nom;
        }
      }
    }
    return sourceExterne;
  }

  // Vérifier que le pilier existe et appartient à l'utilisateur
  static async verifyOwnership(pilierId, userId) {
    const pilier = await Pilier.findById(pilierId);

    if (!pilier) {
      throw new Error("Application introuvable");
    }

    if (pilier.id_utilisateur !== userId) {
      throw new Error("Non autorisé");
    }

    return pilier;
  }

  // Connecter une application externe
  static async connectApp(userId, appData) {
    // Vérifier si cette application est déjà connectée
    const existingPilier = await Pilier.findByUserAndSource(
      userId,
      appData.source_externe
    );

    if (existingPilier) {
      const appName = this.getAppDisplayName(appData.source_externe);
      throw new Error(`${appName} est déjà synchronisé.`);
    }

    // Créer la connexion
    const pilierToCreate = {
      ...appData,
      id_utilisateur: userId,
      pilier_actif: true,
    };

    return await Pilier.create(pilierToCreate);
  }

  // Récupérer toutes les applications connectées d'un utilisateur
  static async getUserApps(userId) {
    return await Pilier.findByUserId(userId);
  }

  // Modifier la durée objectif d'une application
  static async updateDureeObjectif(pilierId, userId, nouvelleDuree) {
    // Vérifier la propriété
    await this.verifyOwnership(pilierId, userId);

    // Mettre à jour uniquement la durée
    return await Pilier.update(pilierId, {
      duree_objectif_minutes: nouvelleDuree,
    });
  }

  // ================================================================
  // Mettre à jour la durée d'un pilier (pour l'écran Définir durées)
  // ================================================================
  static async updateDuration(userId, source, duration) {
    try {
      // Vérifier que la durée est valide
      if (duration < 10 || duration > 60) {
        throw new Error("La durée doit être entre 10 et 60 minutes");
      }

      // Trouver le pilier de l'utilisateur
      const pilier = await Pilier.findByUserAndSource(userId, source);

      if (!pilier) {
        throw new Error(`Pilier ${source} non trouvé pour cet utilisateur`);
      }

      // Mettre à jour la durée dans objectif_config
      const updatedConfig = {
        ...pilier.objectif_config,
        duree_minutes: duration,
      };

      const updatedPilier = await Pilier.update(pilier.id_pilier, {
        objectif_config: updatedConfig,
      });

      return updatedPilier;
    } catch (error) {
      console.error("❌ Erreur updateDuration:", error);
      throw error;
    }
  }

  // Déconnecter une application (suppression + révocation OAuth)
  static async disconnectApp(pilierId, userId) {
    const pilier = await this.verifyOwnership(pilierId, userId);

    // Révoquer l'accès OAuth
    await this.revokeOAuthAccess(pilier.source_externe, pilier.access_token);

    return await Pilier.delete(pilierId);
  }

  // Révoquer l'accès OAuth pour une source externe
  static async revokeOAuthAccess(source, accessToken) {
    const appName = this.getAppDisplayName(source);

    try {
      switch (source) {
        case "strava":
          if (accessToken) {
            await StravaAPI.revokeAccess(accessToken);
          }
          break;

        case "spotify":
          // Spotify : pas de révocation OAuth officielle
          // Le token expire automatiquement

          break;

        default:
      }
    } catch (error) {
      console.error(`Erreur révocation OAuth ${appName}:`, error.message);
      // On ne throw pas car la suppression locale doit continuer
    }
  }
}

module.exports = PilierService;
