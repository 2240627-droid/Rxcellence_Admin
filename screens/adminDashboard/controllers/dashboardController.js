const dashboardModel = require('../models/dashboardModel');

/**
 * GET /api/logs
 * Returns system logs (e.g., login attempts, record views/updates).
 */
async function getLogs(req, res) {
  try {
    const { user_type, limit } = req.query;
    const logs = await dashboardModel.fetchLogs(user_type || null, Number(limit) || 10);
    return res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

/**
 * GET /api/alerts
 * Returns security-related alerts (e.g., unauthorized access, SQL injection).
 */
async function getAlerts(req, res) {
  try {
    const { user_type, limit } = req.query;
    const alerts = await dashboardModel.fetchAlerts(user_type || null, Number(limit) || 10);
    return res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

/**
 * GET /api/activity
 * Returns general activity logs (excluding login events).
 */
async function getActivityLog(req, res) {
  try {
    const { user_type, limit, sort } = req.query;
    const activity = await dashboardModel.fetchActivityLog(
      user_type || null,
      Number(limit) || 15,
      sort || 'DESC'
    );
    return res.json(activity);
  } catch (err) {
    console.error('Error fetching activity log:', err);
    return res.status(500).json({ error: 'Failed to fetch activity log' });
  }
}

/**
 * GET /api/timestamps
 * Returns recent timestamps for non-login actions.
 */
async function getRecentTimestamps(req, res) {
  try {
    const { user_type, limit, sort } = req.query;
    const entries = await dashboardModel.fetchRecentTimestamps(
      user_type || null,
      Number(limit) || 10,
      sort || 'DESC'
    );
    return res.json(entries);
  } catch (err) {
    console.error('Error fetching recent timestamps:', err);
    return res.status(500).json({ error: 'Failed to fetch timestamps' });
  }
}

module.exports = {
  getLogs,
  getAlerts,
  getActivityLog,
  getRecentTimestamps
};
