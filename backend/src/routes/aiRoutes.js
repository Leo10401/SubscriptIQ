const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.post('/summarize/:customerId', requireRole(['Admin', 'CSM']), aiController.summarizeCustomer);
router.post('/explain-risk/:renewalId', requireRole(['Admin', 'CSM']), aiController.explainRisk);
router.post('/draft-message/:customerId', requireRole(['Admin', 'CSM']), aiController.draftMessage);
router.get('/drafts', requireRole(['Admin', 'CSM', 'Analyst']), aiController.getDrafts);
router.get('/drafts/:id', requireRole(['Admin', 'CSM', 'Analyst']), aiController.getDraftById);
router.patch('/drafts/:id/review', requireRole(['Admin', 'CSM']), aiController.reviewDraft);

module.exports = router;
