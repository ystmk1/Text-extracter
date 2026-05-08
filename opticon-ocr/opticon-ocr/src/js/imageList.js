/**
 * Image list: renders thumbnails, per-item status, remove buttons,
 * and supports drag-and-drop reordering (distinct from file-drop via a custom MIME type).
 */

import { state, removeImageById, reorderImages } from './state.js';
import { showToast, escapeHtml } from './ui.js';
import { updateOutput } from './output.js';

const imageList = document.getElementById('imageList');
const imageCountLabel = document.getElementById('imageCount');
const imgStatCount = document.getElementById('imgStatCount');
const extractBtn = document.getElementById('extractBtn');
const clearAllBtn = document.getElementById('clearAll');

const REORDER_MIME = 'application/x-ocr-item';

export function renderList() {
  imageList.innerHTML = '';
  imageCountLabel.textContent = state.images.length ? '· ' + state.images.length : '';
  imgStatCount.textContent = state.images.length;

  if (!state.images.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '아직 이미지가 없습니다';
    imageList.appendChild(empty);
    return;
  }

  state.images.forEach((img, idx) => {
    imageList.appendChild(buildItem(img, idx));
  });
}

function buildItem(img, idx) {
  const item = document.createElement('div');
  item.className = 'image-item status-' + img.status;
  item.draggable = !state.isProcessing;
  item.dataset.id = img.id;

  let metaText = '대기';
  let metaClass = '';
  if (img.status === 'working') { metaText = '추출 중...'; metaClass = 'working'; }
  else if (img.status === 'done') { metaText = (img.text || '').length + '자 추출됨'; metaClass = 'success'; }
  else if (img.status === 'error') { metaText = '실패: ' + (img.error || ''); metaClass = 'error'; }

  item.innerHTML = `
    <span class="item-handle">≡</span>
    <span class="item-index">${String(idx + 1).padStart(2, '0')}</span>
    <img class="item-thumb" src="${img.dataUrl}" alt="" />
    <div class="item-info">
      <div class="item-name">${escapeHtml(img.name)}</div>
      <div class="item-meta ${metaClass}">${escapeHtml(metaText)}</div>
    </div>
    <button class="item-remove" data-id="${img.id}" title="제거">×</button>
  `;

  item.querySelector('.item-remove').addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.isProcessing) {
      showToast('추출 중에는 제거할 수 없습니다', 'error');
      return;
    }
    removeImageById(img.id);
    renderList();
    updateButtons();
    updateOutput();
  });

  bindDragHandlers(item, img);
  return item;
}

function bindDragHandlers(item, img) {
  item.addEventListener('dragstart', (e) => {
    if (state.isProcessing) { e.preventDefault(); return; }
    item.classList.add('dragging-item');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(img.id));
    // Custom MIME so file-drop handlers can distinguish this from external file drags.
    e.dataTransfer.setData(REORDER_MIME, String(img.id));
  });

  item.addEventListener('dragend', () => {
    item.classList.remove('dragging-item');
    document.querySelectorAll('.image-item').forEach(el => el.classList.remove('drag-over'));
  });

  item.addEventListener('dragover', (e) => {
    if (!Array.from(e.dataTransfer.types).includes(REORDER_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    item.classList.add('drag-over');
  });

  item.addEventListener('dragleave', () => {
    item.classList.remove('drag-over');
  });

  item.addEventListener('drop', (e) => {
    if (!Array.from(e.dataTransfer.types).includes(REORDER_MIME)) return;
    e.preventDefault();
    e.stopPropagation();
    item.classList.remove('drag-over');
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!draggedId || draggedId === img.id) return;
    if (reorderImages(draggedId, img.id)) {
      renderList();
      updateOutput();
    }
  });
}

export function updateButtons() {
  const hasImages = state.images.length > 0;
  extractBtn.disabled = !hasImages || state.isProcessing;
  clearAllBtn.disabled = !hasImages || state.isProcessing;
}
