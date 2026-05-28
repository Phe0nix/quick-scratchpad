# Quick Scratchpad Chrome Extension (v1.0)

Quick Scratchpad is a privacy-first Chrome extension for fast note-taking, lightweight formatting, and one-click capture from any webpage.

## Features

- Instant scratchpad in the popup for quick notes.
- Full-view writing mode for longer notes.
- Auto-save to local browser storage while typing.
- Right-click any text on a webpage and choose **Save to Scratchpad** to append the selection with source and timestamp metadata.
- Lightweight inline formatting for selected text:
  - Bold
  - Italic
  - Underline
  - Strikethrough
  - Link insertion
  - Remove formatting
- Copy the current note to the clipboard.
- Export the current note as a `.txt` file.
- Dark and light theme support shared between popup and full view.
- Live word and character counts.
- Empty-state hints for quick keyboard help.
- Plain-text paste behavior to keep formatting predictable.

## Keyboard Shortcuts

- `Ctrl+Shift+Y` on Windows/Linux or `Command+Shift+Y` on Mac: open Quick Scratchpad.
- `Ctrl+S` or `Command+S`: save the current note.
- `Ctrl+Shift+C` or `Command+Shift+C`: copy the current note.

## Privacy

- Notes are stored locally in `chrome.storage.local`.
- No backend.
- No external dependencies.
- No tracking.

## Usage

1. Open the extension from the toolbar or use the keyboard shortcut.
2. Type directly in the scratchpad, or switch to full view for longer writing.
3. Select text on a webpage and use the context menu to capture it into the scratchpad.
4. Use the toolbar buttons to copy, export, clear, or change theme.
