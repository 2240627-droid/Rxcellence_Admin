const db = require('../../../server/config/db');

/**
 * Fetch system logs for sidebar/table display.
 * Includes login and record-related actions.
 */
async function fetchLogs(userType = null, limit = 5, sort = 'DESC') {
  let query = `
    SELECT log_id, user_id, user_type, action, target_id, timestamp, details
    FROM audit_logs
    WHERE action IN ('login_success', 'login_failed', 'record_viewed', 'record_updated')
  `;
  const params = [];

  // Filter by user type if provided
  if (userType) {
    query += ` AND user_type = ?`;
    params.push(userType);
  }

  // Sort and limit results
  const order = sort && sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY timestamp ${order}, log_id ${order} LIMIT ${Number(limit) || 5}`;

  const [rows] = await db.query(query, params);
  if (!rows || rows.length === 0) return [];

  // Format logs into readable messages
  return rows.map(row => ({
    message: `${row.user_type} ${row.action} at ${new Date(row.timestamp).toLocaleString()}`
  }));
}

/**
 * Fetch security-related alerts.
 * Includes unauthorized access, SQL injection, and multiple failed logins.
 */
async function fetchAlerts(userType = null, limit = 10, sort = 'DESC') {
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

  const order = sort && sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY timestamp ${order}, log_id ${order} LIMIT ${Number(limit) || 10}`;

  const [rows] = await db.query(query, params);
  if (!rows || rows.length === 0) return [];

  // Format alerts with simplified fields
  return rows.map(row => ({
    user: row.details.match(/for "(.*)"/)?.[1] || row.user_type,
    action: row.action.replace(/_/g, ' '),
    timestamp: new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));
}

/**
 * Fetch general activity logs (excluding login events).
 */
async function fetchActivityLog(userType = null, limit = 15, sort = 'DESC') {
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

  const order = sort && sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY timestamp ${order}, log_id ${order} LIMIT ${Number(limit) || 15}`;

  const [rows] = await db.query(query, params);
  if (!rows || rows.length === 0) return [];

  return rows.map(row => ({
    log_id: row.log_id,
    timestamp: new Date(row.timestamp).toLocaleString(),
    user_type: row.user_type,
    action: row.action.replace(/_/g, ' '),
    details: row.details
  }));
}

/**
 * Fetch recent timestamps for non-login actions.
 */
async function fetchRecentTimestamps(userType = null, limit = 10, sort = 'DESC') {
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

  const order = sort && sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY timestamp ${order}, log_id ${order} LIMIT ${Number(limit) || 10}`;

  try {
    const [rows] = await db.query(query, params);
    if (!rows || rows.length === 0) return [];

    return rows.map(row => ({
      log_id: row.log_id,
      timestamp: new Date(row.timestamp).toLocaleString(),
      user_type: row.user_type,
      action: row.action.replace(/_/g, ' '),
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