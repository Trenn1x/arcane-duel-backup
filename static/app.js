const PROFILE_STORE_KEY = "beaverforgeProfileStoreV1";
const LEGACY_PROGRESS_KEY = "beaverforgeProgressV1";
const LEGACY_DAM_KEY = "beaverforgeDamProfileV1";
const LEGACY_TUTORIAL_KEY = "beaverforgeTutorialSeenV1";
const SETTINGS_KEY = "beaverforgeSettingsV1";
const PROFILE_NAME_MAX = 24;

const TURN_PACE_MULTIPLIER = {
  calm: 1.2,
  normal: 1,
  swift: 0.72,
};

const AUDIO_BASE_LEVELS = {
  master: 0.9,
  sfx: 0.52,
  music: 0.46,
};

const BASE_MAX_HAND = 10;
const BASE_ZONE_CAPACITY = {
  river: 2,
  forest: 3,
  dam: 2,
};

const RESOURCE_KEYS = ["wood", "stone", "water"];
const ZONE_ORDER = ["river", "forest", "dam"];

const ZONE_META = {
  river: {
    label: "River Channel",
    short: "River",
    bonus: "Restores and boosts Water output.",
  },
  forest: {
    label: "Forest Shelf",
    short: "Forest",
    bonus: "Adds bonus Wood gathering.",
  },
  dam: {
    label: "Dam Face",
    short: "Dam",
    bonus: "Adds bonus Stone gathering.",
  },
};

const ECONOMY = {
  startingResources: { wood: 14, stone: 10, water: 8 },
  upgradeGrowth: 0.42,
  forgeGrowth: 0.55,
  zoneBonus: { forest: 1, dam: 1, river: 1 },
  waterHealPer: 2,
  defeatPayoutMultiplier: 0.55,
  defeatFloor: { wood: 2, stone: 1, water: 1 },
};

const KEYWORD_LABELS = {
  guard: "Guard",
  defender: "Defender",
  fury: "Fury",
  poisonous: "Poisonous",
  lifesteal: "Lifesteal",
};

const KEYWORD_DESCRIPTIONS = {
  guard: "Must be attacked before non-Guard enemy minions or the enemy hero.",
  defender: "Must be attacked before non-Defender enemy minions or the enemy hero.",
  fury: "Can attack twice each turn once ready.",
  poisonous: "Any combat damage this minion deals destroys other minions.",
  lifesteal: "Damage dealt by this minion restores its hero for the same amount.",
};

const TUTORIAL_STEPS = [
  {
    title: "Habitat Board Basics",
    text: "The board has three habitats: River, Forest, and Dam. Minions prefer specific habitats and each habitat changes gathering output.",
    fact: "Fact: Beaver dams reshape streams into complex wetland zones, creating multiple micro-habitats.",
    objective: "Objective: Track where each minion is placed. Habitat fit drives your economy.",
    hint: "Why it matters: A balanced colony across habitats performs better than a single-lane swarm.",
    selector: "#player-board",
  },
  {
    title: "Wood Is Your Build Fuel",
    text: "Forest workers generate wood every turn. Wood is spent in the Dam Workshop to unlock long-term upgrades.",
    fact: "Fact: Beaver incisors never stop growing, which helps them continuously cut trees for construction.",
    objective: "Objective: Keep at least one worker in Forest whenever possible.",
    hint: "Why it matters: Most early workshop upgrades are wood-heavy.",
    selector: "#battle-wood",
  },
  {
    title: "Stone Supports The Dam",
    text: "Dam-lane workers create stone (and mud) income. Stone is needed for structural upgrades and durable deck improvements.",
    fact: "Fact: Real beavers anchor dams with mud, sticks, and heavy materials to resist current pressure.",
    objective: "Objective: Add Dam-lane units before harder levels to keep stone income stable.",
    hint: "Why it matters: Stone unlocks survivability upgrades and tougher forged cards.",
    selector: "#battle-stone",
  },
  {
    title: "Water Restores",
    text: "River activity and water-focused units provide restoration. Water turns are key for survival and control.",
    fact: "Fact: Beaver ponds stabilize water levels and improve resilience for surrounding ecosystems.",
    objective: "Objective: Plan for water breakpoints to trigger hero restoration.",
    hint: "Why it matters: Water converts economy into sustain during long fights.",
    selector: "#battle-water",
  },
  {
    title: "Combat Targeting Rules",
    text: "Select a friendly attacker, then target an enemy. Guard/Defender units must be attacked first. Fury units can attack twice.",
    fact: "Fact: Beavers defend lodges and resources with coordinated territorial behavior.",
    objective: "Objective: Remove Guard units first, then push direct hero damage.",
    hint: "Why it matters: Correct target order often decides tempo.",
    selector: "#selected-attacker-text",
  },
  {
    title: "Dam Workshop",
    text: "Between fights, enter the Dam Workshop to spend resources on permanent upgrades and add stronger cards to your deck.",
    fact: "Fact: Beaver colonies constantly maintain and expand structures rather than building once.",
    objective: "Objective: After each battle, spend at least one purchase in the workshop.",
    hint: "Why it matters: Deck growth and upgrades are your long-term power curve.",
    selector: ".resources-panel",
  },
  {
    title: "Auto-End Turn",
    text: "If no legal actions remain, your turn auto-ends with a distinct tone so battles keep pace.",
    fact: "Fact: Beavers are highly efficient workers and avoid wasting energy on nonproductive tasks.",
    objective: "Objective: Listen for the auto-end chime when no actions remain.",
    hint: "Why it matters: Faster turn cycling keeps economy and combat flowing.",
    selector: "#end-turn-btn",
  },
  {
    title: "Read The Log",
    text: "The battle log explains gathering, restoration, and habitat effects each turn so strategy remains transparent.",
    fact: "Fact: Beaver engineering can alter water flow across entire local landscapes.",
    objective: "Objective: Use the log to verify why a turn changed health/resources.",
    hint: "Why it matters: The log is the fastest way to debug your strategy.",
    selector: "#battle-log",
  },
];

const DAM_UPGRADES = [
  {
    id: "reinforcedWalls",
    name: "Reinforced Dam Walls",
    maxLevel: 3,
    baseCost: { wood: 12, stone: 8, water: 4 },
    description: "+2 starting colony Health per level.",
  },
  {
    id: "timberYard",
    name: "Timber Yard",
    maxLevel: 3,
    baseCost: { wood: 8, stone: 5, water: 2 },
    description: "+1 Wood gathered each player turn per level.",
  },
  {
    id: "stoneWeir",
    name: "Stone Weir",
    maxLevel: 3,
    baseCost: { wood: 7, stone: 7, water: 2 },
    description: "+1 Stone gathered each player turn per level.",
  },
  {
    id: "riverSluice",
    name: "River Sluice",
    maxLevel: 3,
    baseCost: { wood: 7, stone: 5, water: 6 },
    description: "+1 Water gathered each player turn per level.",
  },
  {
    id: "damBastion",
    name: "Dam Bastion",
    maxLevel: 1,
    baseCost: { wood: 17, stone: 13, water: 7 },
    description: "+1 Dam-lane board slot and +1 Health to minions summoned there.",
  },
  {
    id: "deckSatchel",
    name: "Deck Satchel",
    maxLevel: 2,
    baseCost: { wood: 10, stone: 7, water: 6 },
    description: "+1 starting hand and +1 max hand size per level.",
  },
];

const DECK_FORGE_OPTIONS = [
  {
    slug: "master_damwright",
    maxCopies: 2,
    baseCost: { wood: 14, stone: 11, water: 7 },
  },
  {
    slug: "quarry_forebeaver",
    maxCopies: 2,
    baseCost: { wood: 10, stone: 14, water: 5 },
  },
  {
    slug: "torrent_release",
    maxCopies: 2,
    baseCost: { wood: 13, stone: 9, water: 10 },
  },
  {
    slug: "great_lodge_elder",
    maxCopies: 2,
    baseCost: { wood: 12, stone: 8, water: 11 },
  },
  {
    slug: "iron_tooth_matriarch",
    maxCopies: 1,
    baseCost: { wood: 20, stone: 19, water: 13 },
  },
];

const MUSIC_PATTERNS = {
  menu: {
    bpm: 90,
    root: 220,
    lead: [0, 7, 10, 7, 5, 7, 12, 10, 7, 5, 3, 5, 7, 10, 12, 10],
    bass: [0, -5, -3, -7],
    intensity: 0.11,
  },
  dam: {
    bpm: 84,
    root: 196,
    lead: [0, 3, 5, 7, 5, 3, 0, 2, 3, 5, 7, 10, 7, 5, 3, 2],
    bass: [0, -7, -5, -10],
    intensity: 0.1,
  },
  tutorial: {
    bpm: 72,
    root: 196,
    lead: [0, 3, 7, 3, 0, 5, 7, 10, 7, 5, 3, 5, 7, 5, 3, 0],
    bass: [0, -5, -2, -7],
    intensity: 0.1,
  },
  battle_player: {
    bpm: 126,
    root: 246.94,
    lead: [0, 7, 12, 10, 12, 14, 12, 10, 7, 10, 12, 14, 15, 14, 12, 10],
    bass: [0, -3, -5, -7],
    intensity: 0.15,
  },
  battle_enemy: {
    bpm: 126,
    root: 174.61,
    lead: [0, 3, 5, 3, 7, 5, 3, 2, 0, 3, 7, 10, 7, 5, 3, 2],
    bass: [0, -5, -7, -10],
    intensity: 0.16,
  },
  victory: {
    bpm: 108,
    root: 261.63,
    lead: [0, 4, 7, 12, 7, 12, 16, 19, 16, 12, 7, 4, 7, 12, 7, 4],
    bass: [0, -5, -3, -7],
    intensity: 0.14,
  },
  defeat: {
    bpm: 82,
    root: 196,
    lead: [0, -2, -5, -7, -5, -2, 0, 2, 0, -2, -5, -7, -5, -9, -12, -7],
    bass: [0, -7, -10, -12],
    intensity: 0.12,
  },
};

const initialProfileStore = normalizeProfileStore(loadProfileStore());

const state = {
  screen: "menu",
  levels: [],
  cardLibrary: [],
  cardsBySlug: {},
  starterDeck: [],
  profileStore: initialProfileStore,
  activeProfileId: initialProfileStore.activeProfileId,
  activeProfileName: "",
  profileStats: defaultProfileStats(),
  progress: defaultProgress(),
  damProfile: defaultDamProfile(),
  tutorialSeen: false,
  settings: loadSettings(),
  tutorial: {
    active: false,
    stepIndex: 0,
    highlightedNode: null,
  },
  audio: {
    context: null,
    masterGain: null,
    sfxGain: null,
    musicGain: null,
    musicInterval: null,
    musicStep: 0,
    desiredMode: "menu",
    activeMode: "off",
  },
  game: null,
  selectedAttackerId: null,
  autoEndTimer: null,
  instanceSeed: 1,
};

applyActiveProfileState();

const nodes = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheNodes();
  wireUi();
  window.addEventListener("pointerdown", primeAudio, { once: true });
  bootstrap().catch((error) => {
    console.error(error);
    alert("Failed to load game data from the local server.");
  });
});

function cacheNodes() {
  nodes.menuScreen = document.getElementById("menu-screen");
  nodes.damScreen = document.getElementById("dam-screen");
  nodes.gameScreen = document.getElementById("game-screen");

  nodes.levelGrid = document.getElementById("level-grid");
  nodes.starterDeckPreview = document.getElementById("starter-deck-preview");
  nodes.tutorialBtn = document.getElementById("tutorial-btn");
  nodes.openDamBtn = document.getElementById("open-dam-btn");
  nodes.openSettingsBtn = document.getElementById("open-settings-btn");
  nodes.resetProgressBtn = document.getElementById("reset-progress-btn");
  nodes.menuResourceSummary = document.getElementById("menu-resource-summary");
  nodes.profileSelect = document.getElementById("profile-select");
  nodes.profileCreateInput = document.getElementById("profile-create-input");
  nodes.profileCreateBtn = document.getElementById("profile-create-btn");
  nodes.profileDeleteBtn = document.getElementById("profile-delete-btn");
  nodes.profileStats = document.getElementById("profile-stats");

  nodes.damBackBtn = document.getElementById("dam-back-btn");
  nodes.damTutorialBtn = document.getElementById("dam-tutorial-btn");
  nodes.damWood = document.getElementById("dam-wood");
  nodes.damStone = document.getElementById("dam-stone");
  nodes.damWater = document.getElementById("dam-water");
  nodes.damUpgradeList = document.getElementById("dam-upgrade-list");
  nodes.damForgeList = document.getElementById("dam-forge-list");

  nodes.battleLevelName = document.getElementById("battle-level-name");
  nodes.battleLevelSubtitle = document.getElementById("battle-level-subtitle");
  nodes.enemyHeroName = document.getElementById("enemy-hero-name");
  nodes.enemyHealth = document.getElementById("enemy-health");
  nodes.enemyMana = document.getElementById("enemy-mana");
  nodes.playerHealth = document.getElementById("player-health");
  nodes.playerMana = document.getElementById("player-mana");
  nodes.turnCount = document.getElementById("turn-count");
  nodes.selectedAttackerText = document.getElementById("selected-attacker-text");
  nodes.enemyHeroPanel = document.getElementById("enemy-hero-panel");

  nodes.battleWood = document.getElementById("battle-wood");
  nodes.battleStone = document.getElementById("battle-stone");
  nodes.battleWater = document.getElementById("battle-water");

  nodes.enemyBoard = document.getElementById("enemy-board");
  nodes.playerBoard = document.getElementById("player-board");
  nodes.playerHand = document.getElementById("player-hand");
  nodes.battleLog = document.getElementById("battle-log");

  nodes.endTurnBtn = document.getElementById("end-turn-btn");
  nodes.surrenderBtn = document.getElementById("surrender-btn");
  nodes.backToMenuBtn = document.getElementById("back-to-menu-btn");

  nodes.resultOverlay = document.getElementById("result-overlay");
  nodes.resultTitle = document.getElementById("result-title");
  nodes.resultDescription = document.getElementById("result-description");
  nodes.retryLevelBtn = document.getElementById("retry-level-btn");
  nodes.returnMenuBtn = document.getElementById("return-menu-btn");

  nodes.tutorialOverlay = document.getElementById("tutorial-overlay");
  nodes.tutorialStep = document.getElementById("tutorial-step");
  nodes.tutorialProgressFill = document.getElementById("tutorial-progress-fill");
  nodes.tutorialTitle = document.getElementById("tutorial-title");
  nodes.tutorialText = document.getElementById("tutorial-text");
  nodes.tutorialObjective = document.getElementById("tutorial-objective");
  nodes.tutorialHint = document.getElementById("tutorial-hint");
  nodes.tutorialFact = document.getElementById("tutorial-fact");
  nodes.tutorialPrevBtn = document.getElementById("tutorial-prev-btn");
  nodes.tutorialNextBtn = document.getElementById("tutorial-next-btn");
  nodes.tutorialCloseBtn = document.getElementById("tutorial-close-btn");

  nodes.settingsOverlay = document.getElementById("settings-overlay");
  nodes.settingsPace = document.getElementById("settings-pace");
  nodes.settingsMaster = document.getElementById("settings-master");
  nodes.settingsMasterValue = document.getElementById("settings-master-value");
  nodes.settingsSfx = document.getElementById("settings-sfx");
  nodes.settingsSfxValue = document.getElementById("settings-sfx-value");
  nodes.settingsMusic = document.getElementById("settings-music");
  nodes.settingsMusicValue = document.getElementById("settings-music-value");
  nodes.settingsResetBtn = document.getElementById("settings-reset-btn");
  nodes.settingsCloseBtn = document.getElementById("settings-close-btn");
}

