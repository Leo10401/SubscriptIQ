const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', requireRole(['Admin', 'CSM', 'Support', 'Analyst']), supportController.getSupportNotes);
router.post('/', requireRole(['Admin', 'CSM', 'Support']), supportController.createSupportNote);

module.exports = router;
