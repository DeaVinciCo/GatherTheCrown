# Critical Bugs Fixed - First Pass

## Bugs Fixed

### 1. ✅ Creat Never Hatches (CRITICAL)
**Problem:** When hatch_progress reached 1.0, it called `begin_hatching()` which transitioned to EGG_HATCHING state, but `complete_hatch()` was never called, so creat never spawned.

**Fix:** Added auto-transition in _process(): when state == EGG_HATCHING, immediately calls `complete_hatch()` to spawn creat.

**File:** `scripts/systems/companion_lifecycle.gd`
**Impact:** Creat now spawns automatically when egg reaches hatch progress 100%

---

### 2. ✅ Creat Spawn Fails (CRITICAL)
**Problem:** `_spawn_creat_companion()` tried to add creat to `get_tree().get_first_child_in_group("world_root")` but scenes don't have a "world_root" node, causing runtime error.

**Fix:** Changed to:
- Get current scene from `get_tree().root.get_child(get_tree().root.get_child_count() - 1)`
- Find Player node in that scene
- Use Player's global_position for spawn offset
- Fall back to GameState.player_position if Player not found

**File:** `scripts/systems/companion_lifecycle.gd`
**Impact:** Creat now spawns at correct location without errors

---

### 3. ✅ Player Position Never Updated (HIGH)
**Problem:** GameState.player_position was used for creat spawning but never updated in Player._process(), so it would use stale or default position.

**Fix:** Added line to Player._process() to update GameState.player_position every frame.

**File:** `scripts/actors/player/player.gd`
**Impact:** Creat spawns at correct player location, not default

---

### 4. ✅ Trial Zones Don't Spawn Player (CRITICAL)
**Problem:** ForestTrials_Combat didn't instantiate Player, so when transitioning from ForestTrialsEntrance, player would disappear.

**Fix:** Added Player.tscn and HUD.tscn instances to ForestTrials_Combat scene at spawn position.

**File:** `scenes/world/ForestTrials_Combat.tscn`
**Impact:** Player is visible in combat trial zone

---

### 5. ✅ Creat Present Before Hatching (HIGH)
**Problem:** WoodedTrail scene had FireCreat spawned at startup, but creat shouldn't exist until egg hatches.

**Fix:** Removed FireCreat.tscn instance from WoodedTrail.tscn scene.

**File:** `scenes/world/WoodedTrail.tscn`
**Impact:** No creat visible during gathering route (correct identity preservation)

---

### 6. ✅ No Egg Discovery in Trials (CRITICAL)
**Problem:** Trial zones had no egg discovery triggers, so player couldn't get egg.

**Fix:** Created `EggDiscoveryTrigger.tscn` scene with Area2D and egg discovery script. Added instances to both ForestTrials_Combat and WoodedTrail at egg locations (400,400) and (500,400).

**Files:** 
- `scenes/world/EggDiscoveryTrigger.tscn` (new)
- `scenes/world/ForestTrials_Combat.tscn` (added trigger)
- `scenes/world/WoodedTrail.tscn` (added trigger)

**Impact:** Egg can now be discovered during early routes

---

## What Still Needs Verification

### Must Test (CRITICAL)
1. ✓ Game starts, shows ForestTrialsEntrance
2. ? UP arrow loads ForestTrials_Combat with Player visible
3. ? DOWN arrow loads WoodedTrail with Player visible
4. ? Player can move (WASD) in trial zones
5. ? Entering egg trigger shows "[EGG ACQUIRED]" in HUD
6. ? Pressing E near RestPoint at GreenwoodClearing triggers care
7. ? HUD shows "[EGG IN CARE]" with neglect and hatch time
8. ? Pressing E near FeedStation feeds egg, reduces neglect
9. ? Waiting ~5 seconds, egg hatches, creat spawns
10. ? HUD transitions to show creat stats (Bond, Hunger, Command)

### Should Test (HIGH)
- [ ] Player can exit trial zone back to Greenwood (ExitMarker setup)
- [ ] Creat follows player around GreenwoodClearing after hatch
- [ ] F key toggles creat commands (Follow/Attack/Defensive)
- [ ] HUD command display updates with F key
- [ ] Neglect increases over time even after feeding
- [ ] Egg dies if neglected too long
- [ ] Interactions with other stations work (Forge, etc.)

### Known Limitations (For Later)
- No enemies in trial zones yet (combat testing deferred)
- No actual restoration loop yet (placeholder scenes only)
- No boss fights yet
- No crown forge crafting yet
- Input actions using engine defaults (ui_up, ui_down) - could standardize to custom actions

---

## Remaining Known Issues

### Zone Transition Architecture
**Current limitation:** When changing zones, the old scene is destroyed. Player sprite persists but might lose references.

**Mitigation:** Each zone instances its own Player from Player.tscn at spawn position. This works but means Player position between zones is not automatically preserved. ExitMarker and spawn position mapping needed.

**Future:** Could implement persistent Player node that doesn't get destroyed on zone change, but that's more complex.

### Creat Persistence Through Zone Changes
**Current status:** After creat hatches, if player changes zones, creat is lost because it was added to the old scene.

**Needed:** Creat should persist or re-spawn in new zones based on CompanionLifecycle.CREAT_ACTIVE state.

**Suggested fix:** In each zone's _ready(), if CompanionLifecycle.CREAT_ACTIVE, spawn FireCreat at player location.

---

## Priority for Next Fixes

1. **CRITICAL** - Test the basic flow (start → route → egg → home → care → hatch)
2. **HIGH** - Fix creat persistence through zone transitions
3. **HIGH** - Verify all input actions work
4. **MEDIUM** - Add exit/return logic to trial zones
5. **MEDIUM** - Test neglect and hatch timing
6. **LOW** - Add placeholder enemies to trials
7. **LOW** - Polish UI feedback

---

## Test Scenario: Full Happy Path

1. Start game
2. See ForestTrialsEntrance with "Choose your path" text
3. Press UP → loads ForestTrials_Combat
4. Press E to show instructions, walk around
5. Hit egg trigger at (400, 400) → see "[EGG ACQUIRED]" in HUD
6. Walk to ExitMarker at (50, 360), maybe press E or auto-exit
7. Load GreenwoodClearing, player alone
8. Walk to RestPoint at (550, 450)
9. See "[E] Rest" prompt
10. Press E → state changes to "[EGG IN CARE]"
11. Walk to FeedStation at (400, 450)
12. Press E → see neglect decrease, "Fed egg" in console
13. Wait ~5 seconds watching HUD
14. See "[EGG HATCHING]"
15. See FireCreat spawn at (player.x + 50, player.y)
16. Press F → creat command changes FOLLOW → ATTACK → DEFENSIVE
17. HUD shows "Command: [ATTACK]" etc.
18. SUCCESS - Full egg discovery loop works!
