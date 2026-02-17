// ================================================================
// Service de validation des routines quotidiennes
// ================================================================

const Pilier = require("../models/pilier");
const Activite = require("../models/activite");
const Jeton = require("../models/jeton");
const Serie = require("../models/serie");
const StravaAPI = require("../integrations/stravaAPI");
const SpotifyAPI = require("../integrations/spotifyAPI");

class ValidationService {
  // ================================================================
  // Valider la journée d'un utilisateur
  // ================================================================
  static async validateUserDay(userId) {
    console.log("\n🎯 VALIDATION JOURNÉE UTILISATEUR", userId);
    console.log("═══════════════════════════════════════");

    try {
      // 1. Récupérer tous les piliers de l'utilisateur
      const piliers = await Pilier.findByUserId(userId);

      if (!piliers || piliers.length === 0) {
        throw new Error("Aucun pilier connecté");
      }

      console.log(`📊 ${piliers.length} pilier(s) trouvé(s)`);

      const results = [];
      const today = new Date().toISOString().split("T")[0];

      // 2. Valider chaque pilier
      for (const pilier of piliers) {
        // Skip si désactivé
        if (!pilier.pilier_actif) {
          console.log(`⏭️  Pilier ${pilier.source_externe} désactivé, ignoré`);
          continue;
        }

        console.log(`\n🔍 Validation pilier: ${pilier.source_externe}`);

        // Vérifier si déjà validé aujourd'hui
        const dejaValide = await Activite.findByUserAndDate(
          userId,
          today,
          pilier.id_pilier
        );

        if (dejaValide) {
          console.log(`  ⚠️  Déjà validé aujourd'hui, ignoré`);

          results.push({
            pilier_id: pilier.id_pilier,
            source: pilier.source_externe,
            nom: pilier.nom_pilier,
            valide: dejaValide.activite_validee,
            deja_valide: true,
          });
          continue;
        }

        // Valider selon la source
        let validation = null;

        switch (pilier.source_externe) {
          case "strava":
            validation = await this.validateStrava(pilier, userId, today);
            break;

          case "spotify":
            validation = await this.validateSpotify(pilier, userId, today);
            break;

          default:
            console.log(`⚠️  Source ${pilier.source_externe} non supportée`);
        }

        if (validation) {
          results.push(validation);
        }
      }

      console.log("\n✅ VALIDATION TERMINÉE");
      console.log("═══════════════════════════════════════");

      // 3. Compter les piliers validés (nouveaux seulement)
      const piliersValides = results.filter(
        (r) => r.valide && !r.deja_valide
      ).length;

      let tokensGagnes = 0;
      let bonusTokens = 0;
      let serieActuelle = 0;

      if (piliersValides > 0) {
        // ══════════════════════════════════════
        // CAS 1 : Au moins 1 pilier validé
        // ══════════════════════════════════════
        console.log("\n💰 ATTRIBUTION DES TOKENS");
        console.log("═══════════════════════════════════════");

        // 5 tokens par pilier validé
        for (const result of results) {
          if (result.valide && !result.deja_valide) {
            await Jeton.addTokens(userId, 5, `pilier_${result.source}`);
            console.log(`  ✅ +5 tokens pour ${result.source}`);
            tokensGagnes += 5;
          }
        }

        // Mettre à jour la série
        console.log("\n🔥 MISE À JOUR SÉRIE");
        console.log("═══════════════════════════════════════");

        const serie = await Serie.updateSerie(userId);
        serieActuelle = serie.serie_actuelle;
        console.log(`  🔥 Série actuelle: ${serieActuelle} jour(s)`);

        // Vérifier les bonus de série
        bonusTokens = await this.checkSerieBonus(userId, serieActuelle);
        tokensGagnes += bonusTokens;

        // Récupérer le nouveau solde
        const nouveauSolde = await Jeton.getBalance(userId);

        console.log(`\n  💰 Tokens de base: ${piliersValides * 5}`);
        console.log(`  🎁 Bonus série: ${bonusTokens}`);
        console.log(`  💰 Total gagné: ${tokensGagnes}`);
        console.log(`  💰 Solde total: ${nouveauSolde}`);
        console.log("═══════════════════════════════════════\n");

        return {
          validations: results,
          tokens: {
            gagnes: tokensGagnes,
            bonus: bonusTokens,
            solde_total: nouveauSolde,
          },
          serie: serieActuelle,
        };
      } else {
        // ══════════════════════════════════════
        // CAS 2 : 0 pilier validé
        // Reset automatique le lendemain via updateSerie()
        // ══════════════════════════════════════
        console.log("\n💔 AUCUN PILIER VALIDÉ");
        console.log("═══════════════════════════════════════");

        const soldeActuel = await Jeton.getBalance(userId);
        serieActuelle = await Serie.getCurrentStreak(userId);

        console.log(`  ℹ️  Série actuelle: ${serieActuelle} (inchangée)`);
        console.log("═══════════════════════════════════════\n");

        return {
          validations: results,
          tokens: {
            gagnes: 0,
            bonus: 0,
            solde_total: soldeActuel,
          },
          serie: serieActuelle,
          message: "Aucune activité validée",
        };
      }
    } catch (error) {
      console.error("❌ Erreur validation:", error.message);
      throw error;
    }
  }

