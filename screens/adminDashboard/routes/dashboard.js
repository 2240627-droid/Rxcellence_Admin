const express = require('express');
const router = express.Router();

// Import controller
const dashboardController = require('../controllers/dashboardController.js');

console.log('dashboardController type:', typeof dashboardController);
console.log('dashboardController keys:', Object.keys(dashboardController));
console.log('dashboardController raw:', dashboardController);

// Routes
router.get('/timestamps', dashboardController.getRecentTimestamps);
router.get('/logs', dashboardController.getLogs);
router.get('/alerts', dashboardController.getAlerts);
router.get('/activity', dashboardController.getActivityLog);

module.exports = router;
console.log('dashboardController keys:', Object.keys(dashboardController));