function wireUi() {
  const bind = (node, eventName, handler) => {
    if (!node) return;
    node.addEventListener(eventName, handler);
  };

  const hasProfileUi =
    Boolean(nodes.profileSelect) &&
    Boolean(nodes.profileCreateBtn) &&
    Boolean(nodes.profileCreateInput) &&
    Boolean(nodes.profileDeleteBtn);

  if (hasProfileUi) {
    nodes.profileSelect.addEventListener("change", () => {
      const selectedProfileId = nodes.profileSelect.value;
      const switched = switchActiveProfile(selectedProfileId, { confirmMatchExit: true });
      if (!switched) {
        nodes.profileSelect.value = state.activeProfileId;
        playInputTone("rejected");
        return;
      }
      playInputTone("registered");
      renderMenu();
    });

    nodes.profileCreateBtn.addEventListener("click", () => {
      const created = createProfile(nodes.profileCreateInput.value);
      if (!created.ok) {
        playInputTone("rejected");
        return;
      }
      nodes.profileCreateInput.value = "";
      playInputTone("registered");
      renderMenu();
    });

    nodes.profileCreateInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      nodes.profileCreateBtn.click();
    });

    nodes.profileDeleteBtn.addEventListener("click", () => {
      const deleted = deleteActiveProfile();
      playInputTone(deleted ? "registered" : "rejected");
      if (deleted) {
        renderMenu();
      }
    });
  } else {
    console.warn("Profile controls missing from DOM; continuing without profile panel wiring.");
  }

  bind(nodes.levelGrid, "click", (event) => {
    const button = event.target.closest("[data-start-level]");
    if (!button) return;
    primeAudio();
    const levelId = Number(button.dataset.startLevel);
    if (levelId > state.progress.unlocked) {
      playInputTone("rejected");
      return;
    }
    startLevel(levelId).catch((error) => {
      console.error(error);
      playInputTone("rejected");
    });
  });

  bind(nodes.tutorialBtn, "click", () => {
    primeAudio();
    startLevel(1, { forceTutorial: true }).catch((error) => {
      console.error(error);
      playInputTone("rejected");
    });
  });

  bind(nodes.openDamBtn, "click", () => {
    primeAudio();
    playInputTone("registered");
    renderDam();
    showScreen("dam");
  });

  bind(nodes.openSettingsBtn, "click", () => {
    openSettings();
  });

  bind(nodes.resetProgressBtn, "click", () => {
    const confirmed = window.confirm(`Reset all progress and workshop data for profile "${state.activeProfileName}"?`);
    if (!confirmed) {
      playInputTone("rejected");
      return;
    }
    playInputTone("registered");
    state.progress = defaultProgress();
    state.damProfile = defaultDamProfile();
    state.tutorialSeen = false;
    state.profileStats = defaultProfileStats();
    saveProgress();
    saveDamProfile();
    saveTutorialSeen();
    saveProfileStats();
    renderMenu();
  });

  bind(nodes.damBackBtn, "click", () => {
    playInputTone("registered");
    showScreen("menu");
    renderMenu();
  });

  bind(nodes.damTutorialBtn, "click", () => {
    primeAudio();
    startLevel(1, { forceTutorial: true, silentTone: true }).catch((error) => {
      console.error(error);
      playInputTone("rejected");
    });
  });

  bind(nodes.damUpgradeList, "click", (event) => {
    const button = event.target.closest("[data-upgrade-id]");
    if (!button) return;
    purchaseUpgrade(button.dataset.upgradeId);
  });

  bind(nodes.damForgeList, "click", (event) => {
    const button = event.target.closest("[data-forge-slug]");
    if (!button) return;
    purchaseForgeCard(button.dataset.forgeSlug);
  });

  bind(nodes.playerHand, "click", (event) => {
    const card = event.target.closest("[data-hand-id]");
    if (!card) return;
    if (state.tutorial.active) {
      playInputTone("rejected");
      return;
    }
    handlePlayerCardPlay(Number(card.dataset.handId));
  });

  bind(nodes.playerBoard, "click", (event) => {
    const button = event.target.closest("[data-attacker-id]");
    if (!button) return;
    if (state.tutorial.active) {
      playInputTone("rejected");
      return;
    }
    selectAttacker(Number(button.dataset.attackerId));
  });

  bind(nodes.enemyBoard, "click", (event) => {
    const target = event.target.closest("[data-target-id]");
    if (!target) return;
    if (state.tutorial.active) {
      playInputTone("rejected");
      return;
    }
    if (!state.selectedAttackerId) {
      playInputTone("rejected");
      return;
    }
    const success = performAttack("player", state.selectedAttackerId, "minion", Number(target.dataset.targetId));
    playInputTone(success ? "registered" : "rejected");
    renderGame();
  });

  bind(nodes.enemyHeroPanel, "click", () => {
    if (state.tutorial.active) {
      playInputTone("rejected");
      return;
    }
    if (!state.selectedAttackerId) {
      playInputTone("rejected");
      return;
    }
    const success = performAttack("player", state.selectedAttackerId, "hero");
    playInputTone(success ? "registered" : "rejected");
    renderGame();
  });

  bind(nodes.endTurnBtn, "click", () => {
    if (state.tutorial.active) {
      playInputTone("rejected");
      return;
    }
    executeEndTurn({ automatic: false });
  });

  bind(nodes.surrenderBtn, "click", () => {
    if (!state.game || state.game.phase === "ended") {
      playInputTone("rejected");
      return;
    }
    playInputTone("registered");
    finishGame(false, "Retreat", "You retreated from this colony challenge.");
    renderGame();
  });

  bind(nodes.backToMenuBtn, "click", () => {
    if (state.tutorial.active) {
      closeTutorial(false);
    }
    if (state.game && state.game.phase !== "ended") {
      const confirmed = window.confirm("Leave this match and return to menu?");
      if (!confirmed) {
        playInputTone("rejected");
        return;
      }
    }
    playInputTone("registered");
    state.game = null;
    state.selectedAttackerId = null;
    clearAutoEndTurnTimer();
    showScreen("menu");
    renderMenu();
  });

  bind(nodes.retryLevelBtn, "click", () => {
    if (!state.game) {
      playInputTone("rejected");
      return;
    }
    startLevel(state.game.level.id, { silentTone: true }).catch((error) => {
      console.error(error);
      playInputTone("rejected");
    });
  });

  bind(nodes.returnMenuBtn, "click", () => {
    playInputTone("registered");
    state.game = null;
    state.selectedAttackerId = null;
    hideResult();
    showScreen("menu");
    renderMenu();
  });

  bind(nodes.tutorialPrevBtn, "click", () => {
    if (!state.tutorial.active || state.tutorial.stepIndex <= 0) {
      playInputTone("rejected");
      return;
    }
    playInputTone("tutorial_step");
    state.tutorial.stepIndex -= 1;
    renderTutorialStep();
  });

  bind(nodes.tutorialNextBtn, "click", () => {
    if (!state.tutorial.active) {
      playInputTone("rejected");
      return;
    }
    if (state.tutorial.stepIndex >= TUTORIAL_STEPS.length - 1) {
      closeTutorial(true);
      return;
    }
    playInputTone("tutorial_step");
    state.tutorial.stepIndex += 1;
    renderTutorialStep();
  });

  bind(nodes.tutorialCloseBtn, "click", () => {
    if (!state.tutorial.active) {
      playInputTone("rejected");
      return;
    }
    closeTutorial(true);
  });

  bind(nodes.settingsCloseBtn, "click", () => {
    closeSettings();
  });

  bind(nodes.settingsResetBtn, "click", () => {
    state.settings = defaultSettings();
    saveSettings();
    renderSettings();
    applyAudioSettings();
    playInputTone("registered");
  });

  bind(nodes.settingsPace, "change", () => {
    state.settings.pace = nodes.settingsPace.value;
    saveSettings();
    renderSettings();
    playInputTone("registered");
  });

  const bindVolumeInput = (node, key) => {
    bind(node, "input", () => {
      state.settings[key] = Number(node.value);
      saveSettings();
      renderSettings();
      applyAudioSettings();
    });
  };

  bindVolumeInput(nodes.settingsMaster, "masterVolume");
  bindVolumeInput(nodes.settingsSfx, "sfxVolume");
  bindVolumeInput(nodes.settingsMusic, "musicVolume");

  bind(nodes.settingsOverlay, "click", (event) => {
    if (event.target === nodes.settingsOverlay) {
      closeSettings();
    }
  });

  bind(document, "keydown", (event) => {
    if (event.key.toLowerCase() === "o" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const activeTag = document.activeElement ? document.activeElement.tagName : "";
      if (activeTag !== "INPUT" && activeTag !== "SELECT" && activeTag !== "TEXTAREA") {
        event.preventDefault();
        if (nodes.settingsOverlay && !nodes.settingsOverlay.classList.contains("hidden")) {
          closeSettings();
        } else {
          openSettings();
        }
        return;
      }
    }

    if (event.key === "Escape" && nodes.settingsOverlay && !nodes.settingsOverlay.classList.contains("hidden")) {
      event.preventDefault();
      closeSettings();
      return;
    }

    if (!state.tutorial.active) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nodes.tutorialPrevBtn?.click();
      return;
    }
    if (event.key === "ArrowRight" || event.key === "Enter") {
      event.preventDefault();
      nodes.tutorialNextBtn?.click();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      nodes.tutorialCloseBtn?.click();
    }
  });
}

async function bootstrap() {
  const [levelsResponse, cardsResponse, starterResponse] = await Promise.all([
    fetchJson("/api/levels"),
    fetchJson("/api/cards"),
    fetchJson("/api/starter-deck"),
  ]);

  state.levels = levelsResponse.levels;
  state.cardLibrary = cardsResponse.cards;
  state.cardsBySlug = Object.fromEntries(state.cardLibrary.map((card) => [card.slug, card]));
  state.starterDeck = starterResponse.starterDeck;

  state.profileStore = normalizeProfileStore(state.profileStore, state.levels.length);
  state.activeProfileId = state.profileStore.activeProfileId;
  applyActiveProfileState();
  saveProfileStore();

  renderMenu();
  renderSettings();
  applyAudioSettings();
  setMusicMode("menu");
}

function defaultProgress() {
  return {
    unlocked: 1,
    wins: {},
  };
}

function defaultProfileStats() {
  return {
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
  };
}

function defaultSettings() {
  return {
    pace: "normal",
    masterVolume: 100,
    sfxVolume: 100,
    musicVolume: 100,
  };
}

function normalizeSettings(settings) {
  const baseline = defaultSettings();
  const clean = settings && typeof settings === "object" ? settings : baseline;

  const pace = Object.prototype.hasOwnProperty.call(TURN_PACE_MULTIPLIER, clean.pace) ? clean.pace : baseline.pace;
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  return {
    pace,
    masterVolume: clamp(clean.masterVolume),
    sfxVolume: clamp(clean.sfxVolume),
    musicVolume: clamp(clean.musicVolume),
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return normalizeSettings(JSON.parse(raw));
  } catch (_error) {
    return defaultSettings();
  }
}

