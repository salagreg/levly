// ================================================================
// Service de validation quotidienne - ORCHESTRATEUR
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
  console.log("\n🎯 VALIDATION JOURNÉE UTILISATEUR", userId);
  console.log("═══════════════════════════════════════");

  try {
    // ================================================================
    // 1. Récupérer tous les piliers actifs
    // ================================================================
    const piliers = await Pilier.findByUserId(userId);

    if (!piliers || piliers.length === 0) {
      console.log("❌ Aucun pilier trouvé");
      return {
        success: false,
        message: "Aucune application connectée",
        validated: false,
      };
    }

    const piliersActifs = piliers.filter((p) => p.pilier_actif);
    console.log(`🧱 ${piliersActifs.length} pilier(s) actif(s) trouvé(s)`);

    if (piliersActifs.length === 0) {
      console.log("❌ Aucun pilier actif");
      return {
        success: false,
        message: "Aucun pilier actif",
        validated: false,
      };
    }

    // ================================================================
    // 2. Valider chaque pilier (TOUJOURS récupérer les données)
    // ================================================================
    const validationResults = [];
    const today = new Date().toISOString().split("T")[0];

    for (const pilier of piliersActifs) {
      console.log(
        `\n📱 Validation pilier: ${pilier.nom_pilier} (${pilier.source_externe})`
      );

      // Récupérer la validation existante d'aujourd'hui (si elle existe)
      const existingActivite = await Activite.findByUserAndDate(
        userId,
        today,
        pilier.id_pilier
      );

      // TOUJOURS appeler l'API pour récupérer les données en temps réel
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
        console.log(`⚠️ Source ${pilier.source_externe} non supportée`);
        continue;
      }

      if (!result || !result.success) {
        console.log("❌ Erreur récupération données");
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

      // Vérifier si le pilier était DÉJÀ validé avant cet appel
      const wasAlreadyValidated = existingActivite?.activite_validee || false;

      // Le pilier est-il validé MAINTENANT ?
      const isValidatedNow = result.validated;

      console.log(`  ⚙️ Était validé: ${wasAlreadyValidated}`);
      console.log(`  ⚙️ Est validé maintenant: ${isValidatedNow}`);

      // Mettre à jour ou créer l'activité en base
      if (existingActivite) {
        // Mise à jour
        await Activite.update(existingActivite.id_activite, {
          duree_minutes: result.current || 0,
          activite_validee: isValidatedNow,
        });
        console.log("💾 Activité mise à jour en BDD");
      } else {
        // Création
        await Activite.create({
          id_utilisateur: userId,
          id_pilier: pilier.id_pilier,
          date_activite: today,
          duree_minutes: result.current || 0,
          source_externe: result.source,
          activite_validee: isValidatedNow,
        });
        console.log("💾 Activité créée en BDD");
      }

      validationResults.push({
        ...result,
        wasAlreadyValidated, // Était validé AVANT cet appel
        validated: isValidatedNow, // Est validé MAINTENANT
        alreadyValidated: false, // On supprime ce flag trompeur
      });
    }

    console.log("\n📊 Résultats validation:", validationResults);

    // ================================================================
    // 3. Compter les NOUVEAUX piliers validés
    // ================================================================
    const newlyValidatedPiliers = validationResults.filter(
      (r) => r.validated && !r.wasAlreadyValidated
    );

    const newValidatedCount = newlyValidatedPiliers.length;
    const totalPiliers = piliersActifs.length;

    console.log(
      `\n🎯 NOUVEAUX piliers validés: ${newValidatedCount}/${totalPiliers}`
    );

    // ================================================================
    // 4. Attribution des récompenses SEULEMENT pour les NOUVEAUX
    // ================================================================
    let tokensEarned = 0;
    let bonusTokens = 0;
    let newStreak = 0;
    let serieIncremented = false;

    if (newValidatedCount === 0) {
      // Aucun NOUVEAU pilier validé
      console.log("\n❌ AUCUN NOUVEAU PILIER VALIDÉ");
      console.log("═══════════════════════════════════════");

      // Vérifier si TOUS les piliers sont validés (même si avant)
      const allValidatedNow = validationResults.every((r) => r.validated);

      if (!allValidatedNow) {
        // Au moins un pilier non validé → reset série
        const serie = await Serie.findByUserId(userId);
        if (serie && serie.serie_actuelle > 0) {
          await Serie.update(userId, 0);
          console.log("🔥 Série réinitialisée à 0");
        }
        newStreak = 0;
      } else {
        // Tous validés mais avant → pas de reset
        const serie = await Serie.findByUserId(userId);
        newStreak = serie?.serie_actuelle || 0;
        console.log(`🔥 Série maintenue: ${newStreak} jour(s)`);
      }

      tokensEarned = 0;
    } else {
      // Au moins 1 NOUVEAU pilier validé
      console.log("\n✅ AU MOINS 1 NOUVEAU PILIER VALIDÉ");
      console.log("═══════════════════════════════════════");

      // Attribution tokens : 5 tokens PAR pilier nouvellement validé
      tokensEarned = newValidatedCount * 5;

      const allValidatedNow = validationResults.every((r) => r.validated);
      const origine = allValidatedNow
        ? "validation_complete"
        : "validation_partielle";

      await Jeton.addTokens(userId, tokensEarned, origine);
      console.log(
        `💰 Tokens attribués: +${tokensEarned} (${newValidatedCount} pilier(s) x 5)`
      );

      // Incrémenter la série (UNE SEULE FOIS par jour)
      console.log("\n🔥 MISE À JOUR SÉRIE");
      console.log("═══════════════════════════════════════");

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
        console.log(`🔥 Série incrémentée: ${newStreak} jour(s)`);
      } else {
        // Déjà incrémentée aujourd'hui → pas de changement
        newStreak = serie.serie_actuelle || 0;
        console.log(
          `🔥 Série déjà incrémentée aujourd'hui: ${newStreak} jour(s)`
        );
      }

      // Bonus de série (UNE SEULE FOIS par palier)
      if (serieIncremented) {
        bonusTokens = await checkSerieBonus(userId, newStreak);
        if (bonusTokens > 0) {
          tokensEarned += bonusTokens;
        }
      }

      console.log(`\n💰 Tokens de base: ${tokensEarned - bonusTokens}`);
      console.log(`🎁 Bonus série: ${bonusTokens}`);
      console.log(`💰 Total gagné: ${tokensEarned}`);
    }

    // ================================================================
    // 5. Récupérer le solde total
    // ================================================================
    const nouveauSolde = await Jeton.getBalance(userId);
    console.log(`💰 Solde total: ${nouveauSolde}`);
    console.log("═══════════════════════════════════════\n");

    // ================================================================
    // 6. Retourner le résultat complet
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
      newlyValidatedCount: newValidatedCount, // Nouveaux validés
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
  console.log(`\n🎁 Vérification bonus série (${serieActuelle} jours)`);

  let bonusTotal = 0;

  const paliers = [
    { jours: 7, bonus: 10, label: "7 jours" },
    { jours: 14, bonus: 20, label: "14 jours" },
    { jours: 30, bonus: 50, label: "30 jours" },
  ];

  for (const palier of paliers) {
    if (serieActuelle === palier.jours) {
      console.log(
        `🎉 Bonus ${palier.label} débloqué ! +${palier.bonus} tokens`
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
    console.log(`ℹ️ Pas de bonus pour ${serieActuelle} jours`);
  }

  return bonusTotal;
}
