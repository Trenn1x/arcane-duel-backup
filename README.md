# Beaverforge: River Dominion

Single-player beaver-strategy card game prototype.
Built and distributed under pseudonym: **trenn1x**.

## What It Includes

- SQLite card database with full card attributes plus habitat and per-turn resource yields.
- Three board habitats (River, Forest, Dam) that change turn economy and restoration.
- Multi-profile progression system (create/switch/delete) with separate saves per colony profile.
- Persistent dam progression with resources (`wood`, `stone`, `water`) saved per profile in browser storage.
- Profile stats tracking for wins, losses, and streaks.
- Separate **Dam Workshop** screen for permanent upgrades and deck forging.
- Combat keyword mechanics: `guard`/`defender`, `fury`, `poisonous`, and `lifesteal`.
- Beaver-focused tutorial with fact-to-mechanic explanations.
- Adaptive procedural music and layered sound effects for core game states.
- Automatic end-turn when no legal player actions remain.
- 9 campaign levels, including new late-game encounters and keyword-focused cards.
- Online Versus (beta): room code create/join/start flow for live 1v1 multiplayer.

## Tech Stack

- Backend: Python standard library (`http.server`, `sqlite3`)
- Database: SQLite (`game.db`)
- Frontend: HTML, CSS, vanilla JavaScript

## Run

```bash
cd /Users/thomasverdier/arcane-duel
python3 init_db.py
python3 server.py
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080)

## Quick Multiplayer Test

1. Start the server on a clean port:

```bash
cd /Users/thomasverdier/arcane-duel
BEAVERFORGE_PORT=8093 python3 server.py
```

2. Expose it for your cousin:

```bash
ngrok http 8093 --log=stdout --log-format=logfmt
```

3. You and your cousin both open the ngrok URL.
4. In **Online Versus (Beta)**:
   - You: enter name, click **Create Room**, send the room code (or copy invite link).
   - Cousin: enter name + code, click **Join Room**.
   - You: click **Start Match**.

## One-Command Public Session (Zero Budget)

```bash
cd /Users/thomasverdier/arcane-duel
./scripts/start_trenn1x_session.sh 8093
```

See launch playbook: [LAUNCH_TRENN1X_ZERO_BUDGET.md](/Users/thomasverdier/arcane-duel/LAUNCH_TRENN1X_ZERO_BUDGET.md)

## Database Tables

- `cards`: gameplay stats, effects, habitat, yield, visual attributes
- `levels`: campaign metadata and opponent tuning
- `level_decks`: level-specific enemy deck compositions
