const db = require('../../../server/config/db');

async function fetchMedicines(limit = 50, sort = 'ASC') {
  const order = sort.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const query = `
  SELECT 
    med_id AS id,
    name,
    brand,
    type AS category,
    dosage,
    form,
    price
FROM medicines
    ORDER BY med_id ${order}
    LIMIT ${Number(limit) || 50}
  `;
  const [rows] = await db.query(query);
  return rows || [];
}

module.exports = { fetchMedicines };
