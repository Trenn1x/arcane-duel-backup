#!/usr/bin/env python3
import copy
import random
import secrets
import string
import threading
import time
from typing import Any


RESOURCE_KEYS = ("wood", "stone", "water")
ZONE_ORDER = ("river", "forest", "dam")
BASE_ZONE_CAPS = {"river": 2, "forest": 3, "dam": 2}
ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ROOM_CODE_LEN = 6


def _now() -> float:
    return time.time()


def _sanitize_name(value: Any) -> str:
    cleaned = str(value or "").strip()
    cleaned = " ".join(cleaned.split())
    if not cleaned:
        return "Beaver"
    return cleaned[:24]


def _normalize_room_code(value: Any) -> str:
    raw = str(value or "").upper()
    return "".join(ch for ch in raw if ch in string.ascii_uppercase + string.digits)[:8]


def _other_side(side: str) -> str:
    return "p2" if side == "p1" else "p1"


class MultiplayerManager:
    def __init__(self) -> None:
        self._rooms: dict[str, dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._waiting_ttl = 6 * 60 * 60
        self._ended_ttl = 8 * 60 * 60

    def _ok(self, payload: dict[str, Any], status: int = 200) -> dict[str, Any]:
        return {"ok": True, "httpStatus": status, **payload}

    def _fail(self, error: str, status: int = 400) -> dict[str, Any]:
        return {"ok": False, "httpStatus": status, "error": error}

    def _room_code_locked(self) -> str:
        for _ in range(40):
            code = "".join(random.choice(ROOM_CODE_ALPHABET) for _ in range(ROOM_CODE_LEN))
            if code not in self._rooms:
                return code
        raise RuntimeError("Unable to allocate room code")

    def _cleanup_locked(self) -> None:
        now = _now()
        stale = []
        for code, room in self._rooms.items():
            age = now - float(room.get("updatedAt", now))
            status = room.get("status", "waiting")
            if status == "waiting" and age > self._waiting_ttl:
                stale.append(code)
            if status == "ended" and age > self._ended_ttl:
                stale.append(code)
        for code in stale:
            self._rooms.pop(code, None)

    def _touch_locked(self, room: dict[str, Any]) -> None:
        room["updatedAt"] = _now()
        room["revision"] = int(room.get("revision", 0)) + 1

    def _find_side_by_token_locked(self, room: dict[str, Any], token: str) -> str | None:
        for side in ("p1", "p2"):
            player = room["players"].get(side)
            if player and player.get("token") == token:
                return side
        return None

    def _snapshot_locked(self, room: dict[str, Any], side: str) -> dict[str, Any]:
        opponent_side = _other_side(side)
        opponent = room["players"].get(opponent_side)
        status = room.get("status", "waiting")

        can_start = (
            side == "p1"
            and room["players"].get("p2") is not None
            and status in {"waiting", "ended"}
        )
        message = ""
        if status == "waiting":
            if room["players"].get("p2"):
                message = "Both players connected. Host can start."
            else:
                message = f"Room {room['roomCode']} waiting for second player."
        elif status == "active":
            message = "Live multiplayer match in progress."
        elif status == "ended":
            message = "Match ended. Host can press Rematch."

        snapshot = {
            "roomCode": room["roomCode"],
            "status": status,
            "revision": room.get("revision", 0),
            "side": side,
            "isHost": side == "p1",
            "canStart": can_start,
            "opponent": opponent["name"] if opponent else "",
            "message": message,
        }

        if status in {"active", "ended"} and room.get("game"):
            snapshot["game"] = self._orient_game(room["game"], side, room["roomCode"], room["players"])

        return snapshot

    def create_room(self, name: Any) -> dict[str, Any]:
        player_name = _sanitize_name(name)
        with self._lock:
            self._cleanup_locked()
            code = self._room_code_locked()
            token = secrets.token_urlsafe(24)
            room = {
                "roomCode": code,
                "status": "waiting",
                "createdAt": _now(),
                "updatedAt": _now(),
                "revision": 1,
                "players": {
                    "p1": {"name": player_name, "token": token},
                    "p2": None,
                },
                "game": None,
            }
            self._rooms[code] = room
            snapshot = self._snapshot_locked(room, "p1")

        return self._ok({"roomCode": code, "token": token, "side": "p1", "state": snapshot})

    def join_room(self, room_code: Any, name: Any) -> dict[str, Any]:
        code = _normalize_room_code(room_code)
        player_name = _sanitize_name(name)
        if not code:
            return self._fail("Room code is required.", 400)

        with self._lock:
            self._cleanup_locked()
            room = self._rooms.get(code)
            if room is None:
                return self._fail("Room not found.", 404)
            if room.get("players", {}).get("p2") is not None:
                return self._fail("Room already has two players.", 409)

            token = secrets.token_urlsafe(24)
            room["players"]["p2"] = {"name": player_name, "token": token}
            room["status"] = "waiting" if room.get("status") != "active" else room["status"]
            self._touch_locked(room)
            snapshot = self._snapshot_locked(room, "p2")

        return self._ok({"roomCode": code, "token": token, "side": "p2", "state": snapshot})

    def start_room(self, room_code: Any, token: Any, starter_cards: list[dict[str, Any]]) -> dict[str, Any]:
        code = _normalize_room_code(room_code)
        token_text = str(token or "")
        if not code or not token_text:
            return self._fail("Room code and token are required.", 400)
        if not starter_cards:
            return self._fail("Starter deck unavailable.", 500)

        with self._lock:
            self._cleanup_locked()
            room = self._rooms.get(code)
            if room is None:
                return self._fail("Room not found.", 404)
            side = self._find_side_by_token_locked(room, token_text)
            if side is None:
                return self._fail("Invalid room token.", 403)
            if side != "p1":
                return self._fail("Only the host can start the match.", 403)
            if room["players"].get("p2") is None:
                return self._fail("Need two players to start.", 409)
            if room.get("status") == "active" and room.get("game") and room["game"].get("phase") != "ended":
                return self._fail("Match already active.", 409)

            p1_name = room["players"]["p1"]["name"]
            p2_name = room["players"]["p2"]["name"]
            room["game"] = self._create_game(starter_cards, p1_name, p2_name)
            room["status"] = "active"
            self._touch_locked(room)
            snapshot = self._snapshot_locked(room, side)

        return self._ok({"state": snapshot, "roomCode": code, "side": side})

    def get_state(self, room_code: Any, token: Any) -> dict[str, Any]:
        code = _normalize_room_code(room_code)
        token_text = str(token or "")
        if not code or not token_text:
            return self._fail("Room code and token are required.", 400)

        with self._lock:
            self._cleanup_locked()
            room = self._rooms.get(code)
            if room is None:
                return self._fail("Room not found.", 404)
            side = self._find_side_by_token_locked(room, token_text)
            if side is None:
                return self._fail("Invalid room token.", 403)
            snapshot = self._snapshot_locked(room, side)

        return self._ok(snapshot)

    def play_card(self, room_code: Any, token: Any, instance_id: Any) -> dict[str, Any]:
        return self._with_action(room_code, token, lambda room, side: self._play_card(room, side, instance_id))

    def attack(self, room_code: Any, token: Any, attacker_id: Any, target_type: Any, target_id: Any) -> dict[str, Any]:
        return self._with_action(
            room_code,
            token,
            lambda room, side: self._attack(room, side, attacker_id, target_type, target_id),
        )

    def end_turn(self, room_code: Any, token: Any) -> dict[str, Any]:
        return self._with_action(room_code, token, self._end_turn)

    def _with_action(self, room_code: Any, token: Any, callback: Any) -> dict[str, Any]:
        code = _normalize_room_code(room_code)
        token_text = str(token or "")
        if not code or not token_text:
            return self._fail("Room code and token are required.", 400)

        with self._lock:
            self._cleanup_locked()
            room = self._rooms.get(code)
            if room is None:
                return self._fail("Room not found.", 404)
            side = self._find_side_by_token_locked(room, token_text)
            if side is None:
                return self._fail("Invalid room token.", 403)
            if room.get("status") != "active" or not room.get("game"):
                return self._fail("No active match in this room.", 409)

            ok, error = callback(room, side)
            if not ok:
                return self._fail(error, 400)

            game = room.get("game")
            if game and game.get("phase") == "ended":
                room["status"] = "ended"
            else:
                room["status"] = "active"
            self._touch_locked(room)
            snapshot = self._snapshot_locked(room, side)

        return self._ok({"state": snapshot})

    def _create_game(self, starter_cards: list[dict[str, Any]], p1_name: str, p2_name: str) -> dict[str, Any]:
        game: dict[str, Any] = {
            "phase": "active",
            "outcome": "",
            "turn": 0,
            "active": "p1",
            "players": {"p1": p1_name, "p2": p2_name},
            "instanceSeed": 1,
            "health": {"p1": 30, "p2": 30},
            "mana": {"p1": 0, "p2": 0},
            "maxMana": {"p1": 0, "p2": 0},
            "fatigue": {"p1": 0, "p2": 0},
            "maxHand": {"p1": 10, "p2": 10},
            "zoneCaps": copy.deepcopy(BASE_ZONE_CAPS),
            "battleResources": {
                "p1": {"wood": 0, "stone": 0, "water": 0},
                "p2": {"wood": 0, "stone": 0, "water": 0},
            },
            "decks": {"p1": [], "p2": []},
            "hands": {"p1": [], "p2": []},
            "boards": {"p1": [], "p2": []},
            "log": [f"Multiplayer duel started: {p1_name} vs {p2_name}."],
        }

        game["decks"]["p1"] = self._build_deck(game, starter_cards)
        game["decks"]["p2"] = self._build_deck(game, starter_cards)
        self._draw_cards(game, "p1", 3, log_draw=False)
        self._draw_cards(game, "p2", 3, log_draw=False)
        self._start_turn(game, "p1")
        return game

    def _next_instance_id(self, game: dict[str, Any]) -> int:
        game["instanceSeed"] = int(game.get("instanceSeed", 1)) + 1
        return game["instanceSeed"]

    def _build_deck(self, game: dict[str, Any], templates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        deck = [self._clone_card(game, card) for card in templates]
        random.shuffle(deck)
        return deck

    def _clone_card(self, game: dict[str, Any], card: dict[str, Any]) -> dict[str, Any]:
        cloned = {key: copy.deepcopy(value) for key, value in card.items() if key != "instanceId"}
        keywords = cloned.get("keywords", [])
        cloned["keywords"] = list(keywords) if isinstance(keywords, list) else []
        cloned["instanceId"] = self._next_instance_id(game)
        return cloned

    def _push_log(self, game: dict[str, Any], message: str) -> None:
        entries = game.setdefault("log", [])
        entries.append(message)
        if len(entries) > 120:
            game["log"] = entries[-120:]

    def _has_keyword(self, entry: dict[str, Any], keyword: str) -> bool:
        keywords = entry.get("keywords", [])
        if not isinstance(keywords, list):
            return False
        needle = keyword.lower()
        return any(str(item).lower() == needle for item in keywords)

    def _attacks_per_turn(self, minion: dict[str, Any]) -> int:
        return 2 if self._has_keyword(minion, "fury") else 1

    def _refresh_board(self, board: list[dict[str, Any]]) -> None:
        for minion in board:
            if minion.get("summoningSickness"):
                minion["summoningSickness"] = False
                minion["attacksRemaining"] = 0
                minion["canAttack"] = False
            else:
                attacks = self._attacks_per_turn(minion)
                minion["attacksRemaining"] = attacks
                minion["canAttack"] = attacks > 0 and int(minion.get("currentHealth", 0)) > 0

    def _draw_cards(self, game: dict[str, Any], side: str, count: int, log_draw: bool = True) -> None:
        deck = game["decks"][side]
        hand = game["hands"][side]
        max_hand = int(game["maxHand"][side])
        owner = "You" if side == "p1" else "Opponent"
        health_key = "p1" if side == "p1" else "p2"

        for _ in range(count):
            if len(deck) == 0:
                game["fatigue"][side] = int(game["fatigue"][side]) + 1
                fatigue = int(game["fatigue"][side])
                game["health"][health_key] = int(game["health"][health_key]) - fatigue
                self._push_log(game, f"{owner} take {fatigue} fatigue damage.")
                continue
            card = deck.pop(0)
            if len(hand) >= max_hand:
                self._push_log(game, f"{owner}'s hand is full. {card['name']} is discarded.")
                continue
            hand.append(card)
            if log_draw:
                self._push_log(game, f"{owner} drew a card.")

    def _heal_hero(self, game: dict[str, Any], side: str, amount: int) -> None:
        game["health"][side] = min(60, int(game["health"][side]) + int(amount))

    def _damage_hero(self, game: dict[str, Any], side: str, amount: int) -> None:
        game["health"][side] = int(game["health"][side]) - int(amount)

    def _apply_river_restoration(self, game: dict[str, Any], side: str) -> None:
        board = game["boards"][side]
        restored = 0
        for minion in board:
            if minion.get("zone") != "river":
                continue
            before = int(minion.get("currentHealth", 0))
            max_hp = int(minion.get("maxHealth", before))
            minion["currentHealth"] = min(max_hp, before + 1)
            if int(minion["currentHealth"]) > before:
                restored += 1
        if restored > 0:
            owner = "Your" if side == "p1" else "Opponent's"
            suffix = "" if restored == 1 else "s"
            self._push_log(game, f"{owner} river lane restores {restored} minion{suffix}.")

    def _gather_resources(self, game: dict[str, Any], side: str) -> None:
        board = game["boards"][side]
        totals = {"wood": 0, "stone": 0, "water": 0}
        occupied = set()
        for minion in board:
            totals["wood"] += int(minion.get("woodYield", 0))
            totals["stone"] += int(minion.get("stoneYield", 0))
            totals["water"] += int(minion.get("waterYield", 0))
            zone = minion.get("zone")
            if zone in ZONE_ORDER:
                occupied.add(zone)
        if "forest" in occupied:
            totals["wood"] += 1
        if "dam" in occupied:
            totals["stone"] += 1
        if "river" in occupied:
            totals["water"] += 1

        for key in RESOURCE_KEYS:
            game["battleResources"][side][key] += totals[key]

        if totals["wood"] + totals["stone"] + totals["water"] > 0:
            owner = "You" if side == "p1" else "Opponent"
            self._push_log(
                game,
                f"{owner} gather resources: Wood {totals['wood']} | Stone {totals['stone']} | Water {totals['water']}.",
            )

        heal = totals["water"] // 2
        if heal > 0:
            self._heal_hero(game, side, heal)
            owner = "Your" if side == "p1" else "Opponent's"
            self._push_log(game, f"{owner} water flow restores {heal} hero Health.")

    def _start_turn(self, game: dict[str, Any], side: str) -> None:
        if game.get("phase") == "ended":
            return

        if side == "p1":
            game["turn"] = int(game.get("turn", 0)) + 1
        game["active"] = side

        game["maxMana"][side] = min(10, int(game["maxMana"][side]) + 1)
        game["mana"][side] = int(game["maxMana"][side])

        self._refresh_board(game["boards"][side])
        self._apply_river_restoration(game, side)
        self._draw_cards(game, side, 1, log_draw=True)
        self._gather_resources(game, side)
        owner = game["players"]["p1"] if side == "p1" else game["players"]["p2"]
        self._push_log(game, f"Turn {game['turn']}: {owner}'s action phase.")
        self._check_game_end(game)

    def _count_zone(self, board: list[dict[str, Any]], zone: str) -> int:
        return sum(1 for entry in board if entry.get("zone") == zone)

    def _choose_zone_for_summon(self, game: dict[str, Any], side: str, habitat: str) -> str | None:
        board = game["boards"][side]
        caps = game["zoneCaps"]
        preferred = list(ZONE_ORDER)
        if habitat in ZONE_ORDER:
            preferred = [habitat] + [zone for zone in ZONE_ORDER if zone != habitat]
        for zone in preferred:
            if self._count_zone(board, zone) < int(caps.get(zone, 0)):
                return zone
        return None

    def _has_board_space(self, game: dict[str, Any], side: str, habitat: str | None = None) -> bool:
        return self._choose_zone_for_summon(game, side, habitat or "any") is not None

    def _apply_lifesteal(self, game: dict[str, Any], side: str, source: dict[str, Any], damage: int) -> None:
        if damage <= 0:
            return
        if not self._has_keyword(source, "lifesteal"):
            return
        self._heal_hero(game, side, damage)
        self._push_log(game, f"{source['name']} lifesteals {damage} Health.")

    def _consume_attack(self, minion: dict[str, Any]) -> None:
        left = int(minion.get("attacksRemaining", 0)) - 1
        minion["attacksRemaining"] = max(0, left)
        minion["canAttack"] = minion["attacksRemaining"] > 0 and int(minion.get("currentHealth", 0)) > 0

    def _cleanup_dead(self, game: dict[str, Any]) -> None:
        removed: list[str] = []
        for side in ("p1", "p2"):
            alive = []
            for minion in game["boards"][side]:
                if int(minion.get("currentHealth", 0)) <= 0:
                    removed.append(str(minion.get("name", "Minion")))
                else:
                    alive.append(minion)
            game["boards"][side] = alive
        for name in removed:
            self._push_log(game, f"{name} is destroyed.")

    def _summon_tokens(self, game: dict[str, Any], side: str, count: int) -> None:
        for _ in range(max(0, int(count))):
            zone = self._choose_zone_for_summon(game, side, "forest")
            if not zone:
                return
            token = {
                "id": 0,
                "slug": "builder_kit_token",
                "name": "Builder Kit",
                "description": "A tiny worker token.",
                "cardType": "minion",
                "rarity": "common",
                "school": "Lumber",
                "cost": 1,
                "attack": 1,
                "health": 1,
                "effectOnPlay": "",
                "effectValue": 0,
                "keywords": ["token"],
                "habitat": "forest",
                "woodYield": 1,
                "stoneYield": 0,
                "waterYield": 0,
                "paletteStart": "#d7f5b9",
                "paletteEnd": "#4ea165",
                "accent": "#ebffd8",
                "starterCopies": 0,
                "instanceId": self._next_instance_id(game),
                "zone": zone,
                "maxHealth": 1,
                "currentAttack": 1,
                "currentHealth": 1,
                "canAttack": False,
                "attacksRemaining": 0,
                "summoningSickness": True,
                "isToken": True,
            }
            game["boards"][side].append(token)

    def _apply_effect(self, game: dict[str, Any], side: str, effect: str, value: int, source_name: str) -> None:
        opponent = _other_side(side)
        owner = "You" if side == "p1" else "Opponent"
        target_owner = "you" if opponent == "p1" else "opponent hero"
        amount = int(value or 0)

        if effect == "damage_enemy_hero":
            self._damage_hero(game, opponent, amount)
            self._push_log(game, f"{source_name} deals {amount} damage to {target_owner}.")
            return
        if effect == "heal_friendly_hero":
            self._heal_hero(game, side, amount)
            self._push_log(game, f"{source_name} restores {amount} Health to {owner.lower()}.")
            return
        if effect == "damage_all_enemy_minions":
            for minion in game["boards"][opponent]:
                minion["currentHealth"] = int(minion.get("currentHealth", 0)) - amount
            self._push_log(game, f"{source_name} hits all enemy minions for {amount}.")
            return
        if effect == "buff_random_friendly_minion":
            allies = game["boards"][side]
            if not allies:
                self._push_log(game, f"{source_name} fizzles with no friendly minion.")
                return
            target = random.choice(allies)
            target["currentAttack"] = int(target.get("currentAttack", 0)) + amount
            target["maxHealth"] = int(target.get("maxHealth", 0)) + amount
            target["currentHealth"] = int(target.get("currentHealth", 0)) + amount
            self._push_log(game, f"{source_name} buffs {target['name']} by +{amount}/+{amount}.")
            return
        if effect == "damage_random_enemy_minion":
            enemies = game["boards"][opponent]
            if not enemies:
                self._push_log(game, f"{source_name} has no minion target.")
                return
            target = random.choice(enemies)
            target["currentHealth"] = int(target.get("currentHealth", 0)) - amount
            self._push_log(game, f"{source_name} hits {target['name']} for {amount}.")
            return
        if effect == "draw_cards":
            self._draw_cards(game, side, amount, log_draw=False)
            self._push_log(game, f"{owner} {'draw' if side == 'p1' else 'draws'} {amount} card{'s' if amount != 1 else ''}.")
            return
        if effect == "summon_wisp":
            self._summon_tokens(game, side, amount)
            self._push_log(game, f"{source_name} summons {amount} Builder Kit{'s' if amount != 1 else ''}.")
            return

    def _check_game_end(self, game: dict[str, Any]) -> bool:
        if game.get("phase") == "ended":
            return True

        p1 = int(game["health"]["p1"])
        p2 = int(game["health"]["p2"])
        if p1 <= 0 and p2 <= 0:
            game["phase"] = "ended"
            game["outcome"] = "draw"
            game["active"] = ""
            self._push_log(game, "Both colonies collapse at once. Draw.")
            return True
        if p1 <= 0:
            game["phase"] = "ended"
            game["outcome"] = "p2"
            game["active"] = ""
            self._push_log(game, "Player 2 wins the multiplayer duel.")
            return True
        if p2 <= 0:
            game["phase"] = "ended"
            game["outcome"] = "p1"
            game["active"] = ""
            self._push_log(game, "Player 1 wins the multiplayer duel.")
            return True
        return False

    def _play_card(self, room: dict[str, Any], side: str, instance_id: Any) -> tuple[bool, str]:
        game = room.get("game")
        if not game or game.get("phase") == "ended":
            return False, "Match has ended."
        if game.get("active") != side:
            return False, "Not your turn."

        try:
            target_id = int(instance_id)
        except (TypeError, ValueError):
            return False, "Invalid card reference."

        hand = game["hands"][side]
        card = next((entry for entry in hand if int(entry.get("instanceId", -1)) == target_id), None)
        if not card:
            return False, "Card not in hand."
        cost = int(card.get("cost", 0))
        if cost > int(game["mana"][side]):
            return False, "Not enough mana."

        summon_zone = None
        if card.get("cardType") == "minion":
            summon_zone = self._choose_zone_for_summon(game, side, str(card.get("habitat", "any")))
            if not summon_zone:
                return False, "No habitat slot available."

        hand.remove(card)
        game["mana"][side] = int(game["mana"][side]) - cost
        owner = "You" if side == "p1" else "Opponent"

        if card.get("cardType") == "minion":
            minion = copy.deepcopy(card)
            minion["zone"] = summon_zone
            minion["maxHealth"] = int(card.get("health", 0))
            minion["currentAttack"] = int(card.get("attack", 0))
            minion["currentHealth"] = int(card.get("health", 0))
            minion["canAttack"] = False
            minion["attacksRemaining"] = 0
            minion["summoningSickness"] = True
            game["boards"][side].append(minion)
            self._push_log(game, f"{owner} summoned {card['name']} in {summon_zone.capitalize()}.")
        else:
            self._push_log(game, f"{owner} cast {card['name']}.")

        effect = str(card.get("effectOnPlay", ""))
        if effect:
            self._apply_effect(game, side, effect, int(card.get("effectValue", 0)), str(card.get("name", "Card")))

        self._cleanup_dead(game)
        self._check_game_end(game)
        return True, ""

    def _legal_targets(self, game: dict[str, Any], attacker_side: str) -> tuple[bool, set[int]]:
        defender = _other_side(attacker_side)
        board = game["boards"][defender]
        guards = [
            minion
            for minion in board
            if self._has_keyword(minion, "guard") or self._has_keyword(minion, "defender")
        ]
        if guards:
            return False, {int(minion["instanceId"]) for minion in guards}
        return True, {int(minion["instanceId"]) for minion in board}

    def _attack(
        self,
        room: dict[str, Any],
        side: str,
        attacker_id: Any,
        target_type: Any,
        target_id: Any,
    ) -> tuple[bool, str]:
        game = room.get("game")
        if not game or game.get("phase") == "ended":
            return False, "Match has ended."
        if game.get("active") != side:
            return False, "Not your turn."

        try:
            attacker_ref = int(attacker_id)
        except (TypeError, ValueError):
            return False, "Invalid attacker."
        attacker = next(
            (entry for entry in game["boards"][side] if int(entry.get("instanceId", -1)) == attacker_ref),
            None,
        )
        if not attacker or not attacker.get("canAttack"):
            return False, "Attacker is not ready."

        can_hit_hero, legal_minions = self._legal_targets(game, side)
        opponent = _other_side(side)
        owner = "Your" if side == "p1" else "Opponent's"

        if str(target_type) == "hero":
            if not can_hit_hero:
                return False, "Guard minions must be attacked first."
            damage = max(0, int(attacker.get("currentAttack", 0)))
            self._damage_hero(game, opponent, damage)
            self._push_log(game, f"{owner} {attacker['name']} hits hero for {damage}.")
            self._apply_lifesteal(game, side, attacker, damage)
            self._consume_attack(attacker)
            self._check_game_end(game)
            return True, ""

        try:
            target_ref = int(target_id)
        except (TypeError, ValueError):
            return False, "Invalid target."
        if target_ref not in legal_minions:
            return False, "Target is not legal."

        defender = next(
            (entry for entry in game["boards"][opponent] if int(entry.get("instanceId", -1)) == target_ref),
            None,
        )
        if not defender:
            return False, "Target no longer exists."

        damage_to_target = max(0, int(attacker.get("currentAttack", 0)))
        damage_to_attacker = max(0, int(defender.get("currentAttack", 0)))
        target_health_before = max(0, int(defender.get("currentHealth", 0)))
        attacker_health_before = max(0, int(attacker.get("currentHealth", 0)))

        defender["currentHealth"] = int(defender.get("currentHealth", 0)) - damage_to_target
        attacker["currentHealth"] = int(attacker.get("currentHealth", 0)) - damage_to_attacker

        if damage_to_target > 0 and self._has_keyword(attacker, "poisonous"):
            defender["currentHealth"] = 0
            self._push_log(game, f"{attacker['name']}'s poisonous bite destroys {defender['name']}.")
        if damage_to_attacker > 0 and self._has_keyword(defender, "poisonous"):
            attacker["currentHealth"] = 0
            self._push_log(game, f"{defender['name']}'s poisonous counter destroys {attacker['name']}.")

        self._apply_lifesteal(game, side, attacker, min(damage_to_target, target_health_before))
        self._apply_lifesteal(game, opponent, defender, min(damage_to_attacker, attacker_health_before))
        self._consume_attack(attacker)

        self._push_log(
            game,
            f"{owner} {attacker['name']} trades with {'your' if side == 'p2' else 'opponent'} {defender['name']}.",
        )
        self._cleanup_dead(game)
        self._check_game_end(game)
        return True, ""

    def _end_turn(self, room: dict[str, Any], side: str) -> tuple[bool, str]:
        game = room.get("game")
        if not game or game.get("phase") == "ended":
            return False, "Match has ended."
        if game.get("active") != side:
            return False, "Not your turn."
        self._start_turn(game, _other_side(side))
        return True, ""

    def _orient_game(
        self,
        game: dict[str, Any],
        side: str,
        room_code: str,
        players: dict[str, Any],
    ) -> dict[str, Any]:
        opponent = _other_side(side)
        phase = "ended"
        if game.get("phase") != "ended":
            phase = "player" if game.get("active") == side else "enemy"

        outcome = ""
        if game.get("phase") == "ended":
            if game.get("outcome") == "draw":
                outcome = "draw"
            elif game.get("outcome") == side:
                outcome = "victory"
            else:
                outcome = "defeat"

        p1_name = players.get("p1", {}).get("name", "Host")
        p2_name = players.get("p2", {}).get("name", "Guest")
        subtitle = f"{p1_name} vs {p2_name}"
        enemy_name = players.get(opponent, {}).get("name", "Opponent")

        return {
            "level": {
                "id": 0,
                "name": f"Multiplayer Room {room_code}",
                "subtitle": subtitle,
                "enemyHero": enemy_name,
                "aiDifficulty": 0,
                "intro": "Online multiplayer duel.",
            },
            "turn": int(game.get("turn", 1)),
            "phase": phase,
            "outcome": outcome,
            "playerHealth": int(game["health"][side]),
            "enemyHealth": int(game["health"][opponent]),
            "maxPlayerMana": int(game["maxMana"][side]),
            "playerMana": int(game["mana"][side]),
            "maxEnemyMana": int(game["maxMana"][opponent]),
            "enemyMana": int(game["mana"][opponent]),
            "playerFatigue": int(game["fatigue"][side]),
            "enemyFatigue": int(game["fatigue"][opponent]),
            "maxPlayerHand": int(game["maxHand"][side]),
            "maxEnemyHand": int(game["maxHand"][opponent]),
            "zoneCaps": copy.deepcopy(game["zoneCaps"]),
            "playerBattleResources": copy.deepcopy(game["battleResources"][side]),
            "playerHand": copy.deepcopy(game["hands"][side]),
            "enemyHand": [],
            "playerBoard": copy.deepcopy(game["boards"][side]),
            "enemyBoard": copy.deepcopy(game["boards"][opponent]),
            "log": copy.deepcopy(game.get("log", [])),
        }
