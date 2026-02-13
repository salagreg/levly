// =================================================================
// Contrôleur pour gérer l'intégration Spotify : connexion OAuth, récupération des podcasts écoutés, etc.
// =================================================================
const SpotifyAPI = require("../integrations/spotifyAPI");
const Pilier = require("../models/pilier");

class SpotifyController {
  /**
   * Initier la connexion OAuth Spotify
   * GET /api/spotify/connect
   */
  static async connect(req, res) {
    try {
      const userId = req.user.userId;

      // Vérifier si Spotify est déjà connecté
      const existingPilier = await Pilier.findByUserAndSource(
        userId,
        "spotify"
      );

      if (existingPilier) {
        return res.status(400).json({
          success: false,
          message: "Spotify est déjà connecté",
        });
      }

      // Générer l'URL d'autorisation Spotify
      const authUrl = SpotifyAPI.getAuthorizationUrl(userId);

      // 🔍 DEBUG : Afficher l'URL générée
      console.log("\n🔍 DEBUG URL GÉNÉRÉE:");
      console.log("  Full URL:", authUrl);
      console.log(
        "  Redirect URI dans URL:",
        new URL(authUrl).searchParams.get("redirect_uri")
      );

      // Rediriger l'utilisateur vers Spotify
      res.redirect(authUrl);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la connexion à Spotify",
        error: error.message,
      });
    }
  }

  /**
   * Callback OAuth Spotify
   * GET /api/spotify/callback?code=...&state=...
   */
  static async callback(req, res) {
    console.log("\n═══════════════════════════════════════");
    console.log("🎧 CALLBACK SPOTIFY APPELÉ");
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
          message: "Autorisation Spotify refusée",
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
      console.log("\n🔄 Échange du code contre tokens Spotify...");

      let tokens;
      try {
        tokens = await SpotifyAPI.exchangeCodeForToken(code);
        console.log("✅ Tokens reçus de Spotify:");
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
      console.log("\n🔍 Recherche pilier Spotify existant pour user", userId);
      const existingPilier = await Pilier.findByUserAndSource(
        userId,
        "spotify"
      );
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
        console.log("    nom_pilier: Culture & Podcasts");
        console.log("    source_externe: spotify");
        console.log("    type_validation: episodes");
        console.log("    episodes_objectif: 1");
        console.log("    duree_minimale_episode: 15");
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
            nom_pilier: "Culture",
            source_externe: "spotify",
            type_validation: "episodes",
            objectif_config: {
              episodes: 1,
              duree_min_episode: 15,
            },
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
      const verif = await Pilier.findByUserAndSource(userId, "spotify");
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
      console.log("✅ SPOTIFY CONNECTÉ AVEC SUCCÈS");
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
                background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
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
              h1 { color: #1DB954; }
              .success { font-size: 60px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success">✅</div>
              <h1>Spotify connecté avec succès !</h1>
              <p><strong>Utilisateur ID:</strong> ${userId}</p>
              <p>Vous pouvez fermer cette fenêtre et retourner à Levly.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("\n❌❌❌ ERREUR CALLBACK SPOTIFY ❌❌❌");
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
   * Récupérer les podcasts écoutés aujourd'hui
   * GET /api/spotify/podcasts
   */
  static async getTodayPodcasts(req, res) {
    try {
      const userId = req.user.userId;

      // Récupérer le pilier Spotify de l'utilisateur
      const pilier = await Pilier.findByUserAndSource(userId, "spotify");

      if (!pilier) {
        return res.status(404).json({
          success: false,
          message: "Spotify n'est pas connecté",
        });
      }

      // Vérifier si le token est expiré
      const now = Math.floor(Date.now() / 1000);
      let accessToken = pilier.access_token;

      if (now > pilier.token_expires_at) {
        // Token expiré, on le renouvelle
        console.log("🔄 Token Spotify expiré, renouvellement...");

        const newTokens = await SpotifyAPI.refreshAccessToken(
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

      // Récupérer les podcasts du jour
      const allPodcasts = await SpotifyAPI.getTodayPodcasts(accessToken);

      // Filtrer : garder seulement ceux de 15+ minutes
      const config = pilier.objectif_config;
      const dureeMinimale = config.duree_min_episode || 15;
      const dureeMinimaleMs = dureeMinimale * 60 * 1000;

      const validPodcasts = allPodcasts.filter((podcast) => {
        return podcast.duration_ms >= dureeMinimaleMs;
      });

      console.log("📊 Podcasts écoutés aujourd'hui:");
      console.log("  Total:", allPodcasts.length);
      console.log("  Valides (≥ 15 min):", validPodcasts.length);

      // Vérifier si objectif atteint
      const objectifAtteint = validPodcasts.length >= config.episodes;

      res.status(200).json({
        success: true,
        data: {
          podcasts: validPodcasts,
          total_podcasts: allPodcasts.length,
          podcasts_valides: validPodcasts.length,
          episodes_objectif: pilier.episodes_objectif,
          duree_minimale: dureeMinimale,
          objectif_atteint: objectifAtteint,
        },
      });
    } catch (error) {
      console.error("Erreur récupération podcasts:", error);

      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des podcasts",
        error: error.message,
      });
    }
  }
}

module.exports = SpotifyController;
