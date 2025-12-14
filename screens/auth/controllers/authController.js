// filepath: screens/auth/controllers/authController.js
const { findById } = require('../models/adminModel');
const db = require('../../../server/config/db');

// Track failed attempts and warnings in memory
const failedAttempts = {};
const warnings = {};

/**
 * POST /auth/login
 * Handles admin login with password check,
 * failed attempt tracking, session creation, and redirect to dashboard.
 */
const login = async (req, res) => {
  const { admin_id, password } = req.body;
  console.log('Login attempt:', admin_id);

  try {
    const admin = await findById(admin_id);
    console.log('DB result:', admin);

    if (!admin) {
      return handleFailure(admin_id, res, 'Invalid credentials: user not found');
    }

    // Plaintext comparison (replace with bcrypt in production!)
    const passwordMatch = (password === admin.password);

    if (!passwordMatch) {
      return handleFailure(admin_id, res, 'Invalid credentials: wrong password');
    }

    // Reset failed attempts on success
    failedAttempts[admin_id] = 0;
    console.log(`Login successful for "${admin.admin_name}"`);

    // Log success in audit_logs
    await db.query(`
      INSERT INTO audit_logs (user_id, user_type, action, details, timestamp)
      VALUES (?, 'admin', 'login_success', ?, NOW())
    `, [admin.admin_id, `Successful login for "${admin.admin_name}"`]);

    if (!req.session) {
      console.error('Session is undefined — middleware may not be applied correctly');
      return res.status(500).send('Session error');
    }

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
 * Handle failed login attempts and warnings
 */async function handleFailure(admin_id, res, message) {
  failedAttempts[admin_id] = (failedAttempts[admin_id] || 0) + 1;

  // Always log the failed attempt
  await db.query(`
    INSERT INTO audit_logs (user_id, user_type, action, target_id, timestamp, details)
    VALUES (NULL, 'admin', 'login_failed', ?, NOW(), ?)
  `, [null, `Failed login for user ID "${admin_id}" — ${message}`]);

  if (failedAttempts[admin_id] >= 3) {
    warnings[admin_id] = (warnings[admin_id] || 0) + 1;
    console.warn(
      `Warning issued for user ID "${admin_id}" after 3 failed attempts. Total warnings: ${warnings[admin_id]}`
    );

    // Reset counter
    failedAttempts[admin_id] = 0;

    // Insert the warning into audit_logs
    await db.query(`
      INSERT INTO audit_logs (user_id, user_type, action, target_id, timestamp, details)
      VALUES (NULL, 'admin', 'multiple_failed_logins', ?, NOW(), ?)
    `, [null, `3 consecutive failed attempts for user ID "${admin_id}"`]);

    return res
      .status(403)
      .send(`Warning: Too many failed attempts (Warnings: ${warnings[admin_id]})`);
  }

  console.warn(`Login failed for user ID "${admin_id}" (${failedAttempts[admin_id]} attempt(s))`);
  return res.status(401).send(message);
}

/**
 * GET /auth/logout
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
