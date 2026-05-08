/**
 * Output panel: combines per-image text into a single editable string,
 * supports multiple separators, tracks manual edits, and handles
 * copy-to-clipboard and .txt download.
 */

import { state } from './state.js';
import { showToast } from './ui.js';

const output = document.getElementById('output');
const separatorSelect = document.getElementById('separator');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const lineCount = document.getElementById('lineCount');

/**
 * Join all extracted text blocks using the selected separator style.
 */
function combineText() {
  const sep = separatorSelect.value;
  const parts = [];

  state.images.forEach((img) => {
    if (!img.text) return;
    if (sep === 'filename') {
      parts.push('=== ' + img.name + ' ===\n' + img.text);
    } else {
      parts.push(img.text);
    }
  });

  let separator;
  switch (sep) {
    case 'newline':   separator = '\n'; break;
    case 'blank':     separator = '\n\n'; break;
    case 'marker':    separator = '\n\n--- --- ---\n\n'; break;
    case 'filename':  separator = '\n\n'; break;
    case 'none':      separator = ''; break;
    default:          separator = '\n\n';
  }

  return parts.join(separator);
}

export function updateOutput() {
  if (state.outputManuallyEdited) {
    // Preserve the user's manual edits; just refresh stats.
    updateStats();
    return;
  }
  output.value = combineText();
  updateStats();
}

function updateStats() {
  const t = output.value;
  charCount.textContent = t.length.toLocaleString();
  wordCount.textContent = (t.trim() ? t.trim().split(/\s+/).length : 0).toLocaleString();
  lineCount.textContent = (t ? t.split('\n').length : 0).toLocaleString();
  copyBtn.disabled = !t;
  downloadBtn.disabled = !t;
}

export function initOutput() {
  separatorSelect.addEventListener('change', () => {
    if (state.outputManuallyEdited) {
      if (!confirm('수동으로 편집한 내용이 있습니다. 구분자 변경 시 재조합됩니다. 계속하시겠습니까?')) {
        return;
      }
      state.outputManuallyEdited = false;
    }
    updateOutput();
  });

  output.addEventListener('input', () => {
    state.outputManuallyEdited = true;
    updateStats();
  });

  copyBtn.addEventListener('click', async () => {
    if (!output.value) return;
    try {
      await navigator.clipboard.writeText(output.value);
      showToast('클립보드에 복사됨', 'success');
    } catch (err) {
      // Fallback for non-secure contexts
      output.select();
      document.execCommand('copy');
      showToast('복사됨', 'success');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!output.value) return;
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = 'ocr-' + ts + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('다운로드 시작', 'success');
  });

  updateStats();
}
