# iNardi

Armenian nardi (short and long) for mobile: bot games, two players on one phone, and online play with friends and coin rooms.

- `index.html`, `engine.js`, `bot.js`, `assets/`, `vendor/`: the game, served as a static web page.
- `engine.js`: the rules engine (short and long nardi). The server uses the same file.
- `server/schema.sql`: Supabase database (profiles, coin wallet, games, matchmaking) with row-level security.
- `server/supabase/functions/game/`: the game server (Supabase Edge Function). It rolls the dice and checks every move.

Only the public Supabase key is in this repository. No secret keys belong here.
