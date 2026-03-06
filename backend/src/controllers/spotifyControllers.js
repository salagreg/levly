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

      // Vérifier que c'est bien un token OAuth
      if (decoded.type !== "oauth") {
        console.error("❌ Type de token incorrect:", decoded.type);
        return res.status(401).json({
          success: false,
          message: "Type de token invalide",
        });
      }

      const userId = decoded.userId;

      // Vérifier si Spotify est déjà connecté
      const existingPilier = await Pilier.findByUserAndSource(
        userId,
        "spotify"
      );

      if (existingPilier && existingPilier.access_token) {
        return res.status(400).json({
          success: false,
          message: "Spotify est déjà connecté",
        });
      }

      // Générer l'URL d'autorisation Spotify
      const authUrl = SpotifyAPI.getAuthorizationUrl(userId);

      

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
    try {
      const { code, state, error } = req.query;

      

      // L'utilisateur a refusé
      if (error === "access_denied") {
        return res.status(400).json({
          success: false,
          message: "Autorisation Spotify refusée",
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
        tokens = await SpotifyAPI.exchangeCodeForToken(code);

        
        

        
      } catch (exchangeError) {
        console.error(
          "❌ ERREUR lors de l'échange du code:",
          exchangeError.message
        );
        throw exchangeError;
      }

      // Vérifier si un pilier existe déjà

      const existingPilier = await Pilier.findByUserAndSource(
        userId,
        "spotify"
      );
      

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
        } catch (createError) {
          console.error("❌ ERREUR lors de la création:", createError.message);
          console.error("  Stack:", createError.stack);
          throw createError;
        }
      }

      // Vérifier en base que les tokens ont bien été enregistrés

      const verif = await Pilier.findByUserAndSource(userId, "spotify");
      
      
      

      // Page de succès
      res.redirect("levly://spotify-callback?success=true");
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
