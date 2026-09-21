const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM']), userController.getUsers);
router.post('/', requireRole(['Admin']), userController.createUser);
router.patch('/:id/role', requireRole(['Admin']), userController.updateUserRole);
router.get('/audit-logs', requireRole(['Admin']), userController.getAuditLogs);

module.exports = router;
