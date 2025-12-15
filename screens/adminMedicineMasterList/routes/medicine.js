console.log('Loading medicine routes...');

const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// GET /api/medicines → Fetch list of medicines
router.get('/medicines', medicineController.getMedicines);

module.exports = router; // Export the router to be used in app.js
