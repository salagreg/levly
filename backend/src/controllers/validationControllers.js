// ================================================================
// Contrôleur pour la validation quotidienne
// ================================================================

const validationService = require("../services/validationServices");

class ValidationController {
  /**
   * Récupérer et valider les routines de la journée
   * POST /api/validation/recovery
   */
  static async recovery(req, res) {
    console.log("\n🎯🎯🎯 CONTROLLER recovery appelé !");

    try {
      const userId = req.user?.userId || req.user?.id;
      const { timezone } = req.body;

      console.log("👤 Recovery demandé par user", userId);
      console.log("🌍 Timezone:", timezone || "non fourni (UTC par défaut)");

      // Appeler le service de validation
      const result = await validationService.validateDay(userId, timezone);

      console.log(
        "📊 Résultat:",
        result.validatedCount + "/" + result.totalPiliers,
        "pilier(s) validé(s)"
      );
      console.log("💰 Tokens gagnés:", result.tokensEarned);
      console.log("💰 Solde total:", result.nouveauSolde);

      // Formater la réponse pour le frontend
      res.status(200).json({
        success: true,
        data: {
          date: new Date().toISOString().split("T")[0],
          piliers_valides: result.validatedCount,
          total_piliers: result.totalPiliers,
          journee_complete: result.validated,
          tokens_gagnes: result.tokensEarned,
          bonus_tokens: result.bonusTokens,
          serie: result.newStreak,
          solde_tokens: result.nouveauSolde,
          message: result.message,
          details: result.piliers,
        },
      });
    } catch (error) {
      console.error("❌ Erreur validation controller:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la validation",
        error: error.message,
      });
    }
  }
}

module.exports = ValidationController;
