/**
 * Batch extraction: runs OCR sequentially across all images in order.
 * Sequential processing preserves output order and avoids rate-limit bursts.
 */

import { state } from './state.js';
import { showToast, setStatus } from './ui.js';
import { ocrImage } from './ocr.js';
import { renderList, updateButtons } from './imageList.js';
import { updateOutput } from './output.js';
import { loadApiKey } from './storage.js';

const extractBtn = document.getElementById('extractBtn');
const apiKeyInput = document.getElementById('apiKey');
const langSelect = document.getElementById('langHint');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

function getKey() {
  return apiKeyInput.value.trim() || loadApiKey();
}

function updateProgress(done, total) {
  const pct = total ? (done / total) * 100 : 0;
  progressFill.style.width = pct + '%';
  progressText.textContent = done + ' / ' + total;
}

async function runBatch() {
  const key = getKey();
  if (!key) {
    showToast('먼저 API 키를 입력하세요', 'error');
    apiKeyInput.focus();
    return;
  }
  if (!state.images.length) return;

  state.isProcessing = true;
  state.outputManuallyEdited = false;
  updateButtons();
  setStatus('working', '일괄 추출 중');
  progressWrap.classList.add('active');

  const total = state.images.length;
  let done = 0;
  let failed = 0;

  // Reset state for re-runs
  state.images.forEach(img => {
    img.status = 'pending';
    img.text = '';
    img.error = null;
  });
  renderList();
  updateProgress(0, total);
  updateOutput();

  const langHint = langSelect.value;

  for (let i = 0; i < state.images.length; i++) {
    const img = state.images[i];
    img.status = 'working';
    renderList();

    try {
      const text = await ocrImage(img.base64, key, langHint);
      img.text = text;
      img.status = 'done';
    } catch (err) {
      img.error = err.message;
      img.status = 'error';
      failed++;
      console.error('OCR failed for', img.name, err);
    }

    done++;
    updateProgress(done, total);
    renderList();
    updateOutput();
  }

  state.isProcessing = false;
  updateButtons();
  progressWrap.classList.remove('active');

  if (failed === 0) {
    setStatus('ready', '완료');
    showToast(total + '개 이미지 추출 완료', 'success');
  } else if (failed === total) {
    setStatus('', '모두 실패');
    showToast('모든 이미지 추출 실패', 'error');
  } else {
    setStatus('ready', '완료 (' + failed + '개 실패)');
    showToast((total - failed) + '개 성공 · ' + failed + '개 실패', 'error');
  }
}

export function initExtract() {
  extractBtn.addEventListener('click', runBatch);
}
