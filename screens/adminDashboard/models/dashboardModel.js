// filepath: screens/adminDashboard/models/dashboardModel.js
const db = require('../../../server/config/db');

/**
 * Fetch system logs (sidebar/table mini logs)
 */
async function fetchLogs(userType = null, limit = 5) {
  let query = `
    SELECT log_id, user_id, user_type, action, target_id, timestamp, details
    FROM audit_logs
    WHERE action IN ('login_success', 'login_failed', 'record_viewed', 'record_updated')
  `;
  const params = [];

  if (userType) {
    query += ` AND user_type = ?`;
    params.push(userType);
  }

  query += ` ORDER BY timestamp DESC LIMIT ${Number(limit) || 5}`;

  const [rows] = await db.query(query, params);
  if (!rows || rows.length === 0) return [];
  return rows.map(row => ({
    message: `${row.user_type} ${row.action} at ${new Date(row.timestamp).toLocaleString()}`
  }));
}

/**
 * Fetch security alerts
 */
/**
 * Fetch security alerts (unauthorized attempts, SQL injection, multiple failed logins)
 */
async function fetchAlerts(userType = null, limit = 10) {
  let query = `
    SELECT log_id, user_id, user_type, action, target_id, timestamp, details
    FROM audit_logs
    WHERE action IN (
      'unauthorized_export',
      'sensitive_file_viewed',
      'unauthorized_access',
      'sql_injection_attempt',
      'multiple_failed_logins'
    )
  `;
  const params = [];

  if (userType) {
    query += ` AND user_type = ?`;
    params.push(userType);
  }

  query += ` ORDER BY timestamp DESC LIMIT ${Number(limit) || 10}`;

  const [rows] = await db.query(query, params);
  if (!rows || rows.length === 0) return [];
  return rows.map(row => ({
    message: `${row.action} by ${row.user_type} at ${new Date(row.timestamp).toLocaleString()} — ${row.details}`
  }));
}

/**
 * Fetch activity log (exclude login events)
 */
async function fetchActivityLog(userType = null, limit = 15) {
  let query = `
    SELECT log_id, user_id, user_type, action, target_id, timestamp, details
    FROM audit_logs
    WHERE action NOT IN ('login_success', 'login_failed')
  `;
  const params = [];

  if (userType) {
    query += ` AND user_type = ?`;
    params.push(userType);
  }

  query += ` ORDER BY timestamp DESC LIMIT ${Number(limit) || 15}`;

  try {
    const [rows] = await db.query(query, params);
    if (!rows || rows.length === 0) return [];
    return rows.map(row => ({
      timestamp: new Date(row.timestamp).toLocaleString(),
      user_type: row.user_type,
      action: row.action,
      details: row.details
    }));
  } catch (err) {
    console.error('Error fetching activity log:', err);
    throw err;
  }
}

/**
 * Fetch recent timestamps
 */
/**
 * Fetch recent timestamps (exclude login events)
 */
async function fetchRecentTimestamps(userType = null, limit = 10) {
  let query = `
    SELECT log_id, user_id, user_type, action, target_id, timestamp, details
    FROM audit_logs
    WHERE action NOT IN ('login_success', 'login_failed')
  `;
  const params = [];

  if (userType) {
    query += ` AND user_type = ?`;
    params.push(userType);
  }

  query += ` ORDER BY timestamp DESC LIMIT ${Number(limit) || 10}`;

  try {
    const [rows] = await db.query(query, params);
    if (!rows || rows.length === 0) return [];
    return rows.map(row => ({
      timestamp: new Date(row.timestamp).toLocaleString(),
      user_type: row.user_type,
      action: row.action,
      details: row.details
    }));
  } catch (err) {
    console.error('Error fetching timestamps:', err);
    throw err;
  }
}


module.exports = {
  fetchLogs,
  fetchAlerts,
  fetchActivityLog,
  fetchRecentTimestamps
};
