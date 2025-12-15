// filepath: screens/auth/controllers/authController.js

const { findById } = require('../models/adminModel');
const db = require('../../../server/config/db');

// In-memory tracking for failed login attempts and warnings
const failedAttempts = {};
const warnings = {};

/**
 * POST /auth/login
 * Handles admin login:
 * - Validates credentials
 * - Tracks failed attempts
 * - Creates session on success
 * - Logs activity to audit_logs
 */
const login = async (req, res) => {
  const { admin_id, password } = req.body;
  console.log('Login attempt:', admin_id);

  try {
    const admin = await findById(admin_id);

    if (!admin) {
      return handleFailure(admin_id, res, 'Invalid credentials: user not found');
    }

    console.log('DB result:', {
      admin_id: admin.admin_id,
      admin_name: admin.admin_name
    });

    const passwordMatch = (password === admin.password);

    if (!passwordMatch) {
      return handleFailure(admin_id, res, 'Invalid credentials: wrong password');
    }

    // Reset failed attempt counter on successful login
    failedAttempts[admin_id] = 0;
    console.log(`Login successful for "${admin.admin_name}"`);

    // Log successful login to audit_logs
    await db.query(`
      INSERT INTO audit_logs (user_id, user_type, action, details, timestamp)
      VALUES (?, 'admin', 'login_success', ?, NOW())
    `, [admin.admin_id, `Successful login for "${admin.admin_name}"`]);

    // Ensure session middleware is working
    if (!req.session) {
      console.error('Session is undefined — middleware may not be applied correctly');
      return res.status(500).send('Session error');
    }

    // Store admin info in session
    req.session.admin = {
      id: admin.admin_id,
      name: admin.admin_name,
      role: 'admin'
    };

    return res.redirect('/dashboard.html');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
};

/**
 * Handles failed login attempts:
 * - Increments attempt counter
 * - Logs each failure
 * - Issues warning after 3 tries
 */
async function handleFailure(admin_id, res, message) {
  failedAttempts[admin_id] = (failedAttempts[admin_id] || 0) + 1;

  // Log failed login attempt
  await db.query(`
    INSERT INTO audit_logs (user_id, user_type, action, target_id, timestamp, details)
    VALUES (NULL, 'admin', 'login_failed', ?, NOW(), ?)
  `, [null, `Failed login for user ID "${admin_id}" — ${message}`]);

  // Issue warning after 3 failed attempts
  if (failedAttempts[admin_id] >= 3) {
    warnings[admin_id] = (warnings[admin_id] || 0) + 1;
    console.warn(
      `Warning issued for user ID "${admin_id}" after 3 failed attempts. Total warnings: ${warnings[admin_id]}`
    );

    // Reset failed attempt counter
    failedAttempts[admin_id] = 0;

    // Log warning to audit_logs
    await db.query(`
      INSERT INTO audit_logs (user_id, user_type, action, target_id, timestamp, details)
      VALUES (NULL, 'admin', 'multiple_failed_logins', ?, NOW(), ?)
    `, [null, `Repeated Login Attempt Failure Using user ID "${admin_id}"`]);

    return res
      .status(403)
      .send(`Warning: Too many failed attempts (Warnings: ${warnings[admin_id]})`);
  }

  console.warn(`Login failed for user ID "${admin_id}" (${failedAttempts[admin_id]} attempt(s))`);
  return res.status(401).send(message);
}

/**
 * GET /auth/logout
 * Destroys session and redirects to login
 */
const logout = (req, res) => {
  if (!req.session) {
    console.error('No session found during logout');
    return res.redirect('/login');
  }

  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
};

module.exports = { login, logout };
