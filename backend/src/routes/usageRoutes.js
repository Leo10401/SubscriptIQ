const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM', 'Analyst', 'Support']), usageController.getUsageEvents);
router.post('/', requireRole(['Admin', 'CSM', 'Support']), usageController.logUsageEvent);

module.exports = router;
