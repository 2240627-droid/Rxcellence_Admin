// filepath: screens/auth/controllers/loginController.js
const db = require('../../../server/config/db');
const bcrypt = require('bcrypt');

async function login(req, res) {
  const { username, password } = req.body;

  try {
    // Find user
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (!rows || rows.length === 0) {
      await logFailedAttempt(username, 'Unknown user');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      await logFailedAttempt(user.user_id, 'Wrong password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login
    await db.query(`
      INSERT INTO audit_logs (user_id, user_type, action, details, timestamp)
      VALUES (?, ?, 'login_success', ?, NOW())
    `, [user.user_id, user.user_type, `Successful login for "${username}"`]);

    // Set session
    req.session.user = { id: user.user_id, type: user.user_type };
    return res.json({ message: 'Login successful' });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Helper: log failed attempts and trigger alert if >=3
async function logFailedAttempt(userId, reason) {
  await db.query(`
    INSERT INTO audit_logs (user_id, user_type, action, details, timestamp)
    VALUES (?, 'admin', 'login_failed', ?, NOW())
  `, [userId, reason]);

  const [rows] = await db.query(`
    SELECT COUNT(*) AS count
    FROM audit_logs
    WHERE user_id = ?
      AND action = 'login_failed'
      AND timestamp >= NOW() - INTERVAL 5 MINUTE
  `, [userId]);

  if (rows[0].count >= 3) {
    await db.query(`
      INSERT INTO audit_logs (user_id, user_type, action, details, timestamp)
      VALUES (?, 'admin', 'multiple_failed_logins', '3 consecutive failed logins', NOW())
    `, [userId]);
  }
}

module.exports = { login };