  // ================================================================
  // Valider un pilier Strava (type: durée)
  // ================================================================
  static async validateStrava(pilier, userId, today) {
    console.log("  🏃 Validation Strava...");

    try {
      // Vérifier expiration token
      const now = Math.floor(Date.now() / 1000);
      let accessToken = pilier.access_token;

      if (now > pilier.token_expires_at) {
        console.log("  🔄 Token expiré, renouvellement...");
        const newTokens = await StravaAPI.refreshAccessToken(
          pilier.refresh_token
        );

        await Pilier.update(pilier.id_pilier, {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          token_expires_at: newTokens.expires_at,
        });

        accessToken = newTokens.access_token;
      }

      // Calculer le timestamp de minuit
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const afterTimestamp = Math.floor(startOfDay.getTime() / 1000);

      // Récupérer activités du jour
      const activities = await StravaAPI.getActivities(
        accessToken,
        afterTimestamp
      );

      console.log(`  📊 ${activities.length} activité(s) trouvée(s)`);

      // Calculer durée totale
      const totalDuration = activities.reduce((sum, act) => {
        return sum + Math.floor(act.moving_time / 60);
      }, 0);

      console.log(`  ⏱️  Durée totale: ${totalDuration} min`);

      // Vérifier objectif
      const config = pilier.objectif_config;
      const objectifAtteint = totalDuration >= config.duree_minutes;

      console.log(`  🎯 Objectif: ${config.duree_minutes} min`);
      console.log(
        `  ${objectifAtteint ? "✅" : "❌"} ${
          objectifAtteint ? "VALIDÉ" : "NON VALIDÉ"
        }`
      );

      // Enregistrer dans table activite
      await Activite.create({
        id_utilisateur: userId,
        id_pilier: pilier.id_pilier,
        date_activite: today,
        duree_minutes: totalDuration,
        nombre_episodes: null,
        source_externe: "strava",
        activite_validee: objectifAtteint,
      });

      console.log("  💾 Enregistré en BDD");

      return {
        pilier_id: pilier.id_pilier,
        source: "strava",
        nom: pilier.nom_pilier,
        type_validation: "duree",
        objectif: config.duree_minutes,
        realise: totalDuration,
        valide: objectifAtteint,
        activites: activities.length,
      };
    } catch (error) {
      console.error("  ❌ Erreur Strava:", error.message);

      await Activite.create({
        id_utilisateur: userId,
        id_pilier: pilier.id_pilier,
        date_activite: today,
        duree_minutes: 0,
        nombre_episodes: null,
        source_externe: "strava",
        activite_validee: false,
      });

      return {
        pilier_id: pilier.id_pilier,
        source: "strava",
        nom: pilier.nom_pilier,
        valide: false,
        erreur: error.message,
      };
    }
  }

