# GATHER THE CROWN — REVISED MVP SPECIFICATION

**Status:** Implementation-Ready  
**Based On:** Copilot's Structure + ChatGPT's Identity Refinements  
**Focus:** Prove the game's core identity in minimal scope

---

## 🎯 CORE IDENTITY (MVP Must Prove These Six Things)

1. **Rider + Creat** - Always together, not summoned
2. **Bond System** - Feed to strengthen, bond unlocks power
3. **Preparation** - Strategic pre-battle setup (crown, feed, sync focus)
4. **Restoration Loop** - Clear → Gather → Restore → Reward
5. **Combat Feel** - Precise, telegraphed, skill-based
6. **Crown Crafting** - Identity system, not just stats

**MVP Success:** Player experiences all six in first 30 minutes.

---

## 📋 REVISED SCENE LIST (Execution Order)

### Phase 1: Foundation (Days 1-2)
- [x] Boot.tscn → GreenwoodClearing.tscn
- [ ] Player.tscn (with aim-to-cursor attacks)
- [ ] FireCreat.tscn (always following, not callable)
- [ ] InteractiveZone.tscn (template for feedable areas, NPCs, objects)

### Phase 2: Hub Identity (Day 3)
- [ ] GreenwoodClearing (Expanded)
  - [ ] Rest Point (scene element)
  - [ ] Creat Feed Station (interactable)
  - [ ] Crown Forge NPC (interactable)
  - [ ] Restoration Trophy Site (placeholder, shows final reward)
  - [ ] Path to Combat Zone

### Phase 3: Combat Loop (Day 4)
- [ ] WoodedTrail.tscn (enemy encounters)
- [ ] RestorationSite_01.tscn (NEW: interactive restoration mini-loop)
  - Enemies to clear
  - Material gather point
  - Structure to restore
  - Visual state change on completion

### Phase 4: Boss Encounter (Day 5)
- [ ] BossPrepSpace.tscn (NEW: interactive prep sequence)
  - Feed station
  - Crown equip station
  - Sync focus choice
  - Compact confirmation panel
  - Gate to boss arena
- [ ] BossArena.tscn (boss fight space)

### Phase 5: Polish (Day 6)
- [ ] Creat command panel (minimal)
- [ ] HUD polish (show commands, prep status)
- [ ] Zone transitions

---

## 🧩 REVISED SCRIPT LIST (Priority Order)

### CRITICAL - Add First (Enables Everything)

#### Interaction System (NEW - Phase 1)
```
scripts/world/
  ├── interaction_component.gd      # Component for any object
  ├── interactable.gd               # Base class for interactive objects
  └── interact_prompt_controller.gd # Shows UI prompt + handles input
```

**Why First:** Powers feeding, forge, restoration, prep, NPCs.

#### Creat Command Layer (NEW - Phase 2)
```
scripts/actors/companion/
  └── companion_commands.gd  # Follow / Attack / Defensive commands
```

**Why Phase 2:** Creat AI needs simple command input.

### KEEP - Already Built
```
scripts/core/
  ├── event_bus.gd
  ├── game_state.gd
  ├── scene_router.gd
  ├── save_manager.gd (stub, expand for restoration state)

scripts/systems/
  ├── bond_system.gd
  ├── sync_system.gd
  ├── inventory_system.gd

scripts/combat/
  ├── health.gd
  ├── hurtbox.gd
  ├── hitbox.gd
  └── combat_engine.gd (add aim-to-cursor support)

scripts/actors/
  ├── character_motor_2d.gd (keep 8-direction movement)
  └── player.gd (UPDATE: aim-to-cursor attacks + interact input)

scripts/actors/companion/
  └── fire_creat.gd (KEEP: always following + command layer)

scripts/actors/ai/
  ├── enemy_ai.gd
  └── boss_ai.gd
```

### NEW - Add for Restoration/Prep

#### Restoration System
```
scripts/systems/
  └── restoration_system.gd  # Track restored sites, rewards, state
```

