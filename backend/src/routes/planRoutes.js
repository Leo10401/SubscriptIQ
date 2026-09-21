const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM', 'Analyst']), planController.getPlans);
router.post('/', requireRole(['Admin']), planController.createPlan);
router.patch('/:id', requireRole(['Admin']), planController.updatePlan);
router.delete('/:id', requireRole(['Admin']), planController.deletePlan);

module.exports = router;
