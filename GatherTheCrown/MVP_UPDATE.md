# GATHER THE CROWN — MVP IMPLEMENTATION UPDATE

**Status:** Ready for Development  
**Updated:** April 17, 2026  
**Based On:** ChatGPT's Refined Identity Direction

---

## ✅ WHAT CHANGED FROM ORIGINAL COPILOT PLAN

### 1. **Interaction System (NEW - CRITICAL)**
**Before:** Interactions were implicit (feed, forge, restore handled elsewhere)  
**Now:** Reusable interaction component system

**New Files Created:**
- `scripts/world/interaction_component.gd` - Component for any interactive object
- `scripts/world/interactable.gd` - Base class for interactive objects
- `scripts/ui/interact_prompt_controller.gd` - Shows [E] prompts (now autoload)

**Why It Matters:** Powers feeding stations, NPCs, restoration sites, prep stations, lore objects — everything interactive in your game.

### 2. **Companion Commands (NEW)**
**Before:** Fire Creat just attacked automatically  
**Now:** Player can toggle between Follow/Attack/Defensive modes

**New Files Created:**
- `scripts/actors/companion/companion_commands.gd` (now autoload)

**How It Works:**
- Press F to cycle: Follow → Attack → Defensive → Follow
- Only attacks when in ATTACK mode
- High bond increases damage (up to +50%)
- HUD shows current command

**Why It Matters:** Makes the creat feel like a strategic choice, not just a passive pet.

### 3. **Restoration System (NEW)**
**Before:** Restoration sites were just a heal/sync location  
**Now:** Full mini-loop with material gathering, structure restoration, visual changes

**New Files Created:**
- `scripts/systems/restoration_system.gd` (now autoload)
- `scripts/world/restoration_structure.gd` - Interactable structure to restore
- `data/zones.json` - Complete zone data (6 zones + restoration sites)

**The Restoration Loop:**
1. Player clears enemies in restoration site
2. Player interacts with material gather point
3. Player interacts with broken structure (triggers restoration)
4. Restoration animates over ~5 seconds
5. Structure visually changes (ready for VFX later)
6. Player unlocks daily reward + lore item

**Why It Matters:** Restoration is a core game system, not a side mechanic. MVP must prove it works.

### 4. **Player Combat (CHANGED)**
**Before:** 8-directional attacks  
**Now:** Aim-to-cursor attacks + 8-direction movement

**Updated Files:**
- `scripts/actors/player/player.gd` - Now uses mouse position to aim
- Input: WASD for movement, mouse to aim, Space/Click to attack

**Why It Matters:** Matches your design intent (Souls-lite precision), matches top-down PC control scheme, enables telegraph/punishment windows for bosses.

### 5. **Fire Creat (UPDATED)**
**Before:** Always attacking, simple damage  
**Now:** Always following, command-responsive, bond-scaling damage

**Updated Files:**
- `scripts/actors/companion/fire_creat.gd` - Now checks CompanionCommands mode

**Changes:**
- Only attacks when in ATTACK mode
- Damage scales with bond (0.5x to 1.5x multiplier)
- Still always follows player
- Stays alive as long as player is alive

**Why It Matters:** Creat is always present (proves companion identity), but player has strategic control.

### 6. **Interactive Hub (EXPANDED)**
**Before:** Greenwood Clearing was minimal  
**Now:** Proves all core systems in one place

**New Interactables:**
- Feed Station (tests bond mechanic)
- Rest Point (heal station)
- Crown Forge NPC (prepares for forge UI later)
- Restoration Trophy (shows visual trophy of completed restoration)

**Why It Matters:** Player sees what the game IS when they spawn in the hub.

### 7. **Autoload Additions**
**Before:** 7 autoloads  
**Now:** 10 autoloads

**New Autoloads:**
- `RestorationSystem` - restoration state and rewards
- `InteractPromptController` - shows/hides [E] prompts globally
- `CompanionCommands` - manages creat command mode

**Why It Matters:** All core systems globally accessible, no scene setup needed.

### 8. **GameState Expansion**
**Updated:** `scripts/core/game_state.gd`

**Added:**
- `player_position: Vector2` - Used by map system and waypoint calculations
- `discovered_zones: Dictionary` - Tracks which zones player has visited
- `mastered_zones: Dictionary` - Tracks which zones player has beaten