#### Zone-Specific Logic
```
scripts/world/
  ├── greenwood_clearing.gd (EXPAND: add interactions)
  ├── wooded_trail.gd
  ├── restoration_site_01.gd (NEW: restore logic)
  └── boss_prep_space.gd (NEW: interactive prep)
```

#### UI Additions
```
scripts/ui/
  ├── hud.gd (EXPAND: show commands, prep status)
  ├── interact_prompt_ui.gd (NEW: shows [E] prompts)
  ├── companion_command_panel.gd (NEW: Follow/Attack/Defensive)
  ├── prep_panel.gd (NEW: compact prep confirmation)
  └── restoration_panel.gd (NEW: restoration progress UI)
```

---

## 🎬 REVISED IMPLEMENTATION ORDER

### **SPRINT 1: Movement + Interaction Foundation (Days 1-2)**

**Goal:** Player can move and interact with world objects.

**Priority:**
1. ✅ CharacterMotor2D (8-direction movement)
2. ✅ Player.gd (movement input)
3. **NEW** InteractionComponent.gd
4. **NEW** Interactable.gd
5. **NEW** InteractPromptController.gd
6. **NEW** CompanionCommands.gd

**Test:** Player walks around, sees [E] prompts near interactive objects.

---

### **SPRINT 2: Creat + Bond + Feeding (Day 3)**

**Goal:** Creat bonds through interaction; feeding proves bond mechanic.

**Priority:**
1. ✅ FireCreat.gd (always following)
2. ✅ BondSystem.gd
3. ✅ InventorySystem.gd (add creat food)
4. **UPDATE** Greenwood Clearing
   - Add "Feed Creat" interactable station
   - Player can press [E] to feed
   - Bond % increases on HUD
   - Creat reacts (visual/audio later)
5. **UPDATE** HUD.gd
   - Show bond % prominently
   - Show hunger level
   - Show companion command (Follow/Attack/Defensive)

**Test:** Player feeds creat 3 times, bond goes 50% → 60% → 70%.

---

### **SPRINT 3: Combat + Aim-to-Cursor (Day 4)**

**Goal:** Player can aim and attack precisely; creat assists.

**Priority:**
1. ✅ Health.gd
2. ✅ Hurtbox.gd
3. ✅ Hitbox.gd
4. **UPDATE** Player.gd
   - Change from 8-directional attacks to aim-to-cursor
   - Attacks fire in direction player is aiming
   - Movement stays 8-direction
5. ✅ EnemyAI.gd
6. ✅ BossAI.gd
7. **UPDATE** FireCreat.gd
   - Add command input (F for Follow/Attack toggle)
   - Respond to player's Attack command
   - Stay in Defensive mode initially

**Test:** Player attacks enemy in aimed direction; creat also attacks.

---

### **SPRINT 4: Restoration Loop (Day 5)**

**Goal:** Player clears enemies, gathers material, restores structure, sees reward.

**Priority:**
1. **NEW** RestorationSystem.gd
   - Track restoration state per site
   - Track gathered materials
   - Generate restore action
2. **NEW** RestorationSite_01.gd
   - Spawn 2-3 enemies in arena
   - Add material gather point (interactable)
   - Add structure (visual, interactable when ready)
   - On restore → visual change (glow, different color)
   - On complete → unlock daily reward + lore item
3. **UPDATE** InventorySystem.gd
   - Track restoration materials
4. **NEW** RestorationPanel.gd
   - Show "Restoration in progress..."
   - Show progress % or "Restored!"
   - Show reward unlocked

**Test:** Player goes to restoration site, clears enemies, gathers material, restores structure, sees it change visually, sees reward in inventory.

---

### **SPRINT 5: Pre-Battle Prep Space (Day 6)**

**Goal:** Interactive prep before boss fight; bond/crown/sync choices matter.

**Priority:**
1. **NEW** BossPrepSpace.gd
   - Zone-based logic
   - Spawn prep stations (feed, crown equip, sync focus)
   - Each is an Interactable
   - Gate to boss arena (locked until "ready")
