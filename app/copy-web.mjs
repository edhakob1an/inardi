// Copies the web game (repo root) into www/ for the app build
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname, out = new URL('www/', import.meta.url).pathname;
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'engine.js', 'bot.js', 'i18n.js']) cpSync(root + f, out + f);
for (const d of ['assets', 'vendor']) if (existsSync(root + d)) cpSync(root + d, out + d, { recursive: true });
console.log('web copied to www/');
