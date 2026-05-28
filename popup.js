
const editor = document.getElementById('editor');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const exportBtn = document.getElementById('exportBtn');
const themeBtn = document.getElementById('themeBtn');
const themeLabel = themeBtn ? themeBtn.querySelector('span') : null;
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const saveStatus = document.getElementById('saveStatus');
const toast = document.getElementById('toast');
const emptyHint = document.getElementById('emptyHint');
const formatToolbar = document.getElementById('formatToolbar');
const formatButtons = formatToolbar ? [...formatToolbar.querySelectorAll('.format-btn')] : [];

let saveTimer = null;
let toastTimer = null;
let statusResetTimer = null;
let currentTheme = DEFAULT_THEME;
let savedRange = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
}
function setStatus(label, state = '', options = {}) {
  const { autoReset = false, resetDelay = 1200 } = options;
  saveStatus.textContent = label;
  saveStatus.classList.remove('saved', 'saving');
  if (state) saveStatus.classList.add(state);
  clearTimeout(statusResetTimer);
  if (autoReset) {
    statusResetTimer = setTimeout(() => {
      saveStatus.textContent = 'Ready';
      saveStatus.classList.remove('saved', 'saving');
    }, resetDelay);
  }
}
function isEditorEmpty() {
  return getPlainTextFromEditor(editor).trim().length === 0;
}
function updateEmptyState() {
  if (!emptyHint) return;
  emptyHint.classList.toggle('visible', isEditorEmpty());
}
function updateCounts() {
  const text = getPlainTextFromEditor(editor);
  const words = countWords(text);
  const chars = countChars(text);
  wordCount.textContent = `${words} word${words === 1 ? '' : 's'}`;
  charCount.textContent = `${chars} char${chars === 1 ? '' : 's'}`;
  updateEmptyState();
}
function ensureEditorValue(value) {
  editor.innerHTML = normalizeEditorHtml(value);
  if (editor.innerHTML === '<br>') editor.innerHTML = '';
  updateCounts();
}
async function loadState() {
  const data = await getLocal([STORAGE_KEYS.note, STORAGE_KEYS.theme]);
  currentTheme = applyTheme(data[STORAGE_KEYS.theme] || DEFAULT_THEME);
  updateThemeButton();
  ensureEditorValue(data[STORAGE_KEYS.note] || '');
  setStatus('Ready');
  requestAnimationFrame(() => editor.focus());
}
async function saveNote() {
  setStatus('Saving…', 'saving');
  await setLocal({ [STORAGE_KEYS.note]: editor.innerHTML });
  updateCounts();
  setStatus('Saved ✓', 'saved', { autoReset: true, resetDelay: 1400 });
}
function scheduleSave() {
  updateCounts();
  setStatus('Typing…', 'saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveNote().catch(() => setStatus('Save failed')), 250);
}
function hideFormatToolbar() {
  if (!formatToolbar) return;
  formatToolbar.classList.remove('visible');
}
function restoreSelection() {
  if (!savedRange) return false;
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(savedRange);
  return true;
}
function selectionInsideEditor() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const common = range.commonAncestorContainer;
  return editor.contains(common.nodeType === 3 ? common.parentNode : common) ? range : null;
}
function positionFormatToolbar(range) {
  if (!formatToolbar) return;
  const rect = range.getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) {
    hideFormatToolbar();
    return;
  }
  formatToolbar.classList.add('visible');
  const toolbarRect = formatToolbar.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const left = Math.min(Math.max(8, rect.left + (rect.width / 2) - (toolbarRect.width / 2)), viewportWidth - toolbarRect.width - 8);
  const top = Math.max(8, rect.top - toolbarRect.height - 8);
  formatToolbar.style.left = `${left}px`;
  formatToolbar.style.top = `${top}px`;
}
function updateSelectionToolbar() {
  const range = selectionInsideEditor();
  if (!range) {
    hideFormatToolbar();
    return;
  }
  savedRange = range.cloneRange();
  positionFormatToolbar(range);
}
function applyFormat(command) {
  if (!restoreSelection()) return;
  editor.focus();
  if (command === 'createLink') {
    const rawUrl = window.prompt('Enter URL');
    if (!rawUrl) return;
    let url = rawUrl.trim();
    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) url = `https://${url}`;
    document.execCommand('createLink', false, url);
  } else if (command === 'removeFormatAll') {
    document.execCommand('removeFormat', false, null);
    document.execCommand('unlink', false, null);
  } else {
    document.execCommand(command, false, null);
  }
  updateSelectionToolbar();
  scheduleSave();
}
editor.addEventListener('input', scheduleSave);
editor.addEventListener('focus', () => updateSelectionToolbar());
editor.addEventListener('blur', () => setTimeout(() => {
  const active = document.activeElement;
  if (!formatToolbar || !formatToolbar.contains(active)) hideFormatToolbar();
}, 100));
editor.addEventListener('paste', (event) => {
  event.preventDefault();
  const text = (event.clipboardData || window.clipboardData).getData('text/plain');
  document.execCommand('insertText', false, text);
});
document.addEventListener('selectionchange', () => {
  if (document.activeElement === editor || (formatToolbar && formatToolbar.contains(document.activeElement))) {
    updateSelectionToolbar();
  }
});
if (formatButtons.length) {
  formatButtons.forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', () => applyFormat(button.dataset.command));
  });
}
clearBtn.addEventListener('click', async () => {
  const confirmed = confirm('Clear your scratchpad? This will remove the saved note.');
  if (!confirmed) return;
  ensureEditorValue('');
  await setLocal({ [STORAGE_KEYS.note]: '' });
  hideFormatToolbar();
  setStatus('Ready');
  showToast('Note cleared');
  editor.focus();
});
copyBtn.addEventListener('click', async () => {
  try {
    await copyNote(getPlainTextFromEditor(editor));
    setStatus('Ready');
    showToast('Copied to clipboard');
  } catch { setStatus('Copy failed'); }
});
exportBtn.addEventListener('click', () => {
  try {
    downloadNote(getPlainTextFromEditor(editor), 'quick-scratchpad');
    setStatus('Ready');
    showToast('Exported as .txt');
  } catch { setStatus('Export failed'); }
});
themeBtn.addEventListener('click', async () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  try {
    currentTheme = await saveTheme(currentTheme);
    updateThemeButton();
    setStatus('Ready');
    showToast(`Switched to ${currentTheme} theme`);
  } catch { setStatus('Theme failed'); }
});
window.addEventListener('keydown', async (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    clearTimeout(saveTimer);
    try { await saveNote(); } catch { setStatus('Save failed'); }
  }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
    event.preventDefault();
    try {
      await copyNote(getPlainTextFromEditor(editor));
      setStatus('Ready');
      showToast('Copied to clipboard');
    } catch { setStatus('Copy failed'); }
  }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes[STORAGE_KEYS.note] && document.activeElement !== editor) {
    ensureEditorValue(changes[STORAGE_KEYS.note].newValue || '');
    setStatus('Synced ✓', 'saved', { autoReset: true, resetDelay: 1200 });
  }
  if (changes[STORAGE_KEYS.theme]) {
    currentTheme = applyTheme(changes[STORAGE_KEYS.theme].newValue || DEFAULT_THEME);
    updateThemeButton();
  }
});

const expandBtn = document.getElementById('expandBtn');
function updateThemeButton() {
  if (!themeBtn) return;
  themeBtn.firstChild.textContent = currentTheme === 'dark' ? '☀ ' : '☾ ';
  if (themeLabel) themeLabel.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
  themeBtn.title = currentTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}
expandBtn.addEventListener('click', () => {
  const url = chrome.runtime.getURL('fullview.html');
  window.open(url, '_blank');
  setStatus('Ready');
  showToast('Opened full view');
});
loadState().catch(() => setStatus('Load failed'));
