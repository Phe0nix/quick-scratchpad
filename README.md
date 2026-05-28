# Quick Scratchpad Chrome Extension (v1.6)

Quick Scratchpad is a minimal Chrome extension for instant note-taking.

## New in v1.6

- **Save selected text from any webpage** using the browser right-click menu:
  - Select text on a page
  - Right-click
  - Choose **Save to Scratchpad**
  - The selected text is appended to the current scratchpad with source + timestamp metadata
- Added a tiny **remove-format** button (`⊘`) to the inline formatting tooltip

## Existing features

- Very light inline text formatting for selected text in both popup and full view
- Tooltip toolbar above selected text with icon-only controls
- Unified button design across popup and full view
- Non-repetitive feedback strategy (toast for direct actions, status bar for ongoing state)
- Open full view in a separate tab for longer writing sessions
- Copy note to clipboard
- Export note as a `.txt` file
- Helpful empty-state quick start hints for first-time users
- Shared note + theme state between popup and full view
- Keyboard shortcut support (`Ctrl+Shift+Y` on Windows/Linux, `Command+Shift+Y` on Mac)
- Auto-saves notes locally
- Word + character counts

## Notes

- Data is stored in `chrome.storage.local`
- No backend, no external dependencies, no tracking
- Formatting remains intentionally minimal to keep the extension lightweight
- Pasted content inside the editor is inserted as plain text to keep formatting predictable and clean
