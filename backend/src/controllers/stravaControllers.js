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
      const userId = req.user.userId;

      // Vérifier si Strava est déjà connecté
      const existingPilier = await Pilier.findByUserAndSource(userId, "strava");

      if (existingPilier) {
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
    console.log("\n═══════════════════════════════════════");
    console.log("🔵 CALLBACK STRAVA APPELÉ");
    console.log("═══════════════════════════════════════");

    try {
      const { code, state, error } = req.query;

      console.log("📥 Query params reçus:");
      console.log(
        "  code:",
        code ? `✅ ${code.substring(0, 20)}...` : "❌ ABSENT"
      );
      console.log("  state:", state || "❌ ABSENT");
      console.log("  error:", error || "Aucune");

      // L'utilisateur a refusé
      if (error === "access_denied") {
        console.log("❌ Utilisateur a refusé l'autorisation");
        return res.status(400).json({
          success: false,
          message: "Autorisation Strava refusée",
        });
      }

      // Vérifier paramètres
      if (!code || !state) {
        console.log("❌ Paramètres manquants");
        return res.status(400).json({
          success: false,
          message: "Paramètres OAuth manquants (code ou state)",
        });
      }

      const userId = parseInt(state);
      console.log("👤 User ID extrait du state:", userId);

      // Échanger le code contre les tokens
      console.log("\n🔄 Échange du code contre tokens Strava...");

      let tokens;
      try {
        tokens = await StravaAPI.exchangeCodeForToken(code);
        console.log("✅ Tokens reçus de Strava:");
        console.log(
          "  access_token:",
          tokens.access_token
            ? tokens.access_token.substring(0, 30) + "..."
            : "❌ NULL"
        );
        console.log(
          "  refresh_token:",
          tokens.refresh_token
            ? tokens.refresh_token.substring(0, 30) + "..."
            : "❌ NULL"
        );
        console.log("  expires_at:", tokens.expires_at);
        console.log(
          "  expires_date:",
          new Date(tokens.expires_at * 1000).toISOString()
        );
      } catch (exchangeError) {
        console.error(
          "❌ ERREUR lors de l'échange du code:",
          exchangeError.message
        );
        throw exchangeError;
      }

      // Vérifier si un pilier existe déjà
      console.log("\n🔍 Recherche pilier Strava existant pour user", userId);
      const existingPilier = await Pilier.findByUserAndSource(userId, "strava");
      console.log(
        "  Résultat:",
        existingPilier
          ? `Pilier ${existingPilier.id_pilier} trouvé`
          : "Aucun pilier existant"
      );

      let pilierResult;

      if (existingPilier) {
        // Mise à jour
        console.log("\n📝 MISE À JOUR du pilier", existingPilier.id_pilier);
        console.log("  Données à mettre à jour:");
        console.log(
          "    access_token:",
          tokens.access_token.substring(0, 30) + "..."
        );
        console.log(
          "    refresh_token:",
          tokens.refresh_token.substring(0, 30) + "..."
        );
        console.log("    token_expires_at:", tokens.expires_at);

        try {
          pilierResult = await Pilier.update(existingPilier.id_pilier, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: tokens.expires_at,
            pilier_actif: true,
          });
          console.log("✅ Pilier mis à jour avec succès");
          console.log("  Résultat:", pilierResult);
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
        console.log("\n🆕 CRÉATION d'un nouveau pilier");
        console.log("  Données à insérer:");
        console.log("    id_utilisateur:", userId);
        console.log("    nom_pilier: Sport");
        console.log("    source_externe: strava");
        console.log("    duree_objectif_minutes: 30");
        console.log(
          "    access_token:",
          tokens.access_token.substring(0, 30) + "..."
        );
        console.log(
          "    refresh_token:",
          tokens.refresh_token.substring(0, 30) + "..."
        );
        console.log("    token_expires_at:", tokens.expires_at);

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
          console.log("✅ Pilier créé avec succès");
          console.log("  Résultat:", pilierResult);
        } catch (createError) {
          console.error("❌ ERREUR lors de la création:", createError.message);
          console.error("  Stack:", createError.stack);
          throw createError;
        }
      }

      // Vérifier en base que les tokens ont bien été enregistrés
      console.log("\n🔍 Vérification en base de données...");
      const verif = await Pilier.findByUserAndSource(userId, "strava");
      console.log(
        "  access_token enregistré ?",
        verif.access_token ? "✅ OUI" : "❌ NON"
      );
      console.log(
        "  refresh_token enregistré ?",
        verif.refresh_token ? "✅ OUI" : "❌ NON"
      );
      console.log(
        "  token_expires_at enregistré ?",
        verif.token_expires_at ? "✅ OUI" : "❌ NON"
      );

      console.log("\n═══════════════════════════════════════");
      console.log("✅ STRAVA CONNECTÉ AVEC SUCCÈS");
      console.log("═══════════════════════════════════════\n");

      // Page de succès
      res.send(`
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                background: white;
                color: #333;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 500px;
                margin: 0 auto;
              }
              h1 { color: #FC4C02; }
              .success { font-size: 60px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success">✅</div>
              <h1>Strava connecté avec succès !</h1>
              <p><strong>Utilisateur ID:</strong> ${userId}</p>
              <p>Vous pouvez fermer cette fenêtre et retourner à Levly.</p>
            </div>
          </body>
        </html>
      `);
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
        console.log("🔄 Token Strava expiré, renouvellement...");

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

      console.log("📅 Récupération activités du jour:");
      console.log("  Après:", startOfDay.toISOString());

      // Récupérer les activités APRÈS le début de la journée
      const activities = await StravaAPI.getActivities(
        accessToken,
        afterTimestamp
      );

      console.log("✅ Activités trouvées:", activities.length);

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
