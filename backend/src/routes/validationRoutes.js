// ================================================================
// Routes pour la validation quotidienne
// ================================================================

const express = require('express');
const router = express.Router();

const ValidationController = require('../controllers/validationControllers');
const verifyToken = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/validation/recovery
 * @desc    Récupérer et valider les activités de la journée
 * @access  Privé (JWT requis)
 */
router.post('/recovery', verifyToken, ValidationController.recovery);

module.exports = router;
