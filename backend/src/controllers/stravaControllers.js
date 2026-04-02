// =================================================================
// Contrôleur pour gérer l'intégration avec Strava
// =================================================================

const StravaAPI = require("../integrations/stravaAPI");
const Pilier = require("../models/pilier");
const OAuthConnection = require("../models/oauthConnection");
const stravaServices = require("../services/stravaServices");
const rewardsServices = require("../services/rewardsServices");

class StravaController {
  /**
   * Initier la connexion OAuth Strava
   * GET /api/strava/connect
   */
  static async connect(req, res) {
    try {
      const oauthToken = req.query.token;

      if (!oauthToken) {
        return res.status(401).json({
          success: false,
          message: "Token OAuth manquant",
        });
      }

      const jwt = require("jsonwebtoken");
      let decoded;

      try {
        decoded = jwt.verify(oauthToken, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Token OAuth invalide ou expiré",
        });
      }

      if (decoded.type !== "oauth") {
        return res.status(401).json({
          success: false,
          message: "Type de token invalide",
        });
      }

      const userId = decoded.userId;
      const authUrl = StravaAPI.getAuthorizationUrl(userId);
      res.redirect(authUrl);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la connexion à Strava",
        error: error.message,
      });
    }
  }

  /**
   * Callback OAuth Strava
   * GET /api/strava/callback?code=...&state=...
   *
   * Strava renvoie ici après que l'utilisateur a autorisé l'accès.
   * La réponse contient les tokens ET les infos de l'athlète (dont son ID).
   * On stocke tout dans oauth_connection et on crée le pilier si besoin.
   */
  static async callback(req, res) {
    try {
      const { code, state, error } = req.query;

      if (error === "access_denied") {
        return res.status(400).json({
          success: false,
          message: "Autorisation Strava refusée",
        });
      }

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          message: "Paramètres OAuth manquants",
        });
      }

      const userId = parseInt(state);

      // Échanger le code contre les tokens
      // La réponse Strava contient aussi athlete.id
      const tokenResponse = await StravaAPI.exchangeCodeForToken(code);

      // Stocker la connexion OAuth dans oauth_connection
      // upsert = créer si n'existe pas, mettre à jour si existe déjà
      await OAuthConnection.upsert({
        id_utilisateur: userId,
        source_externe: "strava",
        external_user_id: tokenResponse.athlete_id.toString(),
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_expires_at: tokenResponse.expires_at,
      });

      // Créer le pilier Strava si l'utilisateur n'en a pas encore
      const existingPilier = await Pilier.findByUserAndSource(userId, "strava");

      if (!existingPilier) {
        await Pilier.create({
          id_utilisateur: userId,
          nom_pilier: "Sport",
          source_externe: "strava",
          type_validation: "duree",
          objectif_config: { duree_minutes: 30 },
          pilier_actif: true,
        });
      } else if (!existingPilier.pilier_actif) {
        // Réactiver le pilier s'il avait été désactivé
        await Pilier.update(existingPilier.id_pilier, {
          pilier_actif: true,
        });
      }

      res.redirect("levly://strava-callback?success=true");
    } catch (error) {
      res.status(500).send(`
        <html>
          <head><meta charset="UTF-8"></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Erreur lors de la connexion</h1>
            <p>${error.message}</p>
          </body>
        </html>
      `);
    }
  }

  /**
   * Vérifier le statut de connexion Strava
   * GET /api/strava/status
   */
  static async getStatus(req, res) {
    try {
      const userId = req.user.userId;

      const connection = await OAuthConnection.findByUserAndSource(
        userId,
        "strava"
      );

      const stravaConnected = !!connection && connection.access_token !== null;

      res.status(200).json({
        strava: stravaConnected,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification du statut Strava",
        error: error.message,
      });
    }
  }

  /**
   * Récupérer les activités Strava du jour
   * GET /api/strava/activities
   */
  static async getActivities(req, res) {
    try {
      const userId = req.user.userId;

      const connection = await OAuthConnection.findByUserAndSource(
        userId,
        "strava"
      );

      if (!connection) {
        return res.status(404).json({
          success: false,
          message: "Strava n'est pas connecté",
        });
      }

      const accessToken = await stravaServices.getValidAccessToken(connection);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const afterTimestamp = Math.floor(startOfDay.getTime() / 1000);

      const activities = await StravaAPI.getTodayActivities(
        accessToken,
        afterTimestamp
      );

      res.status(200).json({
        success: true,
        count: activities.length,
        data: activities,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des activités",
        error: error.message,
      });
    }
  }

  /**
   * Validation du webhook par Strava (challenge)
   * GET /api/strava/webhook
   *
   * Quand tu t'abonnes, Strava envoie un GET avec hub.challenge.
   * Tu dois répondre exactement avec ce challenge pour prouver
   * que tu contrôles bien ce endpoint.
   */
  static async webhookChallenge(req, res) {
    const challenge = req.query["hub.challenge"];
    const verifyToken = req.query["hub.verify_token"];

    // Vérifier que c'est bien Strava qui appelle
    // avec le token qu'on a défini lors de l'abonnement
    if (verifyToken !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      return res.status(403).json({
        success: false,
        message: "Token de vérification invalide",
      });
    }

    // Répondre avec le challenge → Strava confirme l'abonnement
    res.status(200).json({ "hub.challenge": challenge });
  }

  /**
   * Réception des événements Strava
   * POST /api/strava/webhook
   *
   * Appelé automatiquement par Strava quand un athlète
   * crée, modifie ou supprime une activité.
   */
  static async webhookEvent(req, res) {
    // Répondre immédiatement 200 à Strava
    // Strava exige une réponse rapide, on traite en arrière-plan
    res.status(200).send("EVENT_RECEIVED");

    try {
      const { object_type, aspect_type, object_id, owner_id } = req.body;

      // On ne traite que les créations d'activités
      // Les modifications et suppressions sont ignorées pour le MVP
      if (object_type !== "activity" || aspect_type !== "create") {
        return;
      }

      // Retrouver l'utilisateur Levly via son ID Strava (owner_id)
      const connection = await OAuthConnection.findByExternalUserId(
        "strava",
        owner_id.toString()
      );

      if (!connection) {
        // Athlète Strava non enregistré dans Levly → on ignore
        return;
      }

      const userId = connection.id_utilisateur;

      // Valider l'activité et calculer si l'objectif est atteint
      const result = await stravaServices.validateStravaActivity(
        userId,
        object_id
      );

      if (!result.success || !result.validated) {
        // Objectif non atteint → pas de récompense
        return;
      }

      // Objectif atteint → attribuer les récompenses
      await rewardsServices.processRewards(userId, result.pilier_id);
    } catch (error) {
      console.error("❌ Erreur traitement webhook Strava:", error.message);
    }
  }
}

module.exports = StravaController;