2. **NEW** BossPrepStations.gd (scene template)
   - Feed Creat Station → call BondSystem.feed()
   - Crown Equip Station → show crown list, player picks
   - Sync Focus Station → player chooses (Damage/Defense/Speed)
   - "Ready" Button → unlocks gate to arena
3. **UPDATE** GameState.gd
   - Track selected_sync_focus (Damage/Defense/Speed)
   - Pass to SyncSystem for next 10 seconds
4. **UPDATE** SyncSystem.gd
   - Apply focus-specific bonuses:
     - Damage: 2.0x instead of 1.5x
     - Defense: Reduce incoming by 30%
     - Speed: 1.5x instead of 1.3x

**Test:** Player enters prep space, feeds creat (+5 bond), equips Iron Crown, chooses Damage focus, enters gate, fights boss with bonuses.

---

### **SPRINT 6: Hub Polish + Commands (Day 7)**

**Goal:** Greenwood Clearing feels like home; creat command layer works.

**Priority:**
1. **UPDATE** GreenwoodClearing.tscn
   - Add Rest Point (interactable: "Rest here" → full heal + calm animation)
   - Add Feed Station (from Sprint 2)
   - Add Crown Forge NPC (interactable: opens forge UI)
   - Add Restoration Trophy (visual placeholder showing "First Restoration Unlocked")
   - Add path marker to WoodedTrail
2. **NEW** CompanionCommandPanel.gd
   - Show 3 buttons: Follow / Attack / Defensive
   - Each toggles companion mode
   - Default: Follow
3. **UPDATE** HUD.gd
   - Show current command (top-left, near creat health)
   - Show command keybind (F)

**Test:** Player goes home, feeds creat at station, rests at rest point, sees trophy, can toggle creat commands with F.

---

### **SPRINT 7: Vertical Slice Integration (Days 8+)**

**Goal:** Full loop works: home → prep → fight → restoration → home.

**Priority:**
1. Connect all scenes via SceneRouter
2. Ensure player state persists (health, bond, inventory)
3. Boss victory → unlock restoration site as reward
4. Restoration completion → unlock next zone
5. Polish transitions and signals

**Test:** Full 5-minute loop:
- Feed creat (bond +)
- Go to combat zone
- Clear enemies (gain materials)
- Restore structure
- Go to boss prep
- Feed + equip crown + focus
- Fight boss
- Win
- Return home
- See restoration trophy

---

## 🏗️ SCENE STRUCTURE (Final)

```
GreenwoodClearing (EXPANDED)
├── RestPoint (Interactable)
│   └── interact_prompt
├── FeedStation (Interactable)
│   └── interact_prompt
├── CrownForgeNPC (Interactable)
│   └── interact_prompt
├── RestorationTrophy (Visual)
├── PathMarker (Direction to WoodedTrail)
├── Player
├── FireCreat
└── HUD

WoodedTrail
├── EnemySpawns (3x Enemy.tscn)
├── PathToRestorationSite
├── PathToBossPrepSpace
├── Player
├── FireCreat
└── HUD

RestorationSite_01 (NEW)
├── RestorationArena
│   ├── EnemySpawns (2x Enemy.tscn)
│   ├── MaterialGatherPoint (Interactable)
│   ├── BrokenStructure (Visual + Interactable)
│   └── RestoredStructure (Visual, shows on restore)
├── Player
├── FireCreat
└── RestorationPanel (UI)

BossPrepSpace (NEW)
├── FeedStation (Interactable)
├── CrownEquipStation (Interactable)
├── SyncFocusStation (Interactable)
├── ReadyGate (Locked interactable, unlocks when ready)
├── Player
├── FireCreat
└── PrepPanel (UI - compact confirmation)

BossArena
├── Boss.tscn
├── Player
├── FireCreat
└── HUD
```

---

## 📊 DATA FILES (Revised)

