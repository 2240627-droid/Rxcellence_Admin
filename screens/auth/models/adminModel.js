const db = require('../../../server/config/db');

// Find admin by ID
async function findById(admin_id) {
  const [rows] = await db.query(
    'SELECT * FROM admins WHERE admin_id = ?',
    [admin_id]
  );
  return rows[0];
}


async function createAdmin(admin_name, hashedPassword) {
  await db.query(
    'INSERT INTO admins (admin_name, password) VALUES (?, ?)',
    [admin_name, hashedPassword]
  );
}

module.exports = { findById, createAdmin };
