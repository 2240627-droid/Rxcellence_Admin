// screens/adminMedicineMasterList/controllers/medicineController.js

const medicineModel = require('../models/medicineModel');

/**
 * GET /api/medicines
 * Controller to fetch and return a list of medicines.
 */
async function getMedicines(req, res) {
  try {
    const medicines = await medicineModel.fetchMedicines(); // Fetch from DB
    console.log('Fetched medicines:', medicines);
    res.json(medicines);
  } catch (err) {
    console.error('Error fetching medicines:', err); 
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
}

module.exports = { getMedicines };
