/**
 * API key persistence via localStorage.
 * Safely handles environments where localStorage is blocked (private mode, etc.).
 */

const STORAGE_KEY = 'gcv_api_key_v1';

export function loadApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) {
    console.warn('localStorage unavailable:', e);
    return '';
  }
}

export function saveApiKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
    return true;
  } catch (e) {
    console.warn('localStorage save failed:', e);
    return false;
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}
