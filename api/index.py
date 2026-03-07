#!/usr/bin/env python3
import json
import re
import sqlite3
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

from init_db import initialize_db
from multiplayer import MultiplayerManager


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "game.db"
MULTIPLAYER = MultiplayerManager()


def card_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    keywords = [entry.strip() for entry in row["keywords"].split(",") if entry.strip()]
    return {
        "id": row["id"],
        "slug": row["slug"],
        "name": row["name"],
        "description": row["description"],
        "cardType": row["card_type"],
        "rarity": row["rarity"],
        "school": row["school"],
        "cost": row["cost"],
        "attack": row["attack"],
        "health": row["health"],
        "effectOnPlay": row["effect_on_play"],
        "effectValue": row["effect_value"],
        "keywords": keywords,
        "habitat": row["habitat"],
        "woodYield": row["wood_yield"],
        "stoneYield": row["stone_yield"],
        "waterYield": row["water_yield"],
        "paletteStart": row["palette_start"],
        "paletteEnd": row["palette_end"],
        "accent": row["accent"],
        "starterCopies": row["starter_copies"],
    }


def level_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "subtitle": row["subtitle"],
        "enemyHero": row["enemy_hero"],
        "enemyHealth": row["enemy_health"],
        "aiDifficulty": row["ai_difficulty"],
        "intro": row["intro"],
        "cardBackStart": row["card_back_start"],
        "cardBackEnd": row["card_back_end"],
    }


class handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        return

    def send_json(self, payload: Any, status: int = 200) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def read_json_body(self) -> dict[str, Any]:
        length_raw = self.headers.get("Content-Length", "0")
        try:
            length = int(length_raw)
        except ValueError:
            length = 0
        if length <= 0:
            return {}
        if length > 1_000_000:
            raise ValueError("Payload too large")
        raw = self.rfile.read(length)
        if not raw:
            return {}
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception as exc:  # noqa: BLE001
            raise ValueError("Invalid JSON payload") from exc

    def get_connection(self) -> sqlite3.Connection:
        if not DB_PATH.exists():
            initialize_db(DB_PATH)
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def send_multiplayer_result(self, result: dict[str, Any]) -> None:
        status_value = result.get("httpStatus", result.get("status", 200))
        status = int(status_value) if isinstance(status_value, int) else 200
        payload = {key: value for key, value in result.items() if key != "httpStatus"}
        if isinstance(payload.get("status"), int):
            payload.pop("status", None)
        self.send_json(payload, status=status)

    def load_starter_deck(self) -> list[dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute(
                """
                SELECT id, slug, name, description, card_type, rarity, school,
                       cost, attack, health, effect_on_play, effect_value, keywords,
                       habitat, wood_yield, stone_yield, water_yield,
                       palette_start, palette_end, accent, starter_copies
                FROM cards
                WHERE starter_copies > 0
                ORDER BY cost, id
                """
            ).fetchall()
            cards = [card_row_to_dict(row) for row in rows]

        starter_deck: list[dict[str, Any]] = []
        for card in cards:
            starter_deck.extend([card] * card["starterCopies"])
        return starter_deck

    def handle_cards(self) -> None:
        with self.get_connection() as conn:
            rows = conn.execute(
                """
                SELECT id, slug, name, description, card_type, rarity, school,
                       cost, attack, health, effect_on_play, effect_value, keywords,
                       habitat, wood_yield, stone_yield, water_yield,
                       palette_start, palette_end, accent, starter_copies
                FROM cards
                ORDER BY cost, id
                """
            ).fetchall()
        self.send_json({"cards": [card_row_to_dict(row) for row in rows]})

    def handle_levels(self) -> None:
        with self.get_connection() as conn:
            rows = conn.execute(
                """
                SELECT id, name, subtitle, enemy_hero, enemy_health, ai_difficulty,
                       intro, card_back_start, card_back_end
                FROM levels
                ORDER BY id
                """
            ).fetchall()
        self.send_json({"levels": [level_row_to_dict(row) for row in rows]})

    def handle_starter_deck(self) -> None:
        self.send_json({"starterDeck": self.load_starter_deck()})

    def handle_level(self, level_id: int) -> None:
        with self.get_connection() as conn:
            level_row = conn.execute(
                """
                SELECT id, name, subtitle, enemy_hero, enemy_health, ai_difficulty,
                       intro, card_back_start, card_back_end
                FROM levels
                WHERE id = ?
                """,
                (level_id,),
            ).fetchone()
            if level_row is None:
                self.send_json({"error": "Level not found"}, status=404)
                return

            deck_rows = conn.execute(
                """
                SELECT c.id, c.slug, c.name, c.description, c.card_type, c.rarity, c.school,
                       c.cost, c.attack, c.health, c.effect_on_play, c.effect_value,
                       c.keywords, c.habitat, c.wood_yield, c.stone_yield, c.water_yield,
                       c.palette_start, c.palette_end, c.accent, c.starter_copies,
                       ld.copies
                FROM level_decks ld
                JOIN cards c ON c.id = ld.card_id
                WHERE ld.level_id = ?
                ORDER BY c.cost, c.id
                """,
                (level_id,),
            ).fetchall()

        enemy_deck: list[dict[str, Any]] = []
        for row in deck_rows:
            card = card_row_to_dict(row)
            enemy_deck.extend([card] * row["copies"])

        self.send_json({"level": level_row_to_dict(level_row), "enemyDeck": enemy_deck})

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/cards":
            self.handle_cards()
            return
        if path == "/api/levels":
            self.handle_levels()
            return
        if path == "/api/starter-deck":
            self.handle_starter_deck()
            return

        level_match = re.match(r"^/api/level/(\d+)$", path)
        if level_match:
            self.handle_level(int(level_match.group(1)))
            return

        if path == "/api/multiplayer/state":
            result = MULTIPLAYER.get_state(
                room_code=query.get("roomCode", [""])[0],
                token=query.get("token", [""])[0],
            )
            self.send_multiplayer_result(result)
            return

        self.send_json({"ok": False, "error": "Unknown endpoint"}, status=404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            body = self.read_json_body()
        except ValueError as exc:
            self.send_json({"ok": False, "error": str(exc)}, status=400)
            return

        if path == "/api/multiplayer/create":
            result = MULTIPLAYER.create_room(body.get("name", "Beaver"))
            self.send_multiplayer_result(result)
            return
        if path == "/api/multiplayer/join":
            result = MULTIPLAYER.join_room(body.get("roomCode", ""), body.get("name", "Beaver"))
            self.send_multiplayer_result(result)
            return
        if path == "/api/multiplayer/start":
            result = MULTIPLAYER.start_room(
                room_code=body.get("roomCode", ""),
                token=body.get("token", ""),
                starter_cards=self.load_starter_deck(),
            )
            self.send_multiplayer_result(result)
            return
        if path == "/api/multiplayer/play":
            result = MULTIPLAYER.play_card(
                room_code=body.get("roomCode", ""),
                token=body.get("token", ""),
                instance_id=body.get("instanceId"),
            )
            self.send_multiplayer_result(result)
            return
        if path == "/api/multiplayer/attack":
            result = MULTIPLAYER.attack(
                room_code=body.get("roomCode", ""),
                token=body.get("token", ""),
                attacker_id=body.get("attackerId"),
                target_type=body.get("targetType", ""),
                target_id=body.get("targetId"),
            )
            self.send_multiplayer_result(result)
            return
        if path == "/api/multiplayer/end-turn":
            result = MULTIPLAYER.end_turn(room_code=body.get("roomCode", ""), token=body.get("token", ""))
            self.send_multiplayer_result(result)
            return

        self.send_json({"ok": False, "error": "Unknown endpoint"}, status=404)
