const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM', 'Analyst', 'Support']), subscriptionController.getSubscriptions);
router.get('/:id', requireRole(['Admin', 'CSM', 'Analyst', 'Support']), subscriptionController.getSubscriptionById);
router.post('/', requireRole(['Admin', 'CSM']), subscriptionController.createSubscription);
router.patch('/:id', requireRole(['Admin', 'CSM']), subscriptionController.updateSubscription);

module.exports = router;
