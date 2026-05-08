/**
 * Entry point: wires up API key inputs and initializes all modules.
 */

import { setStatus, showToast } from './ui.js';
import { loadApiKey, saveApiKey, clearApiKey } from './storage.js';
import { initUpload } from './upload.js';
import { initExtract } from './extract.js';
import { initOutput } from './output.js';
import { renderList, updateButtons } from './imageList.js';

const apiKeyInput = document.getElementById('apiKey');
const saveKeyBtn = document.getElementById('saveKey');
const clearKeyBtn = document.getElementById('clearKey');

function initApiKey() {
  const stored = loadApiKey();
  if (stored) {
    apiKeyInput.value = stored;
    setStatus('ready', '키 로드됨');
  }

  saveKeyBtn.addEventListener('click', () => {
    const v = apiKeyInput.value.trim();
    if (!v) {
      showToast('키를 입력하세요', 'error');
      return;
    }
    saveApiKey(v);
    showToast('API 키 저장됨', 'success');
    setStatus('ready', '키 저장됨');
  });

  clearKeyBtn.addEventListener('click', () => {
    apiKeyInput.value = '';
    clearApiKey();
    showToast('API 키 삭제됨');
    setStatus('', '대기 중');
  });
}

function init() {
  initApiKey();
  initUpload();
  initExtract();
  initOutput();
  renderList();
  updateButtons();
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
