const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM', 'Support', 'Analyst']), customerController.getCustomers);
router.get('/:id', requireRole(['Admin', 'CSM', 'Support', 'Analyst']), customerController.getCustomerById);
router.post('/', requireRole(['Admin', 'CSM']), customerController.createCustomer);
router.patch('/:id', requireRole(['Admin', 'CSM']), customerController.updateCustomer);
router.delete('/:id', requireRole(['Admin']), customerController.deleteCustomer);

module.exports = router;