function saveSettings() {
  try {
    state.settings = normalizeSettings(state.settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch (_error) {
    // Ignore storage failures in restricted/private sessions.
  }
}

function paceMs(ms) {
  const multiplier = TURN_PACE_MULTIPLIER[state.settings.pace] || TURN_PACE_MULTIPLIER.normal;
  return Math.max(40, Math.round(ms * multiplier));
}

function defaultProfileEntry(name = "Colony Alpha") {
  return {
    id: createProfileId(),
    name,
    createdAt: Date.now(),
    progress: defaultProgress(),
    damProfile: defaultDamProfile(),
    tutorialSeen: false,
    stats: defaultProfileStats(),
  };
}

function defaultProfileStore() {
  const profile = defaultProfileEntry();
  return {
    activeProfileId: profile.id,
    profiles: {
      [profile.id]: profile,
    },
  };
}

function createProfileId() {
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function sanitizeProfileName(rawName) {
  const text = String(rawName || "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  return text.slice(0, PROFILE_NAME_MAX);
}

function loadProfileStore() {
  try {
    const raw = localStorage.getItem(PROFILE_STORE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_error) {
    return defaultProfileStore();
  }

  const legacy = loadLegacyProfileData();
  if (legacy) {
    return legacy;
  }

  return defaultProfileStore();
}

function loadLegacyProfileData() {
  try {
    const progressRaw = localStorage.getItem(LEGACY_PROGRESS_KEY);
    const damRaw = localStorage.getItem(LEGACY_DAM_KEY);
    const tutorialRaw = localStorage.getItem(LEGACY_TUTORIAL_KEY);
    if (!progressRaw && !damRaw && tutorialRaw === null) return null;

    let progress = defaultProgress();
    let damProfile = defaultDamProfile();

    if (progressRaw) {
      try {
        progress = JSON.parse(progressRaw);
      } catch (_error) {
        progress = defaultProgress();
      }
    }

    if (damRaw) {
      try {
        damProfile = JSON.parse(damRaw);
      } catch (_error) {
        damProfile = defaultDamProfile();
      }
    }

    const profile = {
      ...defaultProfileEntry("Colony Alpha"),
      progress,
      damProfile,
      tutorialSeen: tutorialRaw === "1",
      stats: defaultProfileStats(),
    };

    return {
      activeProfileId: profile.id,
      profiles: {
        [profile.id]: profile,
      },
    };
  } catch (_error) {
    return null;
  }
}

function normalizeProgress(progress, maxLevel) {
  const clean = progress && typeof progress === "object" ? progress : defaultProgress();
  const unlocked = Number.isInteger(clean.unlocked) ? clean.unlocked : 1;
  const wins = {};
  if (clean.wins && typeof clean.wins === "object") {
    for (const [key, value] of Object.entries(clean.wins)) {
      if (value) {
        wins[key] = true;
      }
    }
  }
  return {
    unlocked: Math.min(Math.max(unlocked, 1), Math.max(maxLevel, 1)),
    wins,
  };
}

function defaultDamProfile() {
  return {
    resources: {
      ...ECONOMY.startingResources,
    },
    upgrades: {
      reinforcedWalls: 0,
      timberYard: 0,
      stoneWeir: 0,
      riverSluice: 0,
      damBastion: 0,
      deckSatchel: 0,
    },
    deckAdditions: {},
  };
}

function normalizeDamProfile(profile) {
  const baseline = defaultDamProfile();
  const clean = profile && typeof profile === "object" ? profile : baseline;

  const resources = { ...baseline.resources, ...(clean.resources || {}) };
  RESOURCE_KEYS.forEach((key) => {
    resources[key] = Math.max(0, Math.floor(Number(resources[key]) || 0));
  });

  const upgrades = { ...baseline.upgrades, ...(clean.upgrades || {}) };
  DAM_UPGRADES.forEach((entry) => {
    const value = Math.max(0, Math.floor(Number(upgrades[entry.id]) || 0));
    upgrades[entry.id] = Math.min(value, entry.maxLevel);
  });

  const deckAdditions = {};
  const rawDeck = clean.deckAdditions && typeof clean.deckAdditions === "object" ? clean.deckAdditions : {};
  for (const [slug, count] of Object.entries(rawDeck)) {
    const normalized = Math.max(0, Math.floor(Number(count) || 0));
    if (normalized > 0) {
      deckAdditions[slug] = normalized;
    }
  }

  return { resources, upgrades, deckAdditions };
}

function normalizeProfileStats(stats) {
  const clean = stats && typeof stats === "object" ? stats : {};
  const wins = Math.max(0, Math.floor(Number(clean.wins) || 0));
  const losses = Math.max(0, Math.floor(Number(clean.losses) || 0));
  const currentStreak = Math.max(0, Math.floor(Number(clean.currentStreak) || 0));
  const bestStreak = Math.max(currentStreak, Math.max(0, Math.floor(Number(clean.bestStreak) || 0)));
  const totalGames = Math.max(wins + losses, Math.floor(Number(clean.totalGames) || 0));

  return {
    wins,
    losses,
    currentStreak,
    bestStreak,
    totalGames,
  };
}

function normalizeProfileEntry(profileId, profile, maxLevel) {
  const baseline = defaultProfileEntry();
  const clean = profile && typeof profile === "object" ? profile : {};
  const name = sanitizeProfileName(clean.name) || "Colony";
  const createdAt = Number(clean.createdAt) || baseline.createdAt;

  return {
    id: profileId,
    name,
    createdAt,
    progress: normalizeProgress(clean.progress || baseline.progress, maxLevel),
    damProfile: normalizeDamProfile(clean.damProfile || baseline.damProfile),
    tutorialSeen: Boolean(clean.tutorialSeen),
    stats: normalizeProfileStats(clean.stats || baseline.stats),
  };
}

function normalizeProfileStore(store, maxLevel = Number.MAX_SAFE_INTEGER) {
  const clean = store && typeof store === "object" ? store : {};
  const sourceProfiles = clean.profiles && typeof clean.profiles === "object" ? clean.profiles : {};
  const profiles = {};

  for (const [profileId, profile] of Object.entries(sourceProfiles)) {
    if (typeof profileId !== "string" || !profileId.trim()) continue;
    profiles[profileId] = normalizeProfileEntry(profileId, profile, maxLevel);
  }

  if (Object.keys(profiles).length === 0) {
    return defaultProfileStore();
  }

  const preferredActive =
    typeof clean.activeProfileId === "string" && profiles[clean.activeProfileId]
      ? clean.activeProfileId
      : Object.keys(profiles)[0];

  return {
    activeProfileId: preferredActive,
    profiles,
  };
}

function saveProfileStore() {
  try {
    localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(state.profileStore));
  } catch (_error) {
    // Ignore storage write failures in private or restricted browser contexts.
  }
}

function getProgressClampLevel() {
  return state.levels.length > 0 ? state.levels.length : Number.MAX_SAFE_INTEGER;
}

function getActiveProfileRecord() {
  if (!state.profileStore.profiles[state.activeProfileId]) {
    state.profileStore = normalizeProfileStore(state.profileStore, getProgressClampLevel());
    state.activeProfileId = state.profileStore.activeProfileId;
  }
  return state.profileStore.profiles[state.activeProfileId];
}

function applyActiveProfileState() {
  const active = getActiveProfileRecord();
  state.progress = normalizeProgress(active.progress, getProgressClampLevel());
  state.damProfile = normalizeDamProfile(active.damProfile);
  state.tutorialSeen = Boolean(active.tutorialSeen);
  state.profileStats = normalizeProfileStats(active.stats);
  state.activeProfileName = active.name;

  active.progress = state.progress;
  active.damProfile = state.damProfile;
  active.tutorialSeen = state.tutorialSeen;
  active.stats = state.profileStats;
}

function saveProgress() {
  const active = getActiveProfileRecord();
  state.progress = normalizeProgress(state.progress, getProgressClampLevel());
  active.progress = state.progress;
  saveProfileStore();
}

function saveDamProfile() {
  const active = getActiveProfileRecord();
  state.damProfile = normalizeDamProfile(state.damProfile);
  active.damProfile = state.damProfile;
  saveProfileStore();
}

function saveTutorialSeen() {
  const active = getActiveProfileRecord();
  active.tutorialSeen = Boolean(state.tutorialSeen);
  saveProfileStore();
}

function saveProfileStats() {
  const active = getActiveProfileRecord();
  state.profileStats = normalizeProfileStats(state.profileStats);
  active.stats = state.profileStats;
  saveProfileStore();
}

function switchActiveProfile(profileId, { confirmMatchExit = false } = {}) {
  if (!state.profileStore.profiles[profileId]) return false;
  if (profileId === state.activeProfileId) return true;

  if (confirmMatchExit && state.game && state.game.phase !== "ended") {
    const confirmed = window.confirm("Switching profiles will abandon the current match. Continue?");
    if (!confirmed) return false;
    state.game = null;
    state.selectedAttackerId = null;
    hideResult();
    clearAutoEndTurnTimer();
    closeTutorial(false);
  }

  state.activeProfileId = profileId;
  state.profileStore.activeProfileId = profileId;
  applyActiveProfileState();
  saveProfileStore();
  return true;
}

function createProfile(rawName) {
  const name = sanitizeProfileName(rawName);
  if (!name) {
    return { ok: false, reason: "Name required" };
  }

  const alreadyExists = Object.values(state.profileStore.profiles).some(
    (profile) => profile.name.toLowerCase() === name.toLowerCase()
  );
  if (alreadyExists) {
    return { ok: false, reason: "Duplicate name" };
  }

  const entry = normalizeProfileEntry(
    createProfileId(),
    {
      name,
      createdAt: Date.now(),
      progress: defaultProgress(),
      damProfile: defaultDamProfile(),
      tutorialSeen: false,
      stats: defaultProfileStats(),
    },
    Math.max(state.levels.length, 1)
  );

  state.profileStore.profiles[entry.id] = entry;
  state.profileStore.activeProfileId = entry.id;
  state.activeProfileId = entry.id;
  applyActiveProfileState();
  saveProfileStore();

  return { ok: true, profileId: entry.id };
}

function deleteActiveProfile() {
  const ids = Object.keys(state.profileStore.profiles);
  if (ids.length <= 1) return false;

  const active = getActiveProfileRecord();
  const confirmed = window.confirm(`Delete profile "${active.name}"? This cannot be undone.`);
  if (!confirmed) {
    return false;
  }

  if (state.game && state.game.phase !== "ended") {
    const matchConfirmed = window.confirm("Deleting this profile will also abandon the current match. Continue?");
    if (!matchConfirmed) {
      return false;
    }
    state.game = null;
    state.selectedAttackerId = null;
    hideResult();
    clearAutoEndTurnTimer();
    closeTutorial(false);
  }

  delete state.profileStore.profiles[state.activeProfileId];

  const fallbackId = Object.keys(state.profileStore.profiles)[0];
  state.profileStore.activeProfileId = fallbackId;
  state.activeProfileId = fallbackId;
  applyActiveProfileState();
  saveProfileStore();
  return true;
}

function getUpgradeLevel(id) {
  return Number(state.damProfile.upgrades[id] || 0);
}

function scaleCost(baseCost, level, growth = ECONOMY.upgradeGrowth) {
  const multiplier = 1 + level * growth;
  return {
    wood: Math.ceil(baseCost.wood * multiplier),
    stone: Math.ceil(baseCost.stone * multiplier),
    water: Math.ceil(baseCost.water * multiplier),
  };
}

function resourceString(resources) {
  return `Wood ${resources.wood} | Stone ${resources.stone} | Water ${resources.water}`;
}

function canAfford(resources, cost) {
  return RESOURCE_KEYS.every((key) => resources[key] >= cost[key]);
}

function spendResources(resources, cost) {
  RESOURCE_KEYS.forEach((key) => {
    resources[key] -= cost[key];
  });
}

function formatProfileStats(stats) {
  return `W ${stats.wins} | L ${stats.losses} | Streak ${stats.currentStreak} (Best ${stats.bestStreak})`;
}

function renderProfilePanel() {
  if (!nodes.profileSelect || !nodes.profileDeleteBtn || !nodes.profileStats) {
    return;
  }

  const profiles = Object.values(state.profileStore.profiles).sort((a, b) => a.createdAt - b.createdAt);

  nodes.profileSelect.innerHTML = profiles
    .map((profile) => `<option value="${profile.id}">${escapeHtml(profile.name)}</option>`)
    .join("");

  nodes.profileSelect.value = state.activeProfileId;
  nodes.profileDeleteBtn.disabled = profiles.length <= 1;
  nodes.profileStats.textContent = `Active: ${state.activeProfileName} | ${formatProfileStats(state.profileStats)}`;
}

function renderMenu() {
  showScreen("menu");

  renderProfilePanel();
  if (nodes.tutorialBtn) {
    nodes.tutorialBtn.textContent = state.tutorialSeen ? "Replay Beaver Tutorial" : "Start Beaver Tutorial";
  }
  if (nodes.menuResourceSummary) {
    nodes.menuResourceSummary.textContent = `${state.activeProfileName} stores: ${resourceString(state.damProfile.resources)}`;
  }

  if (nodes.levelGrid) {
    nodes.levelGrid.innerHTML = state.levels
    .map((level) => {
      const unlocked = level.id <= state.progress.unlocked;
      const cleared = Boolean(state.progress.wins[level.id]);
      const statusLabel = unlocked ? (cleared ? "Cleared" : "Unlocked") : "Locked";

      return `
        <article class="level-card ${unlocked ? "" : "locked"}" style="--lv-start: ${level.cardBackStart}; --lv-end: ${level.cardBackEnd};">
          <div>
            <span class="status-chip">${statusLabel}</span>
            <h3>${escapeHtml(level.name)}</h3>
            <p>${escapeHtml(level.subtitle)}</p>
            <p><strong>Rival:</strong> ${escapeHtml(level.enemyHero)}</p>
            <p><strong>Health:</strong> ${level.enemyHealth} | <strong>AI:</strong> ${level.aiDifficulty}</p>
          </div>
          <button class="${unlocked ? "primary" : "ghost"}" data-start-level="${level.id}">
            ${unlocked ? "Challenge" : "Locked"}
          </button>
        </article>
      `;
    })
    .join("");
  }

  const groupedDeck = summarizeDeck(state.starterDeck);
  if (nodes.starterDeckPreview) {
    nodes.starterDeckPreview.innerHTML = groupedDeck.map(({ card, copies }) => renderPreviewCard(card, copies)).join("");
  }
}

function renderDam() {
  nodes.damWood.textContent = state.damProfile.resources.wood;
  nodes.damStone.textContent = state.damProfile.resources.stone;
  nodes.damWater.textContent = state.damProfile.resources.water;

  nodes.damUpgradeList.innerHTML = DAM_UPGRADES.map((upgrade) => {
    const current = getUpgradeLevel(upgrade.id);
    const atMax = current >= upgrade.maxLevel;
    const cost = scaleCost(upgrade.baseCost, current, ECONOMY.upgradeGrowth);
    const affordable = canAfford(state.damProfile.resources, cost);

    return `
      <article class="dam-item">
        <p class="item-meta">Level ${current}/${upgrade.maxLevel}</p>
        <h4>${escapeHtml(upgrade.name)}</h4>
        <p>${escapeHtml(upgrade.description)}</p>
        <p class="cost-line">Cost: ${resourceString(cost)}</p>
        <button
          class="${affordable && !atMax ? "primary" : "ghost"} small-btn"
          data-upgrade-id="${upgrade.id}"
          ${atMax ? "disabled" : ""}
        >
          ${atMax ? "Maxed" : "Build"}
        </button>
      </article>
    `;
  }).join("");

  nodes.damForgeList.innerHTML = DECK_FORGE_OPTIONS.map((entry) => {
    const card = state.cardsBySlug[entry.slug];
    if (!card) return "";
    const owned = Number(state.damProfile.deckAdditions[entry.slug] || 0);
    const atMax = owned >= entry.maxCopies;
    const cost = scaleCost(entry.baseCost, owned, ECONOMY.forgeGrowth);
    const affordable = canAfford(state.damProfile.resources, cost);

    return `
      <article class="dam-item">
        <p class="item-meta">Copies ${owned}/${entry.maxCopies}</p>
        <h4>${escapeHtml(card.name)}</h4>
        <p>${escapeHtml(card.description)}</p>
        <p class="cost-line">Cost: ${resourceString(cost)}</p>
        <button
          class="${affordable && !atMax ? "primary" : "ghost"} small-btn"
          data-forge-slug="${entry.slug}"
          ${atMax ? "disabled" : ""}
        >
          ${atMax ? "Maxed" : "Add To Deck"}
        </button>
      </article>
    `;
  }).join("");
}

function purchaseUpgrade(upgradeId) {
  const upgrade = DAM_UPGRADES.find((entry) => entry.id === upgradeId);
  if (!upgrade) {
    playInputTone("rejected");
    return;
  }

  const current = getUpgradeLevel(upgrade.id);
  if (current >= upgrade.maxLevel) {
    playInputTone("rejected");
    return;
  }

  const cost = scaleCost(upgrade.baseCost, current, ECONOMY.upgradeGrowth);
  if (!canAfford(state.damProfile.resources, cost)) {
    playInputTone("rejected");
    return;
  }

  spendResources(state.damProfile.resources, cost);
  state.damProfile.upgrades[upgrade.id] = current + 1;
  saveDamProfile();
  playInputTone("upgrade_build");
  renderDam();
}

function purchaseForgeCard(slug) {
  const config = DECK_FORGE_OPTIONS.find((entry) => entry.slug === slug);
  if (!config) {
    playInputTone("rejected");
    return;
  }

  const owned = Number(state.damProfile.deckAdditions[slug] || 0);
  if (owned >= config.maxCopies) {
    playInputTone("rejected");
    return;
  }

  const cost = scaleCost(config.baseCost, owned, ECONOMY.forgeGrowth);
  if (!canAfford(state.damProfile.resources, cost)) {
    playInputTone("rejected");
    return;
  }

  spendResources(state.damProfile.resources, cost);
  state.damProfile.deckAdditions[slug] = owned + 1;
  saveDamProfile();
  playInputTone("forge_add");
  renderDam();
}

function buildPlayerDeckTemplate() {
  const deck = [...state.starterDeck];
  for (const [slug, copies] of Object.entries(state.damProfile.deckAdditions)) {
    const card = state.cardsBySlug[slug];
    if (!card) continue;
    for (let index = 0; index < copies; index += 1) {
      deck.push(card);
    }
  }
  return deck;
}

async function startLevel(levelId, options = {}) {
  if (levelId > state.progress.unlocked) {
    if (!options.silentTone) {
      playInputTone("rejected");
    }
    return false;
  }

  const payload = await fetchJson(`/api/level/${levelId}`);
  const playerDeckTemplate = buildPlayerDeckTemplate();

  state.selectedAttackerId = null;
  state.game = createGame(payload.level, payload.enemyDeck, playerDeckTemplate);

  clearAutoEndTurnTimer();
  hideResult();
  closeTutorial(false);
  showScreen("game");
  startPlayerTurn(state.game);
  renderGame();

  if (!options.silentTone && !options.forceTutorial) {
    playInputTone("level_start");
  }

  if (options.forceTutorial || (!state.tutorialSeen && levelId === 1)) {
    openTutorial();
  }

  return true;
}

function createGame(level, enemyDeckTemplate, playerDeckTemplate) {
  const startingHealth = 30 + getUpgradeLevel("reinforcedWalls") * 2;
  const handBoost = getUpgradeLevel("deckSatchel");

  const game = {
    level,
    turn: 0,
    phase: "setup",
    outcome: "",
    playerHealth: startingHealth,
    enemyHealth: level.enemyHealth,
    maxPlayerMana: 0,
    playerMana: 0,
    maxEnemyMana: 0,
    enemyMana: 0,
    playerFatigue: 0,
    enemyFatigue: 0,
    maxPlayerHand: BASE_MAX_HAND + handBoost,
    maxEnemyHand: BASE_MAX_HAND,
    zoneCaps: {
      river: BASE_ZONE_CAPACITY.river,
      forest: BASE_ZONE_CAPACITY.forest,
      dam: BASE_ZONE_CAPACITY.dam + getUpgradeLevel("damBastion"),
    },
    playerBattleResources: {
      wood: 0,
      stone: 0,
      water: 0,
    },
    playerDeck: shuffle(cloneDeck(playerDeckTemplate)),
    enemyDeck: shuffle(cloneDeck(enemyDeckTemplate)),
    playerHand: [],
    enemyHand: [],
    playerBoard: [],
    enemyBoard: [],
    log: [],
  };

  drawCards(game, "player", 3 + handBoost, false);
  drawCards(game, "enemy", 3, false);
  pushLog(game, `Entering ${level.name}. ${level.intro}`);
  return game;
}

function startPlayerTurn(game) {
  if (game.phase === "ended") return;

  game.phase = "player";
  game.turn += 1;
  game.maxPlayerMana = Math.min(10, game.maxPlayerMana + 1);
  game.playerMana = game.maxPlayerMana;

  refreshBoardForTurn(game.playerBoard);
  applyRiverRestoration(game, "player");
  drawCards(game, "player", 1, true);
  gatherResourcesForTurn(game, "player");
  pushLog(game, `Turn ${game.turn}: your colony acts.`);

  playInputTone("turn_player");
  setMusicMode("battle_player");
  checkForGameEnd(game);
}

function startEnemyTurn(game) {
  if (game.phase === "ended") return;

  game.phase = "enemy";
  game.maxEnemyMana = Math.min(10, game.maxEnemyMana + 1);
  game.enemyMana = game.maxEnemyMana;

  refreshBoardForTurn(game.enemyBoard);
  applyRiverRestoration(game, "enemy");
  drawCards(game, "enemy", 1, true);
  gatherResourcesForTurn(game, "enemy");
  pushLog(game, "Enemy colony turn begins.");

  playInputTone("turn_enemy");
  setMusicMode("battle_enemy");
  checkForGameEnd(game);
}

function applyRiverRestoration(game, side) {
  const board = side === "player" ? game.playerBoard : game.enemyBoard;
  const riverMinions = board.filter((entry) => entry.zone === "river");
  if (riverMinions.length === 0) return;

  let healedMinions = 0;
  riverMinions.forEach((minion) => {
    const before = minion.currentHealth;
    minion.currentHealth = Math.min(minion.maxHealth, minion.currentHealth + 1);
    if (minion.currentHealth > before) {
      healedMinions += 1;
    }
  });

  if (healedMinions > 0) {
    pushLog(game, `${side === "player" ? "Your" : "Enemy"} river lane restores ${healedMinions} minion${healedMinions === 1 ? "" : "s"}.`);
    if (side === "player") {
      playInputTone("water_restore");
    }
  } else {
    pushLog(game, `${side === "player" ? "Your" : "Enemy"} river lane is calm; no minions needed restoration.`);
  }
}

function gatherResourcesForTurn(game, side) {
  const board = side === "player" ? game.playerBoard : game.enemyBoard;
  const totals = { wood: 0, stone: 0, water: 0 };
  const occupiedZones = new Set();

  board.forEach((minion) => {
    totals.wood += minion.woodYield || 0;
    totals.stone += minion.stoneYield || 0;
    totals.water += minion.waterYield || 0;
    occupiedZones.add(minion.zone);
  });

  if (occupiedZones.has("forest")) totals.wood += ECONOMY.zoneBonus.forest;
  if (occupiedZones.has("dam")) totals.stone += ECONOMY.zoneBonus.dam;
  if (occupiedZones.has("river")) totals.water += ECONOMY.zoneBonus.river;

  if (side === "player") {
    totals.wood += getUpgradeLevel("timberYard");
    totals.stone += getUpgradeLevel("stoneWeir");
    totals.water += getUpgradeLevel("riverSluice");
    addResources(game.playerBattleResources, totals);
  }

  if (totals.wood + totals.stone + totals.water > 0) {
    pushLog(
      game,
      `${side === "player" ? "You" : "Enemy"} gather resources: ${resourceString(totals)}.`
    );
    if (side === "player") {
      playInputTone("resource_gain");
    }
  }

  const healAmount = Math.floor(totals.water / ECONOMY.waterHealPer);
  if (healAmount > 0) {
    healHero(game, side, healAmount);
    pushLog(
      game,
      `${side === "player" ? "Your" : "Enemy"} water flow restores ${healAmount} hero Health.`
    );
  }
}

async function runEnemyTurn() {
  const game = state.game;
  if (!game || game.phase === "ended") return;

  startEnemyTurn(game);
  renderGame();
  await wait(paceMs(420));

  const maxPlays = Math.min(2 + Math.floor(game.level.aiDifficulty / 2), 5);
  let plays = 0;

  while (plays < maxPlays && game.phase === "enemy") {
    const chosenCard = chooseEnemyCard(game);
    if (!chosenCard) break;
    playCardFromHand("enemy", chosenCard.instanceId);
    plays += 1;
    renderGame();
    if (checkForGameEnd(game)) return;
    await wait(paceMs(330));
  }

  let attackBudget = game.enemyBoard.length * 2 + 2;
  while (attackBudget > 0 && game.phase === "enemy") {
    const attacker = game.enemyBoard.find((entry) => entry.canAttack);
    if (!attacker) break;
    attackBudget -= 1;

    const target = chooseEnemyAttackTarget(game, attacker);
    if (target.type === "hero") {
      performAttack("enemy", attacker.instanceId, "hero");
    } else {
      performAttack("enemy", attacker.instanceId, "minion", target.targetId);
    }

    renderGame();
    if (checkForGameEnd(game)) return;
    await wait(paceMs(340));
  }

  if (game.phase !== "ended") {
    await wait(paceMs(420));
    startPlayerTurn(game);
    renderGame();
  }
}

function chooseEnemyCard(game) {
  const affordable = game.enemyHand.filter((card) => {
    if (card.cost > game.enemyMana) return false;
    if (card.cardType === "minion" && !hasAnyBoardSpace(game, "enemy", card.habitat)) return false;
    return true;
  });

  if (affordable.length === 0) return null;

  const lethal = affordable.find(
    (card) => card.effectOnPlay === "damage_enemy_hero" && card.effectValue >= game.playerHealth
  );
  if (lethal) return lethal;

  const scored = affordable.map((card) => {
    let score = card.cost * 1.25 + Math.random() * 0.85;
    if (card.cardType === "minion") {
      score += card.attack + card.health * 0.45;
      score += (card.woodYield || 0) * 0.4 + (card.stoneYield || 0) * 0.45 + (card.waterYield || 0) * 0.5;
      if (card.habitat === "river") score += 0.45;
      if (card.habitat === "dam") score += 0.35;
    } else {
      if (card.effectOnPlay === "damage_enemy_hero") score += card.effectValue + (game.playerHealth <= 12 ? 2 : 0.4);
      if (card.effectOnPlay === "damage_all_enemy_minions") score += game.playerBoard.length * 1.8;
      if (card.effectOnPlay === "damage_random_enemy_minion") score += game.playerBoard.length > 0 ? 2.4 : -2;
      if (card.effectOnPlay === "buff_random_friendly_minion") score += game.enemyBoard.length > 0 ? 2 : -3;
      if (card.effectOnPlay === "draw_cards") score += game.enemyHand.length <= 4 ? 1.4 : 0;
      if (card.effectOnPlay === "heal_friendly_hero") score += game.enemyHealth <= 14 ? 2.2 : 0.4;
    }
    return { card, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].card;
}

function hasKeyword(entry, keyword) {
  if (!entry || !Array.isArray(entry.keywords)) return false;
  return entry.keywords.some((value) => String(value).toLowerCase() === keyword);
}

function getGuardMinions(board) {
  return board.filter((entry) => hasKeyword(entry, "guard") || hasKeyword(entry, "defender"));
}

function getLegalAttackTargets(game, attackerOwner) {
  const defendingBoard = attackerOwner === "player" ? game.enemyBoard : game.playerBoard;
  const guards = getGuardMinions(defendingBoard);

  if (guards.length > 0) {
    return {
      canTargetHero: false,
      minionIds: new Set(guards.map((entry) => entry.instanceId)),
      guardLocked: true,
    };
  }

  return {
    canTargetHero: true,
    minionIds: new Set(defendingBoard.map((entry) => entry.instanceId)),
    guardLocked: false,
  };
}

function chooseEnemyAttackTarget(game, attacker) {
  const legalTargets = getLegalAttackTargets(game, "enemy");
  const candidateTargets = game.playerBoard.filter((entry) => legalTargets.minionIds.has(entry.instanceId));

  if (legalTargets.canTargetHero && attacker.currentAttack >= game.playerHealth) {
    return { type: "hero" };
  }

  if (candidateTargets.length === 0) {
    return { type: "hero" };
  }

  const pressureHero = legalTargets.canTargetHero && game.level.aiDifficulty >= 4 && Math.random() < 0.42;
  if (pressureHero) {
    return { type: "hero" };
  }

  const sortedTargets = [...candidateTargets].sort((a, b) => {
    const valueA = a.currentAttack + a.currentHealth * 0.4;
    const valueB = b.currentAttack + b.currentHealth * 0.4;
    return valueB - valueA;
  });

  return { type: "minion", targetId: sortedTargets[0].instanceId };
}

function executeEndTurn({ automatic = false } = {}) {
  const game = state.game;
  if (!game || game.phase !== "player") {
    if (!automatic) playInputTone("rejected");
    return false;
  }

  if (state.tutorial.active) {
    if (!automatic) playInputTone("rejected");
    return false;
  }

  clearAutoEndTurnTimer();

  if (automatic) {
    playInputTone("auto_end");
    pushLog(game, "No legal actions remain. Turn auto-ended.");
  } else {
    playInputTone("registered");
  }

  state.selectedAttackerId = null;
  game.phase = "enemy";
  renderGame();
  runEnemyTurn();
  return true;
}

function handlePlayerCardPlay(instanceId) {
  const game = state.game;
  if (!game || game.phase !== "player") {
    playInputTone("rejected");
    return;
  }

  const card = game.playerHand.find((entry) => entry.instanceId === instanceId);
  if (!card) {
    playInputTone("rejected");
    return;
  }

  if (card.cost > game.playerMana) {
    pushLog(game, "Not enough mana.");
    playInputTone("rejected");
    renderGame();
    return;
  }

  if (card.cardType === "minion" && !hasAnyBoardSpace(game, "player", card.habitat)) {
    pushLog(game, "No habitat slot available for that minion.");
    playInputTone("rejected");
    renderGame();
    return;
  }

  const played = playCardFromHand("player", instanceId);
  if (!played) {
    playInputTone("rejected");
  }
  renderGame();
}

function playCardFromHand(owner, instanceId) {
  const game = state.game;
  if (!game) return false;

  const handKey = owner === "player" ? "playerHand" : "enemyHand";
  const boardKey = owner === "player" ? "playerBoard" : "enemyBoard";
  const manaKey = owner === "player" ? "playerMana" : "enemyMana";

  const hand = game[handKey];
  const board = game[boardKey];

  const index = hand.findIndex((card) => card.instanceId === instanceId);
  if (index < 0) return false;

  const card = hand[index];
  if (card.cost > game[manaKey]) return false;

  let summonZone = null;
  if (card.cardType === "minion") {
    summonZone = chooseZoneForSummon(game, owner, board, card.habitat);
    if (!summonZone) return false;
  }

  hand.splice(index, 1);
  game[manaKey] -= card.cost;

  resolveCardPlay(game, owner, card, summonZone);
  checkForGameEnd(game);
  return true;
}

function resolveCardPlay(game, owner, card, summonZone = null) {
  const ownerName = owner === "player" ? "You" : "Enemy";
  const board = owner === "player" ? game.playerBoard : game.enemyBoard;

  if (card.cardType === "minion") {
    const minion = {
      ...card,
      zone: summonZone,
      maxHealth: card.health,
      currentAttack: card.attack,
      currentHealth: card.health,
      canAttack: false,
      attacksRemaining: 0,
      summoningSickness: true,
    };

    if (owner === "player" && summonZone === "dam" && getUpgradeLevel("damBastion") > 0) {
      minion.maxHealth += 1;
      minion.currentHealth += 1;
    }

    board.push(minion);
    pushLog(game, `${ownerName} summoned ${card.name} in ${ZONE_META[summonZone].short}.`);
    if (owner === "player") {
      playInputTone("summon");
    }
  } else {
    pushLog(game, `${ownerName} cast ${card.name}.`);
    if (owner === "player") {
      playInputTone("spell_cast");
    }
  }

  if (card.effectOnPlay) {
    applyEffect(game, card.effectOnPlay, card.effectValue, owner, card.name);
  }

  cleanupDeadMinions(game);
}

function applyEffect(game, effect, value, owner, sourceName) {
  const opponent = owner === "player" ? "enemy" : "player";
  const ownerName = owner === "player" ? "You" : "Enemy";

  switch (effect) {
    case "damage_enemy_hero":
      damageHero(game, opponent, value);
      pushLog(game, `${sourceName} deals ${value} damage to ${opponent === "player" ? "you" : "the enemy hero"}.`);
      break;
    case "heal_friendly_hero":
      healHero(game, owner, value);
      pushLog(game, `${sourceName} restores ${value} Health to ${ownerName.toLowerCase()}.`);
      break;
    case "damage_all_enemy_minions": {
      const targets = opponent === "player" ? game.playerBoard : game.enemyBoard;
      targets.forEach((minion) => {
        minion.currentHealth -= value;
      });
      pushLog(game, `${sourceName} hits all enemy minions for ${value}.`);
      break;
    }
    case "buff_random_friendly_minion": {
      const allies = owner === "player" ? game.playerBoard : game.enemyBoard;
      if (allies.length === 0) {
        pushLog(game, `${sourceName} fizzles with no friendly minion.`);
        break;
      }
      const target = sample(allies);
      target.currentAttack += value;
      target.maxHealth += value;
      target.currentHealth += value;
      pushLog(game, `${sourceName} buffs ${target.name} by +${value}/+${value}.`);
      break;
    }
    case "damage_random_enemy_minion": {
      const enemies = opponent === "player" ? game.playerBoard : game.enemyBoard;
      if (enemies.length === 0) {
        pushLog(game, `${sourceName} has no minion target.`);
        break;
      }
      const target = sample(enemies);
      target.currentHealth -= value;
      pushLog(game, `${sourceName} hits ${target.name} for ${value}.`);
      break;
    }
    case "draw_cards":
      drawCards(game, owner, value, false);
      pushLog(game, `${ownerName} ${owner === "player" ? "draw" : "draws"} ${value} card${value === 1 ? "" : "s"}.`);
      break;
    case "summon_wisp":
      summonTokens(game, owner, value);
      pushLog(game, `${sourceName} summons ${value} Builder Kit${value === 1 ? "" : "s"}.`);
      break;
    default:
      break;
  }
}

function summonTokens(game, owner, count) {
  const board = owner === "player" ? game.playerBoard : game.enemyBoard;
  for (let index = 0; index < count; index += 1) {
    const zone = chooseZoneForSummon(game, owner, board, "forest");
    if (!zone) return;

    board.push({
      id: 0,
      slug: "builder_kit_token",
      name: "Builder Kit",
      description: "A tiny worker token.",
      cardType: "minion",
      rarity: "common",
      school: "Lumber",
      cost: 1,
      attack: 1,
      health: 1,
      effectOnPlay: "",
      effectValue: 0,
      keywords: ["token"],
      habitat: "forest",
      woodYield: 1,
      stoneYield: 0,
      waterYield: 0,
      paletteStart: "#d7f5b9",
      paletteEnd: "#4ea165",
      accent: "#ebffd8",
      starterCopies: 0,
      zone,
      maxHealth: 1,
      currentAttack: 1,
      currentHealth: 1,
      canAttack: false,
      attacksRemaining: 0,
      summoningSickness: true,
      instanceId: nextInstanceId(),
      isToken: true,
    });
  }
}

function chooseZoneForSummon(game, owner, board, habitat) {
  const caps = game.zoneCaps;
  const preferred = habitat && ZONE_ORDER.includes(habitat) ? [habitat, ...ZONE_ORDER.filter((zone) => zone !== habitat)] : ZONE_ORDER;

  for (const zone of preferred) {
    if (countZone(board, zone) < caps[zone]) {
      return zone;
    }
  }

  return null;
}

function hasAnyBoardSpace(game, owner, habitat = null) {
  const board = owner === "player" ? game.playerBoard : game.enemyBoard;
  return chooseZoneForSummon(game, owner, board, habitat) !== null;
}

function countZone(board, zone) {
  return board.filter((entry) => entry.zone === zone).length;
}

function playerHasAnyActions(game) {
  const canPlayCard = game.playerHand.some((card) => {
    if (card.cost > game.playerMana) return false;
    if (card.cardType === "minion") {
      return hasAnyBoardSpace(game, "player", card.habitat);
    }
    return true;
  });

  if (canPlayCard) return true;
  return game.playerBoard.some((minion) => minion.canAttack);
}

function clearAutoEndTurnTimer() {
  if (!state.autoEndTimer) return;
  window.clearTimeout(state.autoEndTimer);
  state.autoEndTimer = null;
}

function maybeAutoEndPlayerTurn() {
  const game = state.game;
  if (!game || game.phase !== "player" || game.phase === "ended" || state.tutorial.active) {
    clearAutoEndTurnTimer();
    return;
  }

  if (playerHasAnyActions(game)) {
    clearAutoEndTurnTimer();
    return;
  }

  if (state.autoEndTimer) return;

  state.autoEndTimer = window.setTimeout(() => {
    state.autoEndTimer = null;
    const current = state.game;
    if (!current || current.phase !== "player" || current.phase === "ended" || state.tutorial.active) {
      return;
    }
    if (playerHasAnyActions(current)) return;
    executeEndTurn({ automatic: true });
  }, paceMs(600));
}

function selectAttacker(instanceId) {
  const game = state.game;
  if (!game || game.phase !== "player") {
    playInputTone("rejected");
    return;
  }

  const minion = game.playerBoard.find((entry) => entry.instanceId === instanceId);
  if (!minion || !minion.canAttack) {
    playInputTone("rejected");
    return;
  }

  state.selectedAttackerId = instanceId;
  playInputTone("registered");
  renderGame();
}

function attacksPerTurn(minion) {
  return hasKeyword(minion, "fury") ? 2 : 1;
}

function consumeAttackCharge(minion) {
  if (!Number.isInteger(minion.attacksRemaining)) {
    minion.attacksRemaining = minion.canAttack ? 1 : 0;
  }
  minion.attacksRemaining = Math.max(0, minion.attacksRemaining - 1);
  minion.canAttack = minion.attacksRemaining > 0 && minion.currentHealth > 0;
}

function applyLifesteal(game, sourceSide, source, damageDealt) {
  if (damageDealt <= 0 || !hasKeyword(source, "lifesteal")) return;
  healHero(game, sourceSide, damageDealt);
  pushLog(game, `${source.name} lifesteals ${damageDealt} Health.`);
}

function performAttack(attackerOwner, attackerId, targetType, targetId = null) {
  const game = state.game;
  if (!game || game.phase === "ended") return false;

  const attackerBoard = attackerOwner === "player" ? game.playerBoard : game.enemyBoard;
  const defenderBoard = attackerOwner === "player" ? game.enemyBoard : game.playerBoard;

  const attacker = attackerBoard.find((entry) => entry.instanceId === attackerId);
  if (!attacker || !attacker.canAttack) return false;
  const legalTargets = getLegalAttackTargets(game, attackerOwner);

  const attackerLabel = attackerOwner === "player" ? "Your" : "Enemy";

  if (targetType === "hero") {
    if (!legalTargets.canTargetHero) {
      return false;
    }

    const damage = Math.max(0, attacker.currentAttack);
    if (attackerOwner === "player") {
      game.enemyHealth -= damage;
      pushLog(game, `${attackerLabel} ${attacker.name} hits enemy hero for ${damage}.`);
    } else {
      game.playerHealth -= damage;
      pushLog(game, `${attackerLabel} ${attacker.name} hits you for ${damage}.`);
    }
    applyLifesteal(game, attackerOwner, attacker, damage);
    consumeAttackCharge(attacker);
    playInputTone("attack_hero");
  } else {
    if (!legalTargets.minionIds.has(targetId)) {
      return false;
    }

    const target = defenderBoard.find((entry) => entry.instanceId === targetId);
    if (!target) return false;

    const damageToTarget = Math.max(0, attacker.currentAttack);
    const damageToAttacker = Math.max(0, target.currentAttack);
    const targetHealthBefore = Math.max(0, target.currentHealth);
    const attackerHealthBefore = Math.max(0, attacker.currentHealth);

    target.currentHealth -= damageToTarget;
    attacker.currentHealth -= damageToAttacker;

    if (damageToTarget > 0 && hasKeyword(attacker, "poisonous")) {
      target.currentHealth = 0;
      pushLog(game, `${attacker.name}'s poisonous bite destroys ${target.name}.`);
    }

    if (damageToAttacker > 0 && hasKeyword(target, "poisonous")) {
      attacker.currentHealth = 0;
      pushLog(game, `${target.name}'s poisonous counter destroys ${attacker.name}.`);
    }

    applyLifesteal(game, attackerOwner, attacker, Math.min(damageToTarget, targetHealthBefore));
    applyLifesteal(game, attackerOwner === "player" ? "enemy" : "player", target, Math.min(damageToAttacker, attackerHealthBefore));
    consumeAttackCharge(attacker);

    pushLog(
      game,
      `${attackerLabel} ${attacker.name} (${attacker.currentAttack}/${Math.max(attacker.currentHealth, 0)}) trades with ${attackerOwner === "player" ? "enemy" : "your"} ${target.name} (${target.currentAttack}/${Math.max(target.currentHealth, 0)}).`
    );
    playInputTone("attack_trade");
  }

  if (attackerOwner === "player") {
    state.selectedAttackerId = null;
  }

  cleanupDeadMinions(game);
  checkForGameEnd(game);
  return true;
}

function cleanupDeadMinions(game) {
  const removed = [];

  game.playerBoard = game.playerBoard.filter((minion) => {
    if (minion.currentHealth <= 0) {
      removed.push(minion.name);
      return false;
    }
    return true;
  });

  game.enemyBoard = game.enemyBoard.filter((minion) => {
    if (minion.currentHealth <= 0) {
      removed.push(minion.name);
      return false;
    }
    return true;
  });

  if (state.selectedAttackerId && !game.playerBoard.some((entry) => entry.instanceId === state.selectedAttackerId)) {
    state.selectedAttackerId = null;
  }

  removed.forEach((name) => pushLog(game, `${name} is destroyed.`));
}

function drawCards(game, owner, count, logDraw = true) {
  const deckKey = owner === "player" ? "playerDeck" : "enemyDeck";
  const handKey = owner === "player" ? "playerHand" : "enemyHand";
  const healthKey = owner === "player" ? "playerHealth" : "enemyHealth";
  const fatigueKey = owner === "player" ? "playerFatigue" : "enemyFatigue";
  const maxHand = owner === "player" ? game.maxPlayerHand : game.maxEnemyHand;
  const ownerName = owner === "player" ? "You" : "Enemy";

  for (let index = 0; index < count; index += 1) {
    if (game[deckKey].length === 0) {
      game[fatigueKey] += 1;
      game[healthKey] -= game[fatigueKey];
      pushLog(game, `${ownerName} take ${game[fatigueKey]} fatigue damage.`);
      continue;
    }

    const card = game[deckKey].shift();
    if (game[handKey].length >= maxHand) {
      pushLog(game, `${ownerName}'s hand is full. ${card.name} is discarded.`);
      continue;
    }

    game[handKey].push(card);
    if (logDraw) {
      pushLog(game, `${ownerName} drew a card.`);
      if (owner === "player") {
        playInputTone("draw_card");
      }
    }
  }
}

function refreshBoardForTurn(board) {
  board.forEach((minion) => {
    if (minion.summoningSickness) {
      minion.summoningSickness = false;
      minion.attacksRemaining = 0;
      minion.canAttack = false;
    } else {
      minion.attacksRemaining = attacksPerTurn(minion);
      minion.canAttack = minion.attacksRemaining > 0;
    }
  });
}

function damageHero(game, side, amount) {
  if (side === "player") {
    game.playerHealth -= amount;
  } else {
    game.enemyHealth -= amount;
  }
}

function healHero(game, side, amount) {
  if (side === "player") {
    game.playerHealth = Math.min(60, game.playerHealth + amount);
  } else {
    game.enemyHealth = Math.min(60, game.enemyHealth + amount);
  }
}

function checkForGameEnd(game) {
  if (game.phase === "ended") return true;

  if (game.playerHealth <= 0 && game.enemyHealth <= 0) {
    finishGame(false, "Draw", "Both colonies collapsed in the same turn.");
    return true;
  }
  if (game.enemyHealth <= 0) {
    finishGame(true, "Victory", "Rival colony defeated. Your dam network expands.");
    return true;
  }
  if (game.playerHealth <= 0) {
    finishGame(false, "Defeat", "Your colony was overrun. Reinforce and try again.");
    return true;
  }

  return false;
}

function calculateResourcePayout(game, won) {
  const base = game.playerBattleResources;
  const victoryBonus = won
    ? {
        wood: 2 + game.level.id,
        stone: 2 + Math.floor(game.level.id * 0.75),
        water: 1 + Math.floor(game.level.id / 2),
      }
    : {
        wood: 0,
        stone: 0,
        water: 0,
      };

  const multiplier = won ? 1 : ECONOMY.defeatPayoutMultiplier;
  const payout = {
    wood: Math.floor((base.wood + victoryBonus.wood) * multiplier),
    stone: Math.floor((base.stone + victoryBonus.stone) * multiplier),
    water: Math.floor((base.water + victoryBonus.water) * multiplier),
  };

  if (!won) {
    payout.wood = Math.max(payout.wood, ECONOMY.defeatFloor.wood);
    payout.stone = Math.max(payout.stone, ECONOMY.defeatFloor.stone);
    payout.water = Math.max(payout.water, ECONOMY.defeatFloor.water);
  }

  return payout;
}

function addResources(target, gain) {
  RESOURCE_KEYS.forEach((key) => {
    target[key] += gain[key];
  });
}

function finishGame(won, title, description) {
  const game = state.game;
  if (!game) return;

  game.phase = "ended";
  game.outcome = won ? "victory" : "defeat";
  state.selectedAttackerId = null;

  clearAutoEndTurnTimer();
  closeTutorial(false);

  const payout = calculateResourcePayout(game, won);
  addResources(state.damProfile.resources, payout);
  saveDamProfile();

  if (won) {
    const maxLevel = state.levels.length;
    state.progress.wins[game.level.id] = true;
    state.progress.unlocked = Math.min(Math.max(state.progress.unlocked, game.level.id + 1), maxLevel);
    saveProgress();
  }

  state.profileStats.totalGames += 1;
  if (won) {
    state.profileStats.wins += 1;
    state.profileStats.currentStreak += 1;
    state.profileStats.bestStreak = Math.max(state.profileStats.bestStreak, state.profileStats.currentStreak);
  } else {
    state.profileStats.losses += 1;
    state.profileStats.currentStreak = 0;
  }
  saveProfileStats();

  nodes.resultTitle.textContent = title;
  nodes.resultDescription.textContent = `${description} Resource haul: ${resourceString(payout)}.`;
  nodes.resultOverlay.classList.remove("hidden");

  playInputTone(won ? "victory" : "defeat");
  setMusicMode(won ? "victory" : "defeat");
}

function hideResult() {
  nodes.resultOverlay.classList.add("hidden");
}

function formatKeyword(keyword) {
  const normalized = String(keyword || "").toLowerCase();
  if (KEYWORD_LABELS[normalized]) return KEYWORD_LABELS[normalized];
  return normalized
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ""))
    .join(" ");
}

function keywordDescription(keyword) {
  const normalized = String(keyword || "").toLowerCase();
  return KEYWORD_DESCRIPTIONS[normalized] || "";
}

function renderKeywordRow(keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) return "";
  const chips = [...new Set(keywords.map((keyword) => String(keyword).toLowerCase()))]
    .map((keyword) => {
      const tip = keywordDescription(keyword);
      const tipAttr = tip ? ` title="${escapeHtml(tip)}"` : "";
      const cssClass = keyword.replace(/_/g, "-");
      return `<span class="keyword-chip keyword-${cssClass}"${tipAttr}>${escapeHtml(formatKeyword(keyword))}</span>`;
    })
    .join("");
  if (!chips) return "";
  return `<div class="keyword-row">${chips}</div>`;
}

function renderGame() {
  const game = state.game;
  if (!game) return;

  nodes.battleLevelName.textContent = game.level.name;
  nodes.battleLevelSubtitle.textContent = game.level.subtitle;
  nodes.enemyHeroName.textContent = game.level.enemyHero;

  nodes.enemyHealth.textContent = Math.max(game.enemyHealth, 0);
  nodes.enemyMana.textContent = `${game.enemyMana}/${game.maxEnemyMana}`;
  nodes.playerHealth.textContent = Math.max(game.playerHealth, 0);
  nodes.playerMana.textContent = `${game.playerMana}/${game.maxPlayerMana}`;
  nodes.turnCount.textContent = game.turn;

  nodes.battleWood.textContent = game.playerBattleResources.wood;
  nodes.battleStone.textContent = game.playerBattleResources.stone;
  nodes.battleWater.textContent = game.playerBattleResources.water;

  const selected = game.playerBoard.find((entry) => entry.instanceId === state.selectedAttackerId);
  const targetingInfo = selected && game.phase === "player" ? getLegalAttackTargets(game, "player") : null;
  if (!selected) {
    nodes.selectedAttackerText.textContent = "Select one of your minions, then target an enemy.";
    state.selectedAttackerId = null;
  } else {
    const remainingAttacks = Number.isInteger(selected.attacksRemaining)
      ? selected.attacksRemaining
      : selected.canAttack
        ? 1
        : 0;
    const furySuffix = hasKeyword(selected, "fury")
      ? ` (${remainingAttacks}/${attacksPerTurn(selected)} attacks left)`
      : "";
    if (targetingInfo && targetingInfo.guardLocked) {
      nodes.selectedAttackerText.textContent = `${selected.name}${furySuffix} must attack a Guard first.`;
    } else {
      nodes.selectedAttackerText.textContent = `${selected.name}${furySuffix} is ready. Pick an enemy target.`;
    }
  }

  nodes.enemyHeroPanel.classList.toggle(
    "can-target",
    Boolean(selected) && game.phase === "player" && Boolean(targetingInfo && targetingInfo.canTargetHero)
  );
  nodes.enemyHeroPanel.classList.toggle("guard-locked", Boolean(targetingInfo && targetingInfo.guardLocked));

  const endTurnInactive = game.phase !== "player" || state.tutorial.active;
  nodes.endTurnBtn.classList.toggle("is-inactive", endTurnInactive);
  nodes.endTurnBtn.setAttribute("aria-disabled", endTurnInactive ? "true" : "false");
  nodes.surrenderBtn.disabled = game.phase === "ended";

  renderBoardLane(nodes.enemyBoard, game.enemyBoard, "enemy", targetingInfo ? targetingInfo.minionIds : null);
  renderBoardLane(nodes.playerBoard, game.playerBoard, "player", null);
  renderHand(game);
  renderLog(game);

  maybeAutoEndPlayerTurn();
  syncMusicToGameState();
}

function renderBoardLane(container, board, owner, targetableMinionIds) {
  const game = state.game;
  if (!game) return;

  container.innerHTML = ZONE_ORDER.map((zone) => {
    const minions = board.filter((entry) => entry.zone === zone);
    const cap = game.zoneCaps[zone];
    const placeholders = Array.from({ length: Math.max(cap - minions.length, 0) }, () => "<div class=\"zone-placeholder\">Open slot</div>").join("");

    return `
      <div class="zone-block zone-${zone}">
        <div class="zone-head">
          <h4>${ZONE_META[zone].label}</h4>
          <p>${ZONE_META[zone].bonus}</p>
        </div>
        <div class="zone-cards">
          ${minions.map((minion) => renderBoardMinionCard(minion, owner, targetableMinionIds)).join("")}
          ${placeholders}
        </div>
      </div>
    `;
  }).join("");
}

function renderBoardMinionCard(minion, owner, targetableMinionIds) {
  const hasGuard = hasKeyword(minion, "guard") || hasKeyword(minion, "defender");
  const hasFury = hasKeyword(minion, "fury");
  const hasPoisonous = hasKeyword(minion, "poisonous");
  const hasLifesteal = hasKeyword(minion, "lifesteal");
  const selectedClass = owner === "player" && state.selectedAttackerId === minion.instanceId ? "selected-attacker" : "";
  const targetable = owner === "enemy" && targetableMinionIds instanceof Set && targetableMinionIds.has(minion.instanceId);
  const targetClass = targetable ? "targetable" : "";
  const targetAttr = targetable ? `data-target-id="${minion.instanceId}"` : "";
  const keywords = renderKeywordRow(minion.keywords);
  const enemyTargetClass = targetable ? "enemy-target" : "";
  const keywordClasses = [
    hasGuard ? "has-guard" : "",
    hasFury ? "has-fury" : "",
    hasPoisonous ? "has-poisonous" : "",
    hasLifesteal ? "has-lifesteal" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const furyAttacksLeft = Number.isInteger(minion.attacksRemaining)
    ? minion.attacksRemaining
    : minion.canAttack
      ? attacksPerTurn(minion)
      : 0;
  const attackButton =
    owner === "player"
      ? `<button class="attack-btn ${minion.canAttack && state.game.phase === "player" ? "ready" : ""}" data-attacker-id="${minion.instanceId}">${
          hasFury ? `Attack (${furyAttacksLeft})` : "Attack"
        }</button>`
      : "";

  return `
    <article
      class="game-card board-card rarity-${minion.rarity} ${enemyTargetClass} ${selectedClass} ${targetClass} ${keywordClasses}"
      ${targetAttr}
      style="--card-start: ${minion.paletteStart}; --card-end: ${minion.paletteEnd}; --card-accent: ${minion.accent};"
    >
      <div class="mana-gem">${minion.cost}</div>
      <h4 class="card-name">${escapeHtml(minion.name)}</h4>
      <p class="card-type-line">Minion - ${escapeHtml(minion.school)}</p>
      ${keywords}
      <p class="yield-line">Yield W${minion.woodYield} / S${minion.stoneYield} / Wa${minion.waterYield}</p>
      <div class="card-art"><span class="habitat-chip">${escapeHtml(minion.zone)}</span></div>
      <div class="stats-row">
        <div class="minion-stats">
          <span class="stat-pill attack">${minion.currentAttack}</span>
          <span class="stat-pill health">${Math.max(minion.currentHealth, 0)}</span>
        </div>
        ${attackButton}
      </div>
    </article>
  `;
}

function renderHand(game) {
  if (game.playerHand.length === 0) {
    nodes.playerHand.innerHTML = '<div class="empty-state">Your hand is empty.</div>';
    return;
  }

  nodes.playerHand.innerHTML = game.playerHand
    .map((card) => {
      const playable =
        game.phase === "player" &&
        card.cost <= game.playerMana &&
        !(card.cardType === "minion" && !hasAnyBoardSpace(game, "player", card.habitat));

      const statLine =
        card.cardType === "minion"
          ? `<div class="minion-stats">
              <span class="stat-pill attack">${card.attack}</span>
              <span class="stat-pill health">${card.health}</span>
            </div>`
          : '<span class="stat-pill attack">Spell</span>';

      const yields = `W${card.woodYield || 0} / S${card.stoneYield || 0} / Wa${card.waterYield || 0}`;

      return `
        <article
          class="game-card hand-card rarity-${card.rarity} ${playable ? "playable" : ""}"
          data-hand-id="${card.instanceId}"
          style="--card-start: ${card.paletteStart}; --card-end: ${card.paletteEnd}; --card-accent: ${card.accent};"
        >
          <div class="mana-gem">${card.cost}</div>
          <h4 class="card-name">${escapeHtml(card.name)}</h4>
          <p class="card-type-line">${card.cardType === "minion" ? "Minion" : "Spell"} - ${escapeHtml(card.school)}</p>
          ${renderKeywordRow(card.keywords)}
          <p class="yield-line">Yield ${yields}</p>
          <div class="card-art"><span class="habitat-chip">${escapeHtml(card.habitat)}</span></div>
          <p class="card-text">${escapeHtml(card.description)}</p>
          <div class="stats-row">${statLine}</div>
        </article>
      `;
    })
    .join("");
}

function renderLog(game) {
  const entries = [...game.log].slice(-30).reverse();
  nodes.battleLog.innerHTML = entries.map((entry) => `<div class="log-entry">${escapeHtml(entry)}</div>`).join("");
}

function renderPreviewCard(card, copies) {
  return `
    <article class="game-card preview-card rarity-${card.rarity}" style="--card-start: ${card.paletteStart}; --card-end: ${card.paletteEnd}; --card-accent: ${card.accent};">
      <div class="mana-gem">${card.cost}</div>
      <h4 class="card-name">${escapeHtml(card.name)} x${copies}</h4>
      <p class="card-type-line">${card.cardType === "minion" ? "Minion" : "Spell"} - ${escapeHtml(card.school)}</p>
      ${renderKeywordRow(card.keywords)}
      <p class="yield-line">Yield W${card.woodYield || 0} / S${card.stoneYield || 0} / Wa${card.waterYield || 0}</p>
      <div class="card-art"><span class="habitat-chip">${escapeHtml(card.habitat)}</span></div>
      <p class="card-text">${escapeHtml(card.description)}</p>
      <div class="stats-row">
        ${
          card.cardType === "minion"
            ? `<div class="minion-stats">
                 <span class="stat-pill attack">${card.attack}</span>
                 <span class="stat-pill health">${card.health}</span>
               </div>`
            : '<span class="stat-pill attack">Spell</span>'
        }
      </div>
    </article>
  `;
}

function summarizeDeck(deck) {
  const grouped = new Map();
  deck.forEach((card) => {
    const existing = grouped.get(card.id);
    if (existing) {
      existing.copies += 1;
    } else {
      grouped.set(card.id, { card, copies: 1 });
    }
  });

  return [...grouped.values()].sort((a, b) => {
    if (a.card.cost !== b.card.cost) return a.card.cost - b.card.cost;
    return a.card.name.localeCompare(b.card.name);
  });
}

function renderSettings() {
  if (!nodes.settingsPace || !nodes.settingsMaster || !nodes.settingsSfx || !nodes.settingsMusic) {
    return;
  }

  state.settings = normalizeSettings(state.settings);

  nodes.settingsPace.value = state.settings.pace;
  nodes.settingsMaster.value = String(state.settings.masterVolume);
  nodes.settingsSfx.value = String(state.settings.sfxVolume);
  nodes.settingsMusic.value = String(state.settings.musicVolume);

  if (nodes.settingsMasterValue) {
    nodes.settingsMasterValue.textContent = `${state.settings.masterVolume}%`;
  }
  if (nodes.settingsSfxValue) {
    nodes.settingsSfxValue.textContent = `${state.settings.sfxVolume}%`;
  }
  if (nodes.settingsMusicValue) {
    nodes.settingsMusicValue.textContent = `${state.settings.musicVolume}%`;
  }
}

function openSettings() {
  if (!nodes.settingsOverlay) return;
  if (state.tutorial.active) {
    playInputTone("rejected");
    return;
  }

  renderSettings();
  primeAudio();
  nodes.settingsOverlay.classList.remove("hidden");
  playInputTone("registered");
}

function closeSettings(withTone = true) {
  if (!nodes.settingsOverlay) return;
  if (nodes.settingsOverlay.classList.contains("hidden")) return;
  nodes.settingsOverlay.classList.add("hidden");
  if (withTone) {
    playInputTone("registered");
  }
}

function openTutorial() {
  if (!state.game) return;
  clearAutoEndTurnTimer();
  state.tutorial.active = true;
  state.tutorial.stepIndex = 0;
  nodes.tutorialOverlay.classList.remove("hidden");
  playInputTone("tutorial_open");
  setMusicMode("tutorial");
  renderTutorialStep();
}

function closeTutorial(markAsSeen) {
  const wasActive = state.tutorial.active;
  state.tutorial.active = false;
  state.tutorial.stepIndex = 0;
  nodes.tutorialOverlay.classList.add("hidden");
  clearTutorialHighlight();

  if (wasActive) {
    playInputTone(markAsSeen ? "tutorial_finish" : "tutorial_close");
  }

  if (markAsSeen) {
    state.tutorialSeen = true;
    saveTutorialSeen();
    if (nodes.tutorialBtn) {
      nodes.tutorialBtn.textContent = "Replay Beaver Tutorial";
    }
  }

  syncMusicToGameState();
  if (state.game && state.screen === "game") {
    renderGame();
  }
}

function renderTutorialStep() {
  if (!state.tutorial.active) return;
  const step = TUTORIAL_STEPS[state.tutorial.stepIndex];
  if (!step) {
    closeTutorial(true);
    return;
  }

  const stepNumber = state.tutorial.stepIndex + 1;
  const progress = stepNumber / TUTORIAL_STEPS.length;

  if (nodes.tutorialStep) {
    nodes.tutorialStep.textContent = `Step ${stepNumber} of ${TUTORIAL_STEPS.length}`;
  }
  if (nodes.tutorialProgressFill) {
    nodes.tutorialProgressFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  }
  if (nodes.tutorialTitle) {
    nodes.tutorialTitle.textContent = step.title;
  }
  if (nodes.tutorialText) {
    nodes.tutorialText.textContent = step.text;
  }
  if (nodes.tutorialObjective) {
    nodes.tutorialObjective.textContent = step.objective || "";
    nodes.tutorialObjective.style.display = step.objective ? "" : "none";
  }
  if (nodes.tutorialHint) {
    nodes.tutorialHint.textContent = step.hint || "";
    nodes.tutorialHint.style.display = step.hint ? "" : "none";
  }
  if (nodes.tutorialFact) {
    nodes.tutorialFact.textContent = step.fact;
  }
  if (nodes.tutorialPrevBtn) {
    nodes.tutorialPrevBtn.disabled = state.tutorial.stepIndex === 0;
  }
  if (nodes.tutorialNextBtn) {
    nodes.tutorialNextBtn.textContent = state.tutorial.stepIndex === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next";
  }

  highlightTutorialTarget(step.selector);
}

function highlightTutorialTarget(selector) {
  clearTutorialHighlight();
  if (!selector) return;

  const target = document.querySelector(selector);
  if (!target) return;

  target.classList.add("tutorial-focus");
  state.tutorial.highlightedNode = target;
  target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
}

function clearTutorialHighlight() {
  if (!state.tutorial.highlightedNode) return;
  state.tutorial.highlightedNode.classList.remove("tutorial-focus");
  state.tutorial.highlightedNode = null;
}

function showScreen(name) {
  state.screen = name;
  closeSettings(false);

  nodes.menuScreen.classList.toggle("active", name === "menu");
  nodes.damScreen.classList.toggle("active", name === "dam");
  nodes.gameScreen.classList.toggle("active", name === "game");

  if (name !== "game") {
    clearAutoEndTurnTimer();
    closeTutorial(false);
  }

  if (name === "menu") {
    setMusicMode("menu");
  } else if (name === "dam") {
    setMusicMode("dam");
  } else {
    syncMusicToGameState();
  }
}

function pushLog(game, message) {
  game.log.push(message);
  if (game.log.length > 100) {
    game.log = game.log.slice(-100);
  }
}

function cloneDeck(deckTemplate) {
  return deckTemplate.map((card) => ({
    ...card,
    keywords: Array.isArray(card.keywords) ? [...card.keywords] : [],
    instanceId: nextInstanceId(),
  }));
}

function nextInstanceId() {
  state.instanceSeed += 1;
  return state.instanceSeed;
}

function shuffle(values) {
  const clone = [...values];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[target]] = [clone[target], clone[index]];
  }
  return clone;
}

function sample(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function semitoneToFrequency(root, semitone) {
  return root * Math.pow(2, semitone / 12);
}

function levelFromSetting(base, percent) {
  return base * (Math.max(0, Math.min(100, Number(percent) || 0)) / 100);
}

function applyAudioSettings() {
  if (!state.audio.masterGain || !state.audio.sfxGain || !state.audio.musicGain) return;

  state.audio.masterGain.gain.value = levelFromSetting(AUDIO_BASE_LEVELS.master, state.settings.masterVolume);
  state.audio.sfxGain.gain.value = levelFromSetting(AUDIO_BASE_LEVELS.sfx, state.settings.sfxVolume);

  if (state.audio.activeMode && state.audio.activeMode !== "off") {
    state.audio.musicGain.gain.value = levelFromSetting(AUDIO_BASE_LEVELS.music, state.settings.musicVolume);
  }
}

function ensureAudioNodes() {
  if (state.audio.context) {
    return state.audio.context;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const masterGain = context.createGain();
  const sfxGain = context.createGain();
  const musicGain = context.createGain();
  const compressor = context.createDynamicsCompressor();

  masterGain.gain.value = levelFromSetting(AUDIO_BASE_LEVELS.master, state.settings.masterVolume);
  sfxGain.gain.value = levelFromSetting(AUDIO_BASE_LEVELS.sfx, state.settings.sfxVolume);
  musicGain.gain.value = 0.0001;

  compressor.threshold.value = -24;
  compressor.knee.value = 16;
  compressor.ratio.value = 3.5;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.2;

  sfxGain.connect(masterGain);
  musicGain.connect(masterGain);
  masterGain.connect(compressor);
  compressor.connect(context.destination);

  state.audio.context = context;
  state.audio.masterGain = masterGain;
  state.audio.sfxGain = sfxGain;
  state.audio.musicGain = musicGain;

  applyAudioSettings();
  return context;
}

function primeAudio() {
  const context = ensureAudioNodes();
  if (!context) return;

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  if (context.state === "running") {
    setMusicMode(state.audio.desiredMode || "menu");
  }
}

function playLayeredTone({
  frequency,
  duration = 0.2,
  gain = 0.03,
  type = "triangle",
  detune = 0,
  pan = 0,
  filterFrequency = 2400,
  bus = "sfx",
}) {
  const context = ensureAudioNodes();
  if (!context || context.state !== "running") return;

  const start = context.currentTime + 0.005;
  const filter = context.createBiquadFilter();
  const toneGain = context.createGain();
  const panner = context.createStereoPanner();
  const oscA = context.createOscillator();
  const oscB = context.createOscillator();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(filterFrequency, start);
  panner.pan.setValueAtTime(pan, start);

  toneGain.gain.setValueAtTime(0.0001, start);
  toneGain.gain.exponentialRampToValueAtTime(gain, start + 0.015);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscA.type = type;
  oscA.frequency.setValueAtTime(frequency, start);
  oscA.detune.setValueAtTime(detune, start);

  oscB.type = type === "sine" ? "triangle" : "sine";
  oscB.frequency.setValueAtTime(frequency * 2, start);
  oscB.detune.setValueAtTime(-detune * 0.4, start);

  oscA.connect(filter);
  oscB.connect(filter);
  filter.connect(toneGain);
  toneGain.connect(panner);
  panner.connect(bus === "music" ? state.audio.musicGain : state.audio.sfxGain);

  oscA.start(start);
  oscB.start(start);
  oscA.stop(start + duration);
  oscB.stop(start + duration);
}

function playNoiseBurst({
  duration = 0.09,
  gain = 0.016,
  pan = 0,
  lowpass = 2600,
  highpass = 220,
  bus = "sfx",
}) {
  const context = ensureAudioNodes();
  if (!context || context.state !== "running") return;

  const start = context.currentTime + 0.002;
  const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    const decay = 1 - index / frameCount;
    data[index] = (Math.random() * 2 - 1) * decay;
  }

  const src = context.createBufferSource();
  const hp = context.createBiquadFilter();
  const lp = context.createBiquadFilter();
  const amp = context.createGain();
  const panner = context.createStereoPanner();

  hp.type = "highpass";
  hp.frequency.setValueAtTime(highpass, start);
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(lowpass, start);
  panner.pan.setValueAtTime(pan, start);

  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  src.buffer = buffer;
  src.connect(hp);
  hp.connect(lp);
  lp.connect(amp);
  amp.connect(panner);
  panner.connect(bus === "music" ? state.audio.musicGain : state.audio.sfxGain);

  src.start(start);
  src.stop(start + duration);
}

function playInputTone(kind) {
  primeAudio();
  const context = state.audio.context;
  if (!context || context.state !== "running") return;

  if (kind === "resource_gain") {
    playLayeredTone({ frequency: 392, duration: 0.1, gain: 0.018, type: "triangle", pan: -0.08 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 523.25, duration: 0.1, gain: 0.016, type: "sine", pan: 0.08 });
    }, 55);
    return;
  }

  if (kind === "water_restore") {
    playLayeredTone({ frequency: 329.63, duration: 0.12, gain: 0.018, type: "sine", pan: -0.1, filterFrequency: 3200 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 440, duration: 0.16, gain: 0.017, type: "triangle", pan: 0.1, filterFrequency: 3200 });
    }, 70);
    return;
  }

  if (kind === "summon") {
    playNoiseBurst({ duration: 0.07, gain: 0.007, pan: -0.1, lowpass: 1800, highpass: 300 });
    playLayeredTone({ frequency: 246.94, duration: 0.14, gain: 0.022, type: "triangle", pan: -0.1, filterFrequency: 1700 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 329.63, duration: 0.12, gain: 0.018, type: "triangle", pan: 0.08 });
    }, 70);
    return;
  }

  if (kind === "spell_cast") {
    playLayeredTone({ frequency: 440, duration: 0.12, gain: 0.018, type: "sine", pan: -0.14, filterFrequency: 3000 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 659.25, duration: 0.16, gain: 0.018, type: "triangle", pan: 0.12, filterFrequency: 2900 });
    }, 65);
    return;
  }

  if (kind === "attack_hero") {
    playNoiseBurst({ duration: 0.065, gain: 0.01, pan: 0, lowpass: 2400, highpass: 260 });
    playLayeredTone({ frequency: 196, duration: 0.09, gain: 0.019, type: "sawtooth", detune: 5, filterFrequency: 1500 });
    return;
  }

  if (kind === "attack_trade") {
    playNoiseBurst({ duration: 0.075, gain: 0.012, pan: -0.08, lowpass: 2100, highpass: 280 });
    window.setTimeout(() => {
      playNoiseBurst({ duration: 0.07, gain: 0.01, pan: 0.09, lowpass: 2100, highpass: 280 });
    }, 45);
    playLayeredTone({ frequency: 174.61, duration: 0.08, gain: 0.018, type: "square", filterFrequency: 1300 });
    return;
  }

  if (kind === "draw_card") {
    playLayeredTone({ frequency: 587.33, duration: 0.08, gain: 0.014, type: "triangle", pan: -0.08, filterFrequency: 2600 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 783.99, duration: 0.09, gain: 0.012, type: "sine", pan: 0.08, filterFrequency: 3200 });
    }, 40);
    return;
  }

  if (kind === "upgrade_build") {
    playNoiseBurst({ duration: 0.08, gain: 0.008, pan: -0.12, lowpass: 1700, highpass: 240 });
    playLayeredTone({ frequency: 261.63, duration: 0.14, gain: 0.022, type: "triangle", pan: -0.12, filterFrequency: 1900 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 392, duration: 0.14, gain: 0.021, type: "triangle", pan: 0.08, filterFrequency: 2200 });
    }, 85);
    return;
  }

  if (kind === "forge_add") {
    playLayeredTone({ frequency: 329.63, duration: 0.11, gain: 0.02, type: "triangle", pan: -0.1, filterFrequency: 2200 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 493.88, duration: 0.13, gain: 0.019, type: "triangle", pan: 0.1, filterFrequency: 2500 });
    }, 70);
    window.setTimeout(() => {
      playLayeredTone({ frequency: 659.25, duration: 0.15, gain: 0.018, type: "sine", pan: 0, filterFrequency: 3200 });
    }, 140);
    return;
  }

  if (kind === "tutorial_step") {
    playLayeredTone({ frequency: 523.25, duration: 0.1, gain: 0.018, type: "triangle", pan: -0.08 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 659.25, duration: 0.12, gain: 0.016, type: "sine", pan: 0.1 });
    }, 55);
    return;
  }

  if (kind === "tutorial_finish") {
    playLayeredTone({ frequency: 523.25, duration: 0.14, gain: 0.024, type: "triangle", pan: -0.1 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 659.25, duration: 0.16, gain: 0.022, type: "triangle", pan: 0.08 });
    }, 80);
    window.setTimeout(() => {
      playLayeredTone({ frequency: 783.99, duration: 0.2, gain: 0.02, type: "sine", pan: 0.14 });
    }, 160);
    return;
  }

  if (kind === "tutorial_close") {
    playLayeredTone({ frequency: 369.99, duration: 0.1, gain: 0.015, type: "triangle", pan: -0.05 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 311.13, duration: 0.11, gain: 0.013, type: "sine", pan: 0.05 });
    }, 60);
    return;
  }

  if (kind === "registered") {
    playLayeredTone({ frequency: 720, duration: 0.13, gain: 0.026, type: "triangle", pan: -0.1 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 980, duration: 0.15, gain: 0.024, type: "triangle", pan: 0.1 });
    }, 60);
    return;
  }

  if (kind === "rejected") {
    playLayeredTone({
      frequency: 280,
      duration: 0.19,
      gain: 0.03,
      type: "sawtooth",
      detune: 9,
      pan: -0.05,
      filterFrequency: 1300,
    });
    window.setTimeout(() => {
      playLayeredTone({
        frequency: 210,
        duration: 0.17,
        gain: 0.022,
        type: "square",
        detune: -12,
        pan: 0.06,
        filterFrequency: 900,
      });
    }, 80);
    return;
  }

  if (kind === "auto_end") {
    playLayeredTone({ frequency: 392, duration: 0.17, gain: 0.028, type: "triangle", pan: -0.15 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 523.25, duration: 0.2, gain: 0.03, type: "triangle", pan: 0.14 });
    }, 95);
    window.setTimeout(() => {
      playLayeredTone({ frequency: 659.25, duration: 0.22, gain: 0.028, type: "triangle", pan: 0 });
    }, 185);
    return;
  }

  if (kind === "turn_player") {
    playLayeredTone({ frequency: 523.25, duration: 0.22, gain: 0.028, type: "triangle", pan: -0.2 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 783.99, duration: 0.18, gain: 0.022, type: "sine", pan: 0.2 });
    }, 80);
    return;
  }

  if (kind === "turn_enemy") {
    playLayeredTone({
      frequency: 233.08,
      duration: 0.24,
      gain: 0.028,
      type: "sawtooth",
      detune: 6,
      pan: -0.15,
      filterFrequency: 1100,
    });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 174.61, duration: 0.24, gain: 0.022, type: "square", pan: 0.18, filterFrequency: 900 });
    }, 90);
    return;
  }

  if (kind === "level_start") {
    playLayeredTone({ frequency: 392, duration: 0.17, gain: 0.03, type: "triangle" });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 587.33, duration: 0.19, gain: 0.026, type: "triangle" });
    }, 85);
    return;
  }

  if (kind === "tutorial_open") {
    playLayeredTone({ frequency: 349.23, duration: 0.2, gain: 0.022, type: "sine", pan: -0.12 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 523.25, duration: 0.24, gain: 0.024, type: "triangle", pan: 0.12 });
    }, 105);
    return;
  }

  if (kind === "victory") {
    playLayeredTone({ frequency: 523.25, duration: 0.2, gain: 0.03, type: "triangle" });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 659.25, duration: 0.22, gain: 0.028, type: "triangle" });
    }, 75);
    window.setTimeout(() => {
      playLayeredTone({ frequency: 783.99, duration: 0.3, gain: 0.03, type: "sine" });
    }, 155);
    return;
  }

  if (kind === "defeat") {
    playLayeredTone({ frequency: 311.13, duration: 0.22, gain: 0.028, type: "sawtooth", filterFrequency: 1200 });
    window.setTimeout(() => {
      playLayeredTone({ frequency: 246.94, duration: 0.25, gain: 0.026, type: "square", filterFrequency: 900 });
    }, 100);
    window.setTimeout(() => {
      playLayeredTone({ frequency: 174.61, duration: 0.33, gain: 0.024, type: "triangle", filterFrequency: 700 });
    }, 180);
    return;
  }
}

