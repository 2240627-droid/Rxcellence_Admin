// public/js/dashboard.js

// Helper: safely fetch JSON, detect HTML redirects
async function safeFetchJSON(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (text.startsWith('<!DOCTYPE')) {
    // Redirected to login page
    window.location.href = '/login';
    return [];
  }
  return JSON.parse(text);
}

// Load system logs
async function loadLogs() {
  try {
    const logs = await safeFetchJSON('/api/logs');
    const list = document.querySelector('.logs-title').parentElement.nextElementSibling;
    list.innerHTML = logs.map(log => `<li>${log.message}</li>`).join('');
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

// Load security alerts
// Load security alerts
async function loadAlerts() {
  try {
    const alerts = await safeFetchJSON('/api/alerts');
    const title = document.querySelector('.security-title');

    if (alerts.length > 0) {
      // Show the latest alert in the title itself
      const latest = alerts[0];
      title.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i> &nbsp;
        Security Alert — <span class="warning-text">WARNING: ${latest.details}</span>
      `;
    } else {
      // Default title if no alerts
      title.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i> &nbsp; Security Alert
      `;
    }
  } catch (err) {
    console.error('Failed to load alerts:', err);
  }
}


// Load activity log (audit trail)
async function loadActivity() {
  try {
    const activity = await safeFetchJSON('/api/activity');
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = activity.map(row => `
      <tr>
        <td>${new Date(row.timestamp).toLocaleString()}</td>
        <td>${row.user_type || row.user}</td>
        <td>${row.action}</td>
        <td class="col-details">${row.details}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load activity log:', err);
  }
}

// Load recent timestamps directly from audit_logs
async function loadTimestamps() {
  try {
    const entries = await safeFetchJSON('/api/timestamps');
    console.log('Fetched entries:', entries);
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = entries.map(entry => `
      <tr>
        <td>${new Date(entry.timestamp).toLocaleString()}</td>
        <td>${entry.user_type}</td>
        <td>${entry.action}</td>
        <td class="col-details">${entry.details}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load timestamps:', err);
  }
}

// Load everything on page load
window.addEventListener('DOMContentLoaded', () => {
  loadLogs();
  loadAlerts();
  // Choose one depending on what you want to show in the table:
  // loadActivity(); 
  loadTimestamps(); 
});
