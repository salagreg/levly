// ================================================================
// Contrôleur pour la validation quotidienne
// ================================================================

const ValidationService = require("../services/validationServices");

class ValidationController {
  /**
   * Récupérer et valider les routines de la journée
   * POST /api/validation/recovery
   */
  static async recovery(req, res) {
    try {
      // Récupérer l'ID utilisateur depuis le token JWT
      const userId = req.user.userId;

      console.log(`\n🎯 Recovery demandé par user ${userId}`);

      // Appeler le service de validation
      const validationResult = await ValidationService.validateUserDay(userId);

      // Analyser les résultats
      const piliersValides = validationResult.validations.filter(r => r.valide).length;
      const totalPiliers = validationResult.validations.length;
      const journeeComplete = piliersValides === totalPiliers && totalPiliers > 0;

      console.log(`\n📊 Résultat: ${piliersValides}/${totalPiliers} pilier(s) validé(s)`);
      console.log(`💰 Tokens gagnés: ${validationResult.tokens.gagnes}`);
      console.log(`💰 Solde total: ${validationResult.tokens.solde_total}`);

      // Retourner la réponse JSON
      res.status(200).json({
        success: true,
        data: {
          date: new Date().toISOString().split('T')[0],
          piliers_valides: piliersValides,
          total_piliers: totalPiliers,
          journee_complete: journeeComplete,
          tokens_gagnes: validationResult.tokens.gagnes,
          bonus_tokens: validationResult.tokens.bonus,
          solde_tokens: validationResult.tokens.solde_total,
          serie: validationResult.serie,
          details: validationResult.validations
        }
      });

    } catch (error) {
      console.error('❌ Erreur validation controller:', error);

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des activités',
        error: error.message
      });
    }
  }
}

module.exports = ValidationController;
