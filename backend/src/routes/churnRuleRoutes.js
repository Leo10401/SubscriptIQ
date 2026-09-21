const express = require('express');
const router = express.Router();
const churnRuleController = require('../controllers/churnRuleController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM', 'Analyst']), churnRuleController.getChurnRules);
router.patch('/:id', requireRole(['Admin']), churnRuleController.updateChurnRule);
router.post('/evaluate-now', requireRole(['Admin', 'CSM']), churnRuleController.triggerEvaluationRun);
router.get('/signals', requireRole(['Admin', 'CSM', 'Analyst']), churnRuleController.getChurnSignals);

module.exports = router;
