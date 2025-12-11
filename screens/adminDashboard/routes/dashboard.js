const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController.js');

router.get('/timestamps', dashboardController.getRecentTimestamps);
router.get('/logs', dashboardController.getLogs);
router.get('/alerts', dashboardController.getAlerts);
router.get('/activity', dashboardController.getActivityLog);

module.exports = router;
