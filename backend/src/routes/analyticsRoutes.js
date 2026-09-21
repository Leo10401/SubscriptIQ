const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/retention-summary', requireRole(['Admin', 'CSM', 'Analyst']), analyticsController.getRetentionSummary);
router.get('/churn-trend', requireRole(['Admin', 'CSM', 'Analyst']), analyticsController.getChurnTrend);
router.get('/cohorts', requireRole(['Admin', 'CSM', 'Analyst']), analyticsController.getCohortAnalytics);
router.get('/export-csv', requireRole(['Admin', 'CSM', 'Analyst']), analyticsController.exportAnalyticsCSV);

module.exports = router;