### zones.json - KEEP, ADD:
```json
{
  "zones": {
    "greenwood_clearing": {
      ...
      "interactables": [
        {
          "id": "feed_station",
          "type": "feed_creat",
          "position": [400, 300]
        },
        {
          "id": "crown_forge",
          "type": "npc",
          "npc_name": "Aldric the Forgemaster",
          "position": [600, 300]
        },
        {
          "id": "rest_point",
          "type": "rest",
          "position": [700, 300]
        },
        {
          "id": "restoration_trophy",
          "type": "trophy",
          "restoration_id": "restoration_site_01",
          "position": [550, 200]
        }
      ]
    },
    "restoration_site_01": {
      "id": "restoration_site_01",
      "name": "Ancient Grove",
      "type": "restoration",
      "zone_type": "restoration_site",
      "level_range": [3, 8],
      "enemies": 2,
      "material_type": "essence_water",
      "material_amount": 1,
      "restoration_time": 5,
      "reward": {
        "items": [
          { "type": "lore_item", "id": "grove_journal_entry_01" }
        ],
        "daily_income": [
          { "type": "essence_water", "amount": 1 }
        ]
      }
    }
  }
}
```

### restoration_data.json - NEW:
```json
{
  "restoration_sites": {
    "restoration_site_01": {
      "id": "restoration_site_01",
      "name": "Ancient Grove",
      "state": "unrestored",  // or "restoring" or "restored"
      "progress": 0,
      "completed_date": null,
      "daily_claims_available": 0
    }
  }
}
```

---

## 🎮 CONTROL MAP (Final)

| Input | Action |
|-------|--------|
| **WASD** | Move (8-direction) |
| **Mouse** | Aim attacks |
| **Left Click** / **Space** | Attack (in aimed direction) |
| **E** | Interact with world |
| **F** | Toggle creat command (Follow → Attack → Defensive → Follow) |
| **Shift** | Activate Sync mode (if meter ≥ 80) |
| **ESC** | Open menu (pause) |

---

## ✅ MVP SUCCESS CRITERIA

**Proves Core Identity:**
- [ ] Creat is always present, follows player
- [ ] Player feeds creat, bond increases
- [ ] Combat feels precise (aim-to-cursor)
- [ ] Creat responds to commands (Follow/Attack)
- [ ] Restoration loop completes (clear → gather → restore → reward)
- [ ] Pre-battle prep is interactive (feed, equip, focus)
- [ ] Greenwood Clearing has at least 4 interactables
- [ ] Full vertical slice works: home → prep → fight → restoration → home

**Performance:**
- Runs at 60 FPS
- Zones load without stutter
- No script errors in console

**Gameplay Loop:**
- Player can play for 10+ minutes without repeating
- Every major system is accessible and working
- Feedback is clear (HUD, prompts, sounds later)

---

## 🚀 NEXT IMMEDIATE STEP

**Build InteractionComponent + Interactable + InteractPromptController first.**

This unlocks all human-centered systems (feed, forge, restoration, prep).

**Time: 2-3 hours**

Once that works, all other systems snap in place quickly.

---

## 📌 KEY CHANGES FROM COPILOT'S PLAN

| What | Copilot | This Plan | Why |
|-----|---------|-----------|-----|
| Creat | Callable cooldown | Always present | Proves bond identity |
| Attacks | 8-directional | Aim-to-cursor | Precision + telegraph |
| Interaction | Implicit | Explicit system early | Powers everything |
| Restoration | Just a heal/sync | Full loop (clear→gather→restore→reward) | Proves game identity |
| Prep | Menu screen | Interactive space | Matches design intent |
| Hub | Minimal | 4+ interactables | Shows what the game is |
| Creat | Passive | Commands (Follow/Attack/Defensive) | Not just a pet |

---

## 📚 REFERENCE FILES

- MAPSPEC.md - Map system (integrate later, not MVP)
- MAPIMPL.md - Map implementation guide
- QUICKSTART.md - How to play guide
- README.md - Full documentation

**Start here:** Build InteractionComponent.gd and Interactable.gd
