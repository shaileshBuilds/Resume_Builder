# ResumeCraft Studio — Part 21 QA Report

Automated checks run with Playwright (Chromium) against a local static server.

## Results
- Template registry: 50 templates, 50 unique IDs, 50 unique names, 0 validation errors, 1 warning (bold-portfolio lists 3 of 11 sections; the rest are appended by design).
- Categories: Executive 8, Creative 6, Fresher 6, ATS 5, Minimal 5, Technical 5, Academic 5, Modern 4, Corporate 3, Professional 3.
- Routes: all 26 routes render content at 320, 375, 430, 768, 1024 and 1440px. No horizontal overflow, navbar stays 68px tall, no blank pages.
- Console / page errors: none.
- Dead internal links: none. No lorem ipsum, console.log or debugger statements.
- Homepage: 6 real template previews render at A4 ratio (scale 0.408 at 1280px).
- Mobile menu opens and closes after navigation. Dark mode toggles.
- Gallery: search, no-results state, preview modal (Esc closes) work.
- Editor: sample creation, field edit, autosave to localStorage, dashboard actions (Edit, Duplicate, Rename, Download, Delete, Favorite) present, JSON backup export downloads.
- Long resume (24 jobs, tripled skills, special characters, no photo): renders, HTML escaped, spans multiple pages.
- Keyboard: Tab reaches controls with a visible 2px outline.

## Limitations
- Not exercised in this run: real PDF download, print dialog, drag-and-drop by mouse, and live AI calls (these need a real browser session / API key).
- Fonts and Lucide icons load from CDNs; offline use falls back to system fonts and no icons.
- Template search matches badges, so "ats" matches most templates (ATS-compatible).
- Data is stored in browser localStorage only (no accounts/sync).
