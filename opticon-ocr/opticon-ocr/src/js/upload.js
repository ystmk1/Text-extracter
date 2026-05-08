/**
 * All image-input paths: file picker, drag-drop from OS, clipboard paste.
 */

import { state, addImage, clearImages } from './state.js';
import { showToast, setStatus } from './ui.js';
import { renderList, updateButtons } from './imageList.js';
import { updateOutput } from './output.js';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const pasteBtn = document.getElementById('pasteBtn');
const clearAllBtn = document.getElementById('clearAll');

/**
 * Read an array of File objects and add them to state as images.
 */
function addFiles(fileList) {
  const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
  if (!files.length) {
    showToast('이미지 파일이 없습니다', 'error');
    return;
  }

  const promises = files.map(file => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      addImage({
        name: file.name || 'image.png',
        base64: dataUrl.split(',')[1],
        dataUrl,
        status: 'pending',
        text: '',
        error: null,
      });
      resolve(true);
    };
    reader.onerror = () => resolve(false);
    reader.readAsDataURL(file);
  }));

  Promise.all(promises).then((results) => {
    renderList();
    updateButtons();
    const added = results.filter(Boolean).length;
    if (added > 0) {
      showToast(added + '개 이미지 추가됨', 'success');
      setStatus('ready', '추출 준비');
    }
  });
}

export function initUpload() {
  // Click to open file picker
  dropZone.addEventListener('click', () => {
    if (!state.isProcessing) fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) addFiles(e.target.files);
    fileInput.value = ''; // allow re-selecting the same file
  });

  // OS-level file drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!state.isProcessing) dropZone.classList.add('dragging');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragging');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
    if (state.isProcessing) return;
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  // Global Ctrl+V paste
  window.addEventListener('paste', (e) => {
    if (state.isProcessing) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) {
      addFiles(files);
      e.preventDefault();
    }
  });

  // Programmatic clipboard paste via button (Clipboard API)
  pasteBtn.addEventListener('click', async () => {
    if (state.isProcessing) return;
    try {
      const items = await navigator.clipboard.read();
      const files = [];
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            files.push(new File([blob], 'pasted-' + Date.now() + '.png', { type }));
            break;
          }
        }
      }
      if (files.length) addFiles(files);
      else showToast('클립보드에 이미지가 없습니다', 'error');
    } catch (err) {
      showToast('Ctrl+V 로 직접 붙여넣으세요');
    }
  });

  // Clear all
  clearAllBtn.addEventListener('click', () => {
    if (state.isProcessing) return;
    if (state.images.length > 3 && !confirm('모든 이미지를 지우시겠습니까?')) return;
    clearImages();
    renderList();
    updateButtons();
    updateOutput();
    setStatus('', '대기 중');
  });
}
