/**
 * UI helpers: toast notifications, status indicator, HTML escaping.
 */

const toast = document.getElementById('toast');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

let toastTimer = null;

/**
 * Show a transient toast at the bottom of the screen.
 * @param {string} msg - Message to display.
 * @param {'' | 'success' | 'error'} type - Visual type.
 */
export function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'toast ' + type;
  }, 2600);
}

/**
 * Update the status indicator in the header.
 * @param {'' | 'ready' | 'working'} state
 * @param {string} text
 */
export function setStatus(state, text) {
  statusDot.className = 'status-dot ' + state;
  statusText.textContent = text;
}

/**
 * Escape user-controlled strings for safe insertion into innerHTML.
 */
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}
