# Development notes

- `artifact-index.html`: the page body as published to the Claude preview link (no `<head>`).
- `build_web.py`: wraps that page into the full `index.html` at the repository root (mobile viewport, app meta tags) and copies game files.
- `test.js`: rules-engine self-play test (`node dev/test.js`, run from a folder containing engine.js and bot.js).
- `server-e2e.mjs`: two-guest test against the live Supabase server (needs `@supabase/supabase-js`).
