# Beaverforge: River Dominion

Single-player beaver-strategy card game prototype.

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

## Database Tables

- `cards`: gameplay stats, effects, habitat, yield, visual attributes
- `levels`: campaign metadata and opponent tuning
- `level_decks`: level-specific enemy deck compositions
