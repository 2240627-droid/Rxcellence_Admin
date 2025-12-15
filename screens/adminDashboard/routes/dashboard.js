const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController.js');
// GET /api/timestamps → Fetch recent timestamps (e.g., login times)
router.get('/timestamps', dashboardController.getRecentTimestamps);
// GET /api/logs → Fetch system or user logs
router.get('/logs', dashboardController.getLogs);
// GET /api/alerts → Fetch recent alerts or notifications
router.get('/alerts', dashboardController.getAlerts);
// GET /api/activity → Fetch activity log entries
router.get('/activity', dashboardController.getActivityLog);
module.exports = router;
