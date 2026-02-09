// ================================================================
// Service de gestion des piliers (applications connectées)
// ===============================================================

const Pilier = require("../models/pilier");
const { PILIERS } = require("../constants/piliers");

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
      throw new Error(
        "Non autorisé"
      );
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

  // Déconnecter une application (suppression + révocation OAuth)
  static async disconnectApp(pilierId, userId) {
    const pilier = await this.verifyOwnership(pilierId, userId);

    await this.revokeOAuthAccess(pilier.source_externe, userId);

    return await Pilier.delete(pilierId);
  }

  // Révoquer l'accès OAuth pour une source externe
  static async revokeOAuthAccess(source, userId) {
    const appName = this.getAppDisplayName(source);
    console.log(`[TODO] Révocation OAuth pour ${appName} - User ${userId}`);

    // À implémenter lors de l'intégration des APIs
    // switch (source) {
    //   case 'strava':
    //     await StravaAPI.revokeAccess(userId);
    //     break;
    //   case 'spotify':
    //     await SpotifyAPI.revokeAccess(userId);
    //     break;
    //   default:
    //     throw new Error(`Source OAuth non supportée : ${appName}`);
    // }
  }
}

module.exports = PilierService;
