// ===============================================================
// Contrôleur pour la gestion des piliers de l'utilisateur
// ===============================================================

const PilierService = require("../services/pilierServices");

// ===============================================================
// Contient les fonctions de contrôle pour les routes liées aux piliers
// ==============================================================

class PilierControllers {
  /**
   * Connecter une application externe
   * POST /api/piliers
   * Body: { nom_pilier, source_externe, duree_objectif_minutes }
   */
  static async connectApp(req, res) {
    try {
      const userId = req.user.userId;
      const appData = req.body;

      const pilier = await PilierService.connectApp(userId, appData);

      res.status(201).json({
        success: true,
        message: "Application synchronisée avec succès",
        data: pilier,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Récupérer les applications connectées de l'utilisateur
   * GET /api/piliers
   */
  static async getUserApps(req, res) {
    try {
      const userId = req.user.userId;

      const piliers = await PilierService.getUserApps(userId);

      res.status(200).json({
        success: true,
        data: piliers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des applications",
      });
    }
  }

  /**
   * Modifier la durée objectif d'une application
   * PATCH /api/piliers/:id/duree
   * Body: { duree_objectif_minutes }
   */
  static async updateDureeObjectif(req, res) {
    try {
      const userId = req.user.userId;
      const pilierId = req.params.id;
      const { duree_objectif_minutes } = req.body;

      const pilier = await PilierService.updateDureeObjectif(
        pilierId,
        userId,
        duree_objectif_minutes
      );

      res.status(200).json({
        success: true,
        message: "Durée objectif mise à jour",
        data: pilier,
      });
    } catch (error) {
      if (
        error.message.includes("introuvable") ||
        error.message.includes("autorisé")
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Mettre à jour la durée d'un pilier (écran Définir durées)
   * PUT /api/piliers/duration
   * Body: { source, duration }
   */
  static async updateDuration(req, res) {
    console.log("⏱️⏱️⏱️ CONTROLLER updateDuration appelé !");

    try {
      const userId = req.user?.userId || req.user?.id;
      const { source, duration } = req.body;

      console.log("👤 userId:", userId);
      console.log("📱 source:", source);
      console.log("⏱️ duration:", duration);

      if (!source || !duration) {
        return res.status(400).json({
          message: "Les champs 'source' et 'duration' sont obligatoires",
        });
      }

      const pilier = await PilierService.updateDuration(
        userId,
        source,
        duration
      );

      res.status(200).json(pilier);
    } catch (error) {
      console.error("Erreur updateDuration:", error);
      res.status(500).json({
        message: "Erreur lors de la mise à jour de la durée",
        error: error.message,
      });
    }
  }

  /**
   * Déconnecter une application
   * DELETE /api/piliers/:id
   */
  static async disconnectApp(req, res) {
    try {
      const userId = req.user.userId;
      const pilierId = req.params.id;

      await PilierService.disconnectApp(pilierId, userId);

      res.status(200).json({
        success: true,
        message: "Application déconnectée avec succès",
      });
    } catch (error) {
      if (
        error.message.includes("introuvable") ||
        error.message.includes("autorisé")
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur lors de la déconnexion",
      });
    }
  }
}

module.exports = PilierControllers;
