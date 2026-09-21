const express = require('express');
const router = express.Router();
const renewalController = require('../controllers/renewalController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM', 'Analyst']), renewalController.getRenewals);
router.get('/:id', requireRole(['Admin', 'CSM', 'Analyst']), renewalController.getRenewalById);
router.patch('/:id/stage', requireRole(['Admin', 'CSM']), renewalController.updateRenewalStage);
router.post('/:id/override-risk', requireRole(['Admin']), renewalController.overrideRenewalRisk);

module.exports = router;
