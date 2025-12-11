console.log('dashboard.js loaded');

async function safeFetchJSON(url) {
  const u = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
  const res = await fetch(u, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  const text = await res.text();
  if (text.startsWith('<!DOCTYPE')) {
    window.location.href = '/login';
    return [];
  }
  return JSON.parse(text);
}

async function loadLogs() {
  try {
    const logs = await safeFetchJSON('/api/logs');
    const list = document.querySelector('.logs-title')?.parentElement?.nextElementSibling;
    if (!list) return;
    list.innerHTML = logs.map(log => `<li>${log.message}</li>`).join('');
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

async function loadAlerts() {
  try {
    const alerts = await safeFetchJSON('/api/alerts');
    const list = document.querySelector('.security-title')?.parentElement?.nextElementSibling;
    if (!list) return;
    if (alerts.length > 0) {
      list.innerHTML = alerts.map(alert => `
        <li class="warning">
           ${alert.action.replace(/_/g, ' ')} — ${alert.user} (${alert.timestamp})
        </li>
      `).join('');
    } else {
      list.innerHTML = '<li>No security alerts</li>';
    }
  } catch (err) {
    console.error('Failed to load alerts:', err);
  }
}

let sortOrder = 'DESC';

async function loadActivity() {
  try {
    const userType = document.getElementById('userFilter')?.value || '';
    console.log(`Request -> /api/activity?user_type=${userType}&sort=${sortOrder}`);
    const activity = await safeFetchJSON(`/api/activity?user_type=${userType}&sort=${sortOrder}`);
    console.log('Activity count:', activity.length);
    if (activity.length) {
      console.log('First row:', activity[0].log_id, activity[0].timestamp);
      console.log('Last row:', activity[activity.length - 1].log_id, activity[activity.length - 1].timestamp);
    }
    const tbody = document.querySelector('#activityTbody') || document.querySelector('table tbody');
    if (!tbody) return;
    tbody.innerHTML = activity.map(row => `
      <tr>
        <td>${row.timestamp}</td>
        <td>${row.user_type || row.user || ''}</td>
        <td>${row.action}</td>
        <td class="col-details">${row.details || ''}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load activity log:', err);
  }
}

async function loadTimestamps() {
  try {
    const entries = await safeFetchJSON('/api/timestamps');
    const tbody = document.querySelector('#activityTbody') || document.querySelector('table tbody');
    if (!tbody) return;
    tbody.innerHTML = entries.map(entry => `
      <tr>
        <td>${entry.timestamp}</td>
        <td>${entry.user_type}</td>
        <td>${entry.action}</td>
        <td class="col-details">${entry.details || ''}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load timestamps:', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadLogs();
  loadAlerts();
  loadActivity();
  const sortSelect = document.getElementById('sortTimestamp');
  if (sortSelect) {
    sortSelect.value = sortOrder;
    sortSelect.addEventListener('change', () => {
      sortOrder = sortSelect.value;
      loadActivity();
    });
  }
  document.getElementById('userFilter')?.addEventListener('change', () => {
    loadActivity();
  });
});
