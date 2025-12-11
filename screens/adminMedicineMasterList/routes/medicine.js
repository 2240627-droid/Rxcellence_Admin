console.log('Loading medicine routes...');
const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/medicines', medicineController.getMedicines);

module.exports = router;


