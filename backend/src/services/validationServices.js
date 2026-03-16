// ================================================================
// Service de validation quotidienne
// ================================================================

const Pilier = require("../models/pilier");
const Activite = require("../models/activite");
const Jeton = require("../models/jeton");
const Serie = require("../models/serie");
const stravaService = require("./stravaServices");
const spotifyService = require("./spotifyServices");

// ================================================================
// Valider la journée de l'utilisateur
// ================================================================
exports.validateDay = async (userId, timezone) => {
  try {
    // Récupérer tous les piliers actifs
    const piliers = await Pilier.findByUserId(userId);

    if (!piliers || piliers.length === 0) {
      return {
        success: false,
        message: "Aucune application connectée",
        validated: false,
      };
    }

    const piliersActifs = piliers.filter((p) => p.pilier_actif);

    if (piliersActifs.length === 0) {
      return {
        success: false,
        message: "Aucun pilier actif",
        validated: false,
      };
    }

    // ============================================================
    // Valider chaque pilier
    // ============================================================
    const validationResults = [];
    const today = new Date().toISOString().split("T")[0];

    for (const pilier of piliersActifs) {
      // Récupérer la validation existante d'aujourd'hui (si elle existe)
      const existingActivite = await Activite.findByUserAndDate(
        userId,
        today,
        pilier.id_pilier
      );

      let result = null;

      if (pilier.source_externe === "strava") {
        result = await stravaService.validateStrava(pilier, userId, today);
      } else if (pilier.source_externe === "spotify") {
        result = await spotifyService.validateSpotify(
          pilier,
          userId,
          today,
          timezone
        );
      } else {
        continue;
      }

      if (!result || !result.success) {
        validationResults.push({
          pilier_id: pilier.id_pilier,
          source: pilier.source_externe,
          nom: pilier.nom_pilier,
          validated: false,
          alreadyValidated: false,
          wasAlreadyValidated: false,
          target: pilier.objectif_config?.duree_minutes || 30,
          current: 0,
        });
        continue;
      }

      // Vérifier si le pilier était déjà validé avant cet appel
      const wasAlreadyValidated = existingActivite?.activite_validee || false;

      // Le pilier est-il validé ?
      const isValidatedNow = result.validated;

      // Mettre à jour ou créer l'activité en base
      if (existingActivite) {
        await Activite.update(existingActivite.id_activite, {
          duree_minutes: result.current || 0,
          activite_validee: isValidatedNow,
        });
      } else {
        await Activite.create({
          id_utilisateur: userId,
          id_pilier: pilier.id_pilier,
          date_activite: today,
          duree_minutes: result.current || 0,
          source_externe: result.source,
          activite_validee: isValidatedNow,
        });
      }

      validationResults.push({
        ...result,
        wasAlreadyValidated,
        validated: isValidatedNow,
        alreadyValidated: false,
      });
    }

    // ================================================================
    // Compter les NOUVEAUX piliers validés
    // ================================================================
    const newlyValidatedPiliers = validationResults.filter(
      (r) => r.validated && !r.wasAlreadyValidated
    );

    const newValidatedCount = newlyValidatedPiliers.length;
    const totalPiliers = piliersActifs.length;

    // ================================================================
    // Attribution des récompenses
    // ================================================================
    let tokensEarned = 0;
    let bonusTokens = 0;
    let newStreak = 0;
    let serieIncremented = false;

    if (newValidatedCount === 0) {
      // Vérifier si tous les piliers sont validés
      const allValidatedNow = validationResults.every((r) => r.validated);

      if (!allValidatedNow) {
        // Au moins un pilier non validé → reset série
        const serie = await Serie.findByUserId(userId);
        if (serie && serie.serie_actuelle > 0) {
          await Serie.update(userId, 0);
        }
        newStreak = 0;
      } else {
        // Tous validés mais avant → pas de reset
        const serie = await Serie.findByUserId(userId);
        newStreak = serie?.serie_actuelle || 0;
      }

      tokensEarned = 0;
    } else {
      // Au moins 1 NOUVEAU pilier validé

      // Attribution tokens : 5 tokens PAR pilier nouvellement validé
      tokensEarned = newValidatedCount * 5;

      const allValidatedNow = validationResults.every((r) => r.validated);
      const origine = allValidatedNow
        ? "validation_complete"
        : "validation_partielle";

      await Jeton.addTokens(userId, tokensEarned, origine);

      // Incrémenter la série
      let serie = await Serie.findByUserId(userId);
      if (!serie) {
        serie = await Serie.create(userId);
      }

      // Vérifier si la série a déjà été incrémentée aujourd'hui
      const lastUpdateDate = serie.date_maj
        ? new Date(serie.date_maj).toISOString().split("T")[0]
        : null;

      const today = new Date().toISOString().split("T")[0];

      if (lastUpdateDate !== today || serie.serie_actuelle === 0) {
        // Première validation du jour → incrémenter
        newStreak = (serie.serie_actuelle || 0) + 1;
        await Serie.update(userId, newStreak);
        serieIncremented = true;
      } else {
        // Déjà incrémentée aujourd'hui → pas de changement
        newStreak = serie.serie_actuelle || 0;
      }

      // Bonus de série (UNE SEULE FOIS par palier)
      if (serieIncremented) {
        bonusTokens = await checkSerieBonus(userId, newStreak);
        if (bonusTokens > 0) {
          tokensEarned += bonusTokens;
        }
      }
    }

    // ================================================================
    // Récupérer le solde total
    // ================================================================
    const nouveauSolde = await Jeton.getBalance(userId);

    // ================================================================
    // Retourner le résultat complet
    // ================================================================
    const allValidatedNow = validationResults.every((r) => r.validated);
    const totalValidatedNow = validationResults.filter(
      (r) => r.validated
    ).length;

    let message = "";
    if (totalValidatedNow === 0) {
      message = "Aucun objectif atteint. Continue tes efforts ! 💪";
    } else if (allValidatedNow) {
      message = "Bravo ! Tous tes objectifs sont atteints ! 🎉";
    } else {
      message = `Bien joué ! ${totalValidatedNow}/${totalPiliers} objectifs atteints ! 🔥`;
    }

    return {
      success: true,
      validated: allValidatedNow,
      validatedCount: totalValidatedNow,
      newlyValidatedCount: newValidatedCount,
      totalPiliers,
      tokensEarned,
      bonusTokens,
      newStreak,
      serieIncremented,
      nouveauSolde,
      piliers: validationResults,
      message,
    };
  } catch (error) {
    console.error("❌ Erreur validateDay:", error);
    throw error;
  }
};

// ================================================================
// Vérifier et attribuer les bonus de série
// ================================================================
async function checkSerieBonus(userId, serieActuelle) {
  let bonusTotal = 0;

  const paliers = [
    { jours: 7, bonus: 10, label: "7 jours" },
    { jours: 14, bonus: 20, label: "14 jours" },
    { jours: 30, bonus: 50, label: "30 jours" },
  ];

  for (const palier of paliers) {
    if (serieActuelle === palier.jours) {
      await Jeton.addTokens(
        userId,
        palier.bonus,
        `bonus_serie_${palier.jours}j`
      );

      bonusTotal += palier.bonus;
    }
  }

  if (bonusTotal === 0) {
  }

  return bonusTotal;
}
