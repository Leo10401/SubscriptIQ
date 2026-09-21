const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticateUser, authController.getCurrentUser);
router.get('/demo-users', authController.getDemoUsers);

module.exports = router;
