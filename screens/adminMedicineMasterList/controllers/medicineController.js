// screens/adminMedicineMasterList/controllers/medicineController.js
const medicineModel = require('../models/medicineModel');

async function getMedicines(req, res) {
  try {
    const medicines = await medicineModel.fetchMedicines();
    console.log('Fetched medicines:', medicines);
    res.json(medicines);
  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
}

module.exports = { getMedicines };