function playMusicStep(modeConfig) {
  const context = state.audio.context;
  if (!context || context.state !== "running" || !state.audio.musicGain) return;

  const step = state.audio.musicStep;
  const leadOffset = modeConfig.lead[step % modeConfig.lead.length];
  const bassOffset = modeConfig.bass[Math.floor(step / 4) % modeConfig.bass.length];
  const stepDuration = (60 / modeConfig.bpm) / 2;

  if (typeof leadOffset === "number") {
    playLayeredTone({
      frequency: semitoneToFrequency(modeConfig.root, leadOffset),
      duration: stepDuration * 0.95,
      gain: modeConfig.intensity * 0.24,
      type: "triangle",
      pan: step % 2 === 0 ? -0.18 : 0.18,
      filterFrequency: 2500,
      bus: "music",
    });
  }

  if (step % 2 === 0 && typeof bassOffset === "number") {
    playLayeredTone({
      frequency: semitoneToFrequency(modeConfig.root * 0.5, bassOffset),
      duration: stepDuration * 1.35,
      gain: modeConfig.intensity * 0.28,
      type: "sine",
      pan: -0.03,
      filterFrequency: 1200,
      bus: "music",
    });
  }

  if (step % 8 === 4) {
    playLayeredTone({
      frequency: semitoneToFrequency(modeConfig.root, 12),
      duration: stepDuration * 1.2,
      gain: modeConfig.intensity * 0.17,
      type: "sine",
      pan: 0,
      filterFrequency: 3200,
      bus: "music",
    });
  }

  state.audio.musicStep += 1;
}

