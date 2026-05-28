
const STORAGE_KEY = 'quickScratchpadNote';
const MENU_ID = 'save-selected-to-scratchpad';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildCaptureHtml(selectionText, pageUrl) {
  const safeText = escapeHtml(selectionText).replace(/\n/g, '<br>');
  let host = '';
  try {
    host = new URL(pageUrl).hostname;
  } catch {
    host = pageUrl || 'Unknown source';
  }
  const now = new Date();
  const ts = now.toLocaleString();
  return [
    '<div><b>Captured text</b></div>',
    `<div>${safeText}</div>`,
    `<div><span style="opacity:.75">🌐 ${escapeHtml(host)} • 🕒 ${escapeHtml(ts)}</span></div>`,
    '<div><br></div>'
  ].join('');
}

async function appendSelectionToScratchpad(selectionText, pageUrl) {
  const current = await chrome.storage.local.get([STORAGE_KEY]);
  const existing = current[STORAGE_KEY] || '';
  const capture = buildCaptureHtml(selectionText, pageUrl);
  const combined = existing ? `${existing}${capture}` : capture;
  await chrome.storage.local.set({ [STORAGE_KEY]: combined });
}

function ensureContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: 'Save to Scratchpad',
      contexts: ['selection']
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  ensureContextMenu();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;
  if (!info.selectionText) return;
  try {
    await appendSelectionToScratchpad(info.selectionText, info.pageUrl || '');
  } catch (error) {
    console.error('Failed to save selected text to scratchpad', error);
  }
});
