/**
 * Shared application state.
 * Keeping it as a singleton object so any module can import and mutate
 * without needing a heavy state library.
 */

export const state = {
  /**
   * @type {Array<{
   *   id: number,
   *   name: string,
   *   base64: string,
   *   dataUrl: string,
   *   status: 'pending' | 'working' | 'done' | 'error',
   *   text: string,
   *   error: string | null
   * }>}
   */
  images: [],
  nextId: 1,
  isProcessing: false,
  outputManuallyEdited: false,
};

export function addImage(img) {
  state.images.push({ ...img, id: state.nextId++ });
}

export function removeImageById(id) {
  state.images = state.images.filter(img => img.id !== id);
}

export function clearImages() {
  state.images = [];
  state.outputManuallyEdited = false;
}

export function findImage(id) {
  return state.images.find(img => img.id === id);
}

export function reorderImages(draggedId, targetId) {
  const draggedIdx = state.images.findIndex(i => i.id === draggedId);
  if (draggedIdx < 0) return false;
  const [dragged] = state.images.splice(draggedIdx, 1);
  const newTargetIdx = state.images.findIndex(i => i.id === targetId);
  if (newTargetIdx < 0) {
    // target gone - restore
    state.images.splice(draggedIdx, 0, dragged);
    return false;
  }
  state.images.splice(newTargetIdx, 0, dragged);
  return true;
}
