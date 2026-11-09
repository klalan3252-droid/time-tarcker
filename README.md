# Time Tracker

A lightweight, browser-based time tracker. Plain HTML/CSS/JavaScript: no server, no build step, no dependencies.

## Run

Open `index.html` in a browser (double-click it, or `file://` path). Data is kept in `localStorage`.

- Type an optional description and press **Start**; the elapsed time (HH:MM:SS) updates every second.
- Press **Stop** to add the entry to the list (newest first).
- A running timer survives page reloads.
- Edit an entry's description or delete it; the "Today" total (by local start day) updates.

## Test

Requires Node 18+. No install needed:

```
npm test        # or: node --test test/
```

## Layout

- `index.html`, `styles.css` — page and styles
- `src/tracker.js` — pure logic (durations, formatting, totals, entry updates)
- `src/storage.js` — localStorage helpers (storage object passed in)
- `src/app.js` — DOM wiring
- `test/` — unit tests
