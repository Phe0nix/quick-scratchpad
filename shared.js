
const STORAGE_KEYS = { note: 'quickScratchpadNote', theme: 'quickScratchpadTheme' };
const DEFAULT_THEME = 'dark';

function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
function countChars(text) { return text.length; }
function fileTimestamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}-${min}`;
}
async function getLocal(keys) { return chrome.storage.local.get(keys); }
async function setLocal(values) { return chrome.storage.local.set(values); }
function applyTheme(theme) {
  const resolved = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}
async function saveTheme(theme) {
  const resolved = applyTheme(theme);
  await setLocal({ [STORAGE_KEYS.theme]: resolved });
  return resolved;
}
function noteToBlob(note) { return new Blob([note], { type: 'text/plain;charset=utf-8' }); }
function downloadNote(note, filePrefix = 'quick-scratchpad') {
  const blob = noteToBlob(note);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filePrefix}_${fileTimestamp()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 250);
}
async function copyNote(note) { await navigator.clipboard.writeText(note); }
function normalizeEditorHtml(value) {
  if (!value) return '';
  return typeof value === 'string' ? value : '';
}
function getPlainTextFromEditor(editor) {
  return (editor.innerText || '').replace(/\u00A0/g, ' ').replace(/\n{3,}/g, '\n\n').trimEnd();
}
