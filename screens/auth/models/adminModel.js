const db = require('../../../server/config/db');

// Find admin by name
async function findByName(admin_name) {
  const [rows] = await db.query(
    'SELECT * FROM admins WHERE admin_name = ?',
    [admin_name]
  );
  return rows[0];
}

// Create new admin with hashed password (optional, for registration)
async function createAdmin(admin_name, hashedPassword) {
  await db.query(
    'INSERT INTO admins (admin_name, password) VALUES (?, ?)',
    [admin_name, hashedPassword]
  );
}

module.exports = { findByName, createAdmin };
