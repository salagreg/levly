// =================================================================
// Contrôleur pour gérer l'intégration avec Strava
// =================================================================

const StravaAPI = require("../integrations/stravaAPI");
const Pilier = require("../models/pilier");

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

      // Vérifier et décoder le token OAuth
      const jwt = require("jsonwebtoken");
      let decoded;

      try {
        decoded = jwt.verify(oauthToken, process.env.JWT_SECRET);
      } catch (error) {
        console.error("❌ Token OAuth invalide:", error.message);
        return res.status(401).json({
          success: false,
          message: "Token OAuth invalide ou expiré",
        });
      }

      // Vérifier que c'est bien un token OAuth (pas un token de session normal)
      if (decoded.type !== "oauth") {
        console.error("❌ Type de token incorrect:", decoded.type);
        return res.status(401).json({
          success: false,
          message: "Type de token invalide",
        });
      }

      const userId = decoded.userId;

      // Vérifier si Strava est déjà connecté
      const existingPilier = await Pilier.findByUserAndSource(userId, "strava");

      if (existingPilier && existingPilier.access_token) {
        return res.status(400).json({
          success: false,
          message: "Strava est déjà connecté",
        });
      }

      // Générer l'URL d'autorisation Strava
      const authUrl = StravaAPI.getAuthorizationUrl(userId);

      // Rediriger l'utilisateur vers Strava
      res.redirect(authUrl);
    } catch (error) {
      console.error("❌ Erreur Strava connect:", error);
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
    try {
      const { code, state, error } = req.query;

      

      // L'utilisateur a refusé
      if (error === "access_denied") {
        return res.status(400).json({
          success: false,
          message: "Autorisation Strava refusée",
        });
      }

      // Vérifier paramètres
      if (!code || !state) {
        return res.status(400).json({
          success: false,
          message: "Paramètres OAuth manquants (code ou state)",
        });
      }

      const userId = parseInt(state);

      // Échanger le code contre les tokens

      let tokens;
      try {
        tokens = await StravaAPI.exchangeCodeForToken(code);

        
        

        
      } catch (exchangeError) {
        console.error(
          "❌ ERREUR lors de l'échange du code:",
          exchangeError.message
        );
        throw exchangeError;
      }

      // Vérifier si un pilier existe déjà

      const existingPilier = await Pilier.findByUserAndSource(userId, "strava");
      

      let pilierResult;

      if (existingPilier) {
        // Mise à jour

        
        

        try {
          pilierResult = await Pilier.update(existingPilier.id_pilier, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: tokens.expires_at,
            pilier_actif: true,
          });
        } catch (updateError) {
          console.error(
            "❌ ERREUR lors de la mise à jour:",
            updateError.message
          );
          console.error("  Stack:", updateError.stack);
          throw updateError;
        }
      } else {
        // Création

        
        

        try {
          pilierResult = await Pilier.create({
            id_utilisateur: userId,
            nom_pilier: "Sport",
            source_externe: "strava",
            type_validation: "duree",
            objectif_config: { duree_minutes: 30 },
            pilier_actif: true,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: tokens.expires_at,
          });
        } catch (createError) {
          console.error("❌ ERREUR lors de la création:", createError.message);
          console.error("  Stack:", createError.stack);
          throw createError;
        }
      }

      // Vérifier en base que les tokens ont bien été enregistrés

      const verif = await Pilier.findByUserAndSource(userId, "strava");
      
      
      

      // Page de succès
      res.redirect("levly://strava-callback?success=true");
    } catch (error) {
      console.error("\n❌❌❌ ERREUR CALLBACK STRAVA ❌❌❌");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      console.error("═══════════════════════════════════════\n");

      res.status(500).send(`
        <html>
          <head><meta charset="UTF-8"></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Erreur lors de la connexion</h1>
            <p>${error.message}</p>
            <pre style="text-align: left; background: #f5f5f5; padding: 20px; border-radius: 5px;">${error.stack}</pre>
          </body>
        </html>
      `);
    }
  }

  /**
   * Récupérer les activités Strava du jour
   * GET /api/strava/activities
   */
  static async getActivities(req, res) {
    try {
      const userId = req.user.userId;

      // Récupérer le pilier Strava de l'utilisateur
      const pilier = await Pilier.findByUserAndSource(userId, "strava");

      if (!pilier) {
        return res.status(404).json({
          success: false,
          message: "Strava n'est pas connecté",
        });
      }

      // Vérifier si le token est expiré
      const now = Math.floor(Date.now() / 1000);
      let accessToken = pilier.access_token;

      if (now > pilier.token_expires_at) {
        // Token expiré, on le renouvelle

        const newTokens = await StravaAPI.refreshAccessToken(
          pilier.refresh_token
        );

        // Mettre à jour en base
        await Pilier.update(pilier.id_pilier, {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          token_expires_at: newTokens.expires_at,
        });

        accessToken = newTokens.access_token;
      }

      // Calculer le début de la journée
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const afterTimestamp = Math.floor(startOfDay.getTime() / 1000);

      // Récupérer les activités APRÈS le début de la journée
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
      console.error("Erreur récupération activités:", error);

      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des activités",
        error: error.message,
      });
    }
  }
}

module.exports = StravaController;