**Why It Matters:** Prep for full map/discovery system (doesn't block MVP, enables future).

---

## 🎯 MVP VERTICAL SLICE FLOW (10-15 minutes)

**Player Starting State:** GreenwoodClearing, Creat following, 5x food_basic in inventory

### Phase 1: Hub Exploration (2-3 min)
1. Walk around Greenwood Clearing
2. See [E] prompts at stations
3. Press E at Feed Station → feed creat → bond increases
4. Press E at Rest Point → full heal
5. See Restoration Trophy placeholder

### Phase 2: First Combat (3-4 min)
1. Walk to WoodedTrail
2. Encounter 2-3 enemies
3. Press Space to attack (aim-to-cursor)
4. Press F to toggle creat command (Follow → Attack)
5. Creat attacks when in ATTACK mode
6. Defeat enemies
7. Gain materials

### Phase 3: Restoration Mini-Loop (3-4 min)
1. Enter RestorationSite_01
2. Clear enemies in arena
3. Interact with material gather point
4. Interact with broken structure
5. Wait 5 seconds for restoration to complete
6. Structure visually changes
7. Get lore item + see daily reward unlocked

### Phase 4: Boss Prep (2-3 min)
1. Return to Greenwood Clearing (or go to Boss Prep Space)
2. Feed creat again
3. Select crown (if UI exists)
4. Choose sync focus
5. Walk to BossArena
6. Fight boss with full resources

### Phase 5: Victory
- Boss defeated
- Return home
- Restoration visible on map (when map system added)
- Can repeat cycle

**Total loop:** ~15 minutes, proves all six core identity systems.

---

## 📋 FILE CHANGES SUMMARY

### **New Files (8)**
```
scripts/world/
  ├── interaction_component.gd       (NEW)
  ├── interactable.gd                (NEW)
  ├── feed_station.gd                (NEW - example interactable)
  ├── rest_point.gd                  (NEW - example interactable)
  └── restoration_structure.gd        (NEW - interactable restoration target)

scripts/ui/
  ├── interact_prompt_controller.gd   (NEW - now autoload)
  └── [more UI coming for prep/restoration]

scripts/actors/companion/
  └── companion_commands.gd           (NEW - now autoload)

scripts/systems/
  └── restoration_system.gd           (NEW - now autoload)

data/
  └── zones.json                      (NEW - complete zone data)
```

### **Updated Files (6)**
```
scripts/actors/player/player.gd
  - Added aim-to-cursor attacks
  - Added interact input handling
  - Added player group for detection
  - Removed hard-coded feed logic

scripts/actors/companion/fire_creat.gd
  - Now checks CompanionCommands mode
  - Only attacks if is_attacking() == true
  - Bond scales damage
  - Added to "allies" group

scripts/ui/hud.gd
  - Shows companion command status
  - Shows creat command prompt (Press F)

scripts/core/game_state.gd
  - Added player_position
  - Added discovered_zones dictionary
  - Added mastered_zones dictionary

project.godot
  - Added 3 new autoloads
  - All now configured and ready

README.md, QUICKSTART.md
  - Updated for new control scheme (aim-to-cursor)
  - Added interactable system explanation
```

---

## 🎮 INPUT MAP (FINAL)

| Input | Action | Purpose |
|-------|--------|---------|
| **W/↑** | move_up | Movement (8-direction) |
| **A/←** | move_left | Movement (8-direction) |
| **S/↓** | move_down | Movement (8-direction) |
| **D/→** | move_right | Movement (8-direction) |
| **Space** / **LMB** | attack | Attack (in aimed direction) |
| **E** | interact | Interact with nearby object |
| **F** | feed | Toggle creat command (Follow/Attack/Defensive) |
| **Shift** | sync | Activate Sync mode (if meter ≥ 80) |
| **Mouse** | aim | Point attacks in aimed direction |

---

## 🏗️ SCENE STRUCTURE READY TO BUILD

### GreenwoodClearing.tscn (EXPAND)
```
GreenwoodClearing (Node2D)
├── ColorRect (background)
├── Player
├── FireCreat
├── HUD (CanvasLayer)
├── FeedStation (Interactable + InteractionComponent)
├── RestPoint (Interactable + InteractionComponent)
├── CrownForgeNPC (Interactable + InteractionComponent)
├── RestorationTrophy (Visual placeholder)
└── ExitMarker
```

### RestorationSite_01.tscn (NEW)
```
RestorationSite_01 (Node2D)
├── ColorRect (background)
├── Arena (combat area with walls)
│   ├── Enemy (x2)
│   └── MaterialGatherPoint (Interactable)
├── BrokenStructure (Interactable + Sprite)
├── RestoredStructure (Sprite - hidden until complete)
├── Player (spawns here)
├── FireCreat
├── HUD (CanvasLayer)
└── RestorationPanel (UI overlay)
```

### BossPrepSpace.tscn (NEW - Interactive Space)
```
BossPrepSpace (Node2D)
├── ColorRect (background)
├── FeedStation (Interactable)
├── CrownEquipStation (Interactable)
├── SyncFocusStation (Interactable)
├── BossGate (Locked interactable - unlocks when ready)
├── Player
├── FireCreat
├── HUD
└── PrepPanel (Shows prepared state)
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Core Systems (Days 1-2) — **MOSTLY DONE**
- [x] InteractionComponent system
- [x] Interactable base class
- [x] InteractPromptController
- [x] CompanionCommands
- [x] RestPlayer aim-to-cursor attacks
- [x] Autoload additions
- [x] zones.json data structure
- [ ] Update existing scenes to use new components

### Phase 2: Hub Identity (Day 3) — **READY TO BUILD**
- [ ] Expand GreenwoodClearing with all interactables
- [ ] Add Feed Station scene + interaction
- [ ] Add Rest Point scene + interaction
- [ ] Add Crown Forge NPC scene + interaction
- [ ] Add Restoration Trophy visual
- [ ] Test all interactions in hub

### Phase 3: Restoration Loop (Day 4) — **READY**
- [ ] Create RestorationSite_01.tscn
- [ ] Add enemies to restoration arena
- [ ] Add MaterialGatherPoint interactable
- [ ] Create RestorationStructure interactable
- [ ] Connect RestorationSystem to UI
- [ ] Test full restoration loop

### Phase 4: Prep Space (Day 5) — **READY**
- [ ] Create BossPrepSpace.tscn
- [ ] Add prep station interactables
- [ ] Connect to SyncSystem (sync focus choice)
- [ ] Add locked gate
- [ ] Test prep flow

### Phase 5: Polish (Day 6+) — **OPTIONAL FOR MVP**
- [ ] Creat command UI polish
- [ ] Interaction prompt improvements
- [ ] Restoration visual feedback
- [ ] Sounds and animations (later)

---

## 🔗 SYSTEM INTEGRATIONS

### InteractionComponent → All Interactables
```
FeedStation.gd → InteractionComponent
└─ on_interact() → BondSystem.increase_bond()

RestPoint.gd → InteractionComponent  
└─ on_interact() → Heal player/creat

RestorationStructure.gd → InteractionComponent
└─ on_interact() → RestorationSystem.start_restoration()
```

### CompanionCommands → FireCreat.gd
```
Player presses F → CompanionCommands.toggle_command()
FireCreat._physics_process() checks CompanionCommands.is_attacking()
If true → attempt_attack() → find enemies → attack
If false → just follow player passively
```

### RestorationSystem → Zone State
```
Player interacts with structure → RestorationSystem.start_restoration()
System counts down 5 seconds → RestorationSystem.completion_completed()
Emits signal → UI updates, item added to inventory, trophy unlocks
```

---

## 🧪 TESTING MVP COMPLETENESS

**When all these work, MVP is FEATURE COMPLETE:**

- [ ] Player spawns in Greenwood Clearing
- [ ] Player can move in 8 directions with WASD
- [ ] Fire Creat follows player 50px behind
- [ ] Player can aim attacks with mouse
- [ ] Player can attack with Space (attacks in aimed direction)
- [ ] Creat only attacks when command is ATTACK (F toggles)
- [ ] Creat damage increases with bond
- [ ] Player can press E at Feed Station to feed creat
- [ ] Bond increases on feeding, HUD shows it
- [ ] Player can press E at Rest Point to fully heal
- [ ] Player can go to Restoration Site
- [ ] Player clears 2 enemies there
- [ ] Player gathers material (E at gather point)
- [ ] Player restores structure (E at structure, waits 5s)
- [ ] Structure visually changes on restore
- [ ] Player gets lore item + daily reward
- [ ] Player can fight boss with full resources
- [ ] Boss fight uses new combat mechanics (aim-to-cursor)
- [ ] Sync mode works (Shift key, 1.5x damage, 1.3x speed)
- [ ] Creat commands work throughout (F toggles attack mode)
- [ ] HUD shows all state (health, bond, hunger, sync, commands)
- [ ] Full 10-15 minute loop completes successfully

---

## 🚀 NEXT IMMEDIATE STEP

**Start with Phase 2: Hub Identity**

1. Open GreenwoodClearing.tscn in Godot editor
2. Add FeedStation node (use Interactable base class + InteractionComponent)
3. Position it and test E key interaction
4. Add RestPoint node
5. Add CrownForgeNPC node (placeholder for now)
6. Test all three in running game

**Time estimate:** 2-3 hours for full hub with all stations interactive.

---

## 📚 REFERENCE DOCUMENTS

- **MVP_REVISED.md** - Full detailed spec with timelines
- **MAPSPEC.md** - Map system design (add after MVP gameplay works)
- **QUICKSTART.md** - How to play (needs update for F key commands)
- **README.md** - Full documentation (updated for aim-to-cursor)

---

## 💡 KEY DESIGN DECISIONS LOCKED IN

✅ **Fire Creat always present** (not summoned/cooldown)  
✅ **Aim-to-cursor attacks** (not 8-directional)  
✅ **Reusable interaction system** (not hard-coded per object)  
✅ **Full restoration loop** (not just a heal bump)  
✅ **Interactive prep** (not menu-driven)  
✅ **Command layer for creat** (Follow/Attack/Defensive)  
✅ **Greenwood as proof-of-identity hub** (not minimal)  

These decisions are now locked into code. Future changes will build on this foundation.

---

## ⚡ QUICK REFERENCE: NEW AUTOLOADS

| Autoload | File | Purpose |
|----------|------|---------|
| RestorationSystem | restoration_system.gd | Tracks restoration state, triggers, rewards |
| InteractPromptController | interact_prompt_controller.gd | Shows [E] prompts globally |
| CompanionCommands | companion_commands.gd | Manages creat command mode (Follow/Attack/Defensive) |

All three are already configured in project.godot and ready to use.

---

**Status:** Ready for implementation  
**Expected Time to MVP:** 5-7 days (if following phase schedule)  
**Expected Time to Playable Demo:** 3-4 days (if cutting corners)