  // ================================================================
  // Valider un pilier Spotify (type: épisodes)
  // ================================================================
  static async validateSpotify(pilier, userId, today) {
    console.log("  🎧 Validation Spotify...");

    try {
      // Vérifier expiration token
      const now = Math.floor(Date.now() / 1000);
      let accessToken = pilier.access_token;

      if (now > pilier.token_expires_at) {
        console.log("  🔄 Token expiré, renouvellement...");
        const newTokens = await SpotifyAPI.refreshAccessToken(
          pilier.refresh_token
        );

        await Pilier.update(pilier.id_pilier, {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          token_expires_at: newTokens.expires_at,
        });

        accessToken = newTokens.access_token;
      }

      // Récupérer podcasts du jour
      const allPodcasts = await SpotifyAPI.getTodayPodcasts(accessToken);

      console.log(`  📊 ${allPodcasts.length} podcast(s) écouté(s)`);

      // Filtrer par durée minimale
      const config = pilier.objectif_config;
      const dureeMinMs = config.duree_min_episode * 60 * 1000;

      const validPodcasts = allPodcasts.filter(
        (p) => p.duration_ms >= dureeMinMs
      );

      console.log(
        `  📊 ${validPodcasts.length} podcast(s) valide(s) (≥ ${config.duree_min_episode} min)`
      );

      // Vérifier objectif
      const objectifAtteint = validPodcasts.length >= config.episodes;

      console.log(`  🎯 Objectif: ${config.episodes} épisode(s)`);
      console.log(
        `  ${objectifAtteint ? "✅" : "❌"} ${
          objectifAtteint ? "VALIDÉ" : "NON VALIDÉ"
        }`
      );

      // Enregistrer dans table activite
      await Activite.create({
        id_utilisateur: userId,
        id_pilier: pilier.id_pilier,
        date_activite: today,
        duree_minutes: null,
        nombre_episodes: validPodcasts.length,
        source_externe: "spotify",
        activite_validee: objectifAtteint,
      });

      console.log("  💾 Enregistré en BDD");

      return {
        pilier_id: pilier.id_pilier,
        source: "spotify",
        nom: pilier.nom_pilier,
        type_validation: "episodes",
        objectif: config.episodes,
        realise: validPodcasts.length,
        valide: objectifAtteint,
        podcasts: validPodcasts.length,
      };
    } catch (error) {
      console.error("  ❌ Erreur Spotify:", error.message);

      await Activite.create({
        id_utilisateur: userId,
        id_pilier: pilier.id_pilier,
        date_activite: today,
        duree_minutes: null,
        nombre_episodes: 0,
        source_externe: "spotify",
        activite_validee: false,
      });

      return {
        pilier_id: pilier.id_pilier,
        source: "spotify",
        nom: pilier.nom_pilier,
        valide: false,
        erreur: error.message,
      };
    }
  }

  // ================================================================
  // Vérifier et attribuer les bonus de série
  // Bonus cumulatifs : 7j, 14j, 30j
  // ================================================================
  static async checkSerieBonus(userId, serieActuelle) {
    console.log(`\n  🎁 Vérification bonus série (${serieActuelle} jours)`);

    let bonusTotal = 0;

    const paliers = [
      { jours: 7, bonus: 10, label: "7 jours" },
      { jours: 14, bonus: 20, label: "14 jours" },
      { jours: 30, bonus: 50, label: "30 jours" },
    ];

    for (const palier of paliers) {
      if (serieActuelle === palier.jours) {
        console.log(
          `  🎉 Bonus ${palier.label} débloqué ! +${palier.bonus} tokens`
        );

        await Jeton.addTokens(
          userId,
          palier.bonus,
          `bonus_serie_${palier.jours}j`
        );

        bonusTotal += palier.bonus;
      }
    }

    if (bonusTotal === 0) {
      console.log(`  ℹ️  Pas de bonus pour ${serieActuelle} jours`);
    }

    return bonusTotal;
  }
}

module.exports = ValidationService;
