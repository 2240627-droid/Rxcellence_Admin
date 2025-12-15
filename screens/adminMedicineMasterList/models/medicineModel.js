const db = require('../../../server/config/db');

/**
 * Fetches a list of medicines from the database.
 * @param {number} limit - Max number of records to return (default: 50)
 * @param {string} sort - Sort order by med_id ('ASC' or 'DESC')
 * @returns {Promise<Array>} - Array of medicine records
 */
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

  // Execute query and return results
  const [rows] = await db.query(query);
  return rows || [];
}

module.exports = { fetchMedicines };