function setMusicMode(mode) {
  state.audio.desiredMode = mode;
  const context = ensureAudioNodes();
  if (!context || context.state !== "running") return;
  if (state.audio.activeMode === mode) return;

  if (state.audio.musicInterval) {
    window.clearInterval(state.audio.musicInterval);
    state.audio.musicInterval = null;
  }

  const now = context.currentTime;
  state.audio.musicGain.gain.cancelScheduledValues(now);
  state.audio.musicGain.gain.setTargetAtTime(0.0001, now, 0.12);

  state.audio.activeMode = mode;
  const config = MUSIC_PATTERNS[mode];
  if (!config) return;

  state.audio.musicStep = 0;
  const stepMs = (60000 / config.bpm) / 2;

  window.setTimeout(() => {
    if (!state.audio.context || state.audio.activeMode !== mode) return;
    const current = state.audio.context.currentTime;
    state.audio.musicGain.gain.cancelScheduledValues(current);
    state.audio.musicGain.gain.setTargetAtTime(
      levelFromSetting(AUDIO_BASE_LEVELS.music, state.settings.musicVolume),
      current,
      0.35
    );
    playMusicStep(config);
    state.audio.musicInterval = window.setInterval(() => {
      if (!state.audio.context || state.audio.context.state !== "running") return;
      if (state.audio.activeMode !== mode) return;
      playMusicStep(config);
    }, stepMs);
  }, 130);
}

function syncMusicToGameState() {
  if (state.screen === "menu") {
    setMusicMode("menu");
    return;
  }

  if (state.screen === "dam") {
    setMusicMode("dam");
    return;
  }

  const game = state.game;
  if (!game) {
    setMusicMode("menu");
    return;
  }

  if (state.tutorial.active) {
    setMusicMode("tutorial");
    return;
  }

  if (game.phase === "enemy") {
    setMusicMode("battle_enemy");
    return;
  }

  if (game.phase === "player") {
    setMusicMode("battle_player");
    return;
  }

  if (game.phase === "ended") {
    if (game.outcome === "victory") {
      setMusicMode("victory");
    } else if (game.outcome === "defeat") {
      setMusicMode("defeat");
    }
  }
}

async function fetchJson(path) {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return response.json();
}
