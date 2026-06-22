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
    console.log("🔵 [Strava] Connect appelé");
    console.log("🔵 [Strava] Token reçu:", req.query.token?.substring(0, 30));
    try {
      const oauthToken = req.query.token;

      if (!oauthToken) {
        console.log("❌ [Strava] Token manquant");
        return res.status(401).json({
          success: false,
          message: "Token OAuth manquant",
        });
      }

      const jwt = require("jsonwebtoken");
      let decoded;

      try {
        decoded = jwt.verify(oauthToken, process.env.JWT_SECRET);
        console.log("✅ [Strava] Token décodé, userId:", decoded.userId);
      } catch (error) {
        console.log("❌ [Strava] Token invalide:", error.message);
        return res.status(401).json({
          success: false,
          message: "Token OAuth invalide ou expiré",
        });
      }

      if (decoded.type !== "oauth") {
        console.log("❌ [Strava] Type de token incorrect:", decoded.type);
        return res.status(401).json({
          success: false,
          message: "Type de token invalide",
        });
      }

      const userId = decoded.userId;
      console.log("🔵 [Strava] Génération URL auth pour userId:", userId);
      const authUrl = StravaAPI.getAuthorizationUrl(userId);
      console.log("🔵 [Strava] Redirect vers:", authUrl.substring(0, 60));
      res.redirect(authUrl);
    } catch (error) {
      console.log("❌ [Strava] Erreur connect:", error.message);
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
   */
  static async callback(req, res) {
    console.log("🔵 [Strava] Callback appelé");
    console.log("🔵 [Strava] Params reçus:", JSON.stringify(req.query));
    try {
      const { code, state, error } = req.query;

      if (error === "access_denied") {
        console.log("❌ [Strava] Accès refusé par l'utilisateur");
        return res.status(400).json({
          success: false,
          message: "Autorisation Strava refusée",
        });
      }

      if (!code || !state) {
        console.log(
          "❌ [Strava] Paramètres manquants - code:",
          !!code,
          "state:",
          !!state
        );
        return res.status(400).json({
          success: false,
          message: "Paramètres OAuth manquants",
        });
      }

      const userId = parseInt(state);
      console.log("🔵 [Strava] UserId depuis state:", userId);

      console.log("🔵 [Strava] Échange du code contre les tokens...");
      const tokenResponse = await StravaAPI.exchangeCodeForToken(code);
      console.log(
        "✅ [Strava] Tokens reçus, athlete_id:",
        tokenResponse.athlete_id
      );

      console.log("🔵 [Strava] Upsert oauth_connection...");
      await OAuthConnection.upsert({
        id_utilisateur: userId,
        source_externe: "strava",
        external_user_id: tokenResponse.athlete_id.toString(),
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_expires_at: tokenResponse.expires_at,
      });
      console.log("✅ [Strava] oauth_connection sauvegardé");

      const existingPilier = await Pilier.findByUserAndSource(userId, "strava");
      console.log("🔵 [Strava] Pilier existant:", !!existingPilier);

      if (!existingPilier) {
        console.log("🔵 [Strava] Création du pilier Sport...");
        await Pilier.create({
          id_utilisateur: userId,
          nom_pilier: "Sport",
          source_externe: "strava",
          type_validation: "duree",
          objectif_config: { duree_minutes: 30 },
          pilier_actif: true,
        });
        console.log("✅ [Strava] Pilier créé");
      } else if (!existingPilier.pilier_actif) {
        console.log("🔵 [Strava] Réactivation du pilier...");
        await Pilier.update(existingPilier.id_pilier, { pilier_actif: true });
        console.log("✅ [Strava] Pilier réactivé");
      }

      console.log("✅ [Strava] Callback terminé, redirect vers l'app");
      res.redirect("https://levly.onrender.com/api/strava/callback?success=true");
    } catch (error) {
      console.log("❌ [Strava] Erreur callback:", error.message);
      console.log("❌ [Strava] Stack:", error.stack);
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
    console.log("🔵 [Strava] getStatus appelé pour userId:", req.user?.userId);
    try {
      const userId = req.user.userId;

      const connection = await OAuthConnection.findByUserAndSource(
        userId,
        "strava"
      );
      const stravaConnected = !!connection && connection.access_token !== null;

      console.log("🔵 [Strava] Status:", stravaConnected);
      res.status(200).json({ strava: stravaConnected });
    } catch (error) {
      console.log("❌ [Strava] Erreur getStatus:", error.message);
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
    console.log(
      "🔵 [Strava] getActivities appelé pour userId:",
      req.user?.userId
    );
    try {
      const userId = req.user.userId;

      const connection = await OAuthConnection.findByUserAndSource(
        userId,
        "strava"
      );

      if (!connection) {
        console.log("❌ [Strava] Pas de connexion Strava");
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
      console.log("✅ [Strava] Activités récupérées:", activities.length);

      res.status(200).json({
        success: true,
        count: activities.length,
        data: activities,
      });
    } catch (error) {
      console.log("❌ [Strava] Erreur getActivities:", error.message);
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
   */
  static async webhookChallenge(req, res) {
    console.log("🔵 [Strava] Webhook challenge reçu:", req.query);
    const challenge = req.query["hub.challenge"];
    const verifyToken = req.query["hub.verify_token"];

    if (verifyToken !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      console.log("❌ [Strava] Verify token invalide");
      return res.status(403).json({
        success: false,
        message: "Token de vérification invalide",
      });
    }

    console.log("✅ [Strava] Challenge accepté");
    res.status(200).json({ "hub.challenge": challenge });
  }

  /**
   * Réception des événements Strava
   * POST /api/strava/webhook
   */
  static async webhookEvent(req, res) {
    console.log("🔵 [Strava] Webhook event reçu:", JSON.stringify(req.body));
    res.status(200).send("EVENT_RECEIVED");

    try {
      const { object_type, aspect_type, object_id, owner_id } = req.body;

      if (object_type !== "activity" || aspect_type !== "create") {
        console.log(
          "🔵 [Strava] Event ignoré - type:",
          object_type,
          aspect_type
        );
        return;
      }

      console.log(
        "🔵 [Strava] Activité créée - owner_id:",
        owner_id,
        "activity_id:",
        object_id
      );

      const connection = await OAuthConnection.findByExternalUserId(
        "strava",
        owner_id.toString()
      );

      if (!connection) {
        console.log(
          "🔵 [Strava] Utilisateur Strava non trouvé dans Levly:",
          owner_id
        );
        return;
      }

      const userId = connection.id_utilisateur;
      console.log("🔵 [Strava] UserId Levly trouvé:", userId);

      const result = await stravaServices.validateStravaActivity(
        userId,
        object_id
      );
      console.log("🔵 [Strava] Résultat validation:", JSON.stringify(result));

      if (!result.success || !result.validated) {
        console.log("🔵 [Strava] Objectif non atteint, pas de récompense");
        return;
      }

      console.log(
        "🔵 [Strava] Objectif atteint, attribution des récompenses..."
      );
      await rewardsServices.processRewards(
        userId,
        result.pilier_id,
        result.current,
        result.target
      );
      console.log("✅ [Strava] Récompenses attribuées");
    } catch (error) {
      console.log("❌ [Strava] Erreur webhook:", error.message);
    }
  }
}

module.exports = StravaController;
