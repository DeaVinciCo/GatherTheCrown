# Playable Slice Verification Checklist

## 1. Core Movement and Combat

### Player Movement (WASD)
- **What should happen:** Player moves smoothly in 4 directions with mouse aim for attacks
- **How to test:** 
  - Press W/A/S/D and verify player moves
  - Move mouse and verify aim direction updates
  - Hold multiple keys and verify diagonal movement
- **Passing criteria:** Smooth movement, no stuttering, mouse follows cursor
- **Failure cases to watch:**
  - Player doesn't move (CharacterMotor2D not connected)
  - Movement speed is 0 or unreasonably fast/slow
  - Aim direction doesn't update with mouse movement
  - Player gets stuck on edges

### Aim-to-Cursor Attack
- **What should happen:** Space bar fires attack in direction of mouse cursor
- **How to test:**
  - Point cursor in different directions
  - Press Space and verify attack goes toward cursor
  - Check damage calculation includes sync bonus if active
- **Passing criteria:** Attack fires toward cursor, cooldown works (can't spam), damage varies by sync
- **Failure cases to watch:**
  - Attack doesn't fire (input not connected)
  - Attack always goes same direction (aim_direction not updating)
  - Cooldown is 0 (can spam infinitely)
  - Damage is hardcoded same value (sync bonus not applied)

### Combat Range & Collision
- **What should happen:** Attacks hit enemies within range; no clipping through walls
- **How to test:**
  - Fire attack at close enemy vs far enemy
  - Walk into walls in trial zones
- **Passing criteria:** Range works correctly, collision prevents clipping
- **Failure cases to watch:**
  - Hitbox size wrong (too big or too small)
  - No collision detection
  - Player can walk through boundaries

---

## 2. Creat Behavior and Commands

### Creat Not Present Until Hatched
- **What should happen:** No FireCreat visible at game start or in GreenwoodClearing before egg hatches
- **How to test:**
  - Start game, check no creat appears
  - Get egg, go to RestPoint, don't feed/wait
  - Verify creat doesn't spawn yet
- **Passing criteria:** No creat visible until lifecycle state = CREAT_ACTIVE
- **Failure cases to watch:**
  - FireCreat spawns at startup (removed from scene but still in GreenwoodClearing)
  - Creat appears before egg hatches
  - Scene referencing deleted/moved nodes

### Creat Following Behavior (After Hatch)
- **What should happen:** Creat follows player at ~50 pixel distance, always in sync
- **How to test:**
  - After creat hatches, move player around
  - Verify creat maintains distance and follows smoothly
  - Change zones and verify creat persists
- **Passing criteria:** Creat always visible, smooth following, no lag spikes
- **Failure cases to watch:**
  - Creat doesn't follow (follow_distance = 0 or player reference null)
  - Creat lags behind (movement_speed too low)
  - Creat doesn't persist through scene changes (not persisted by lifecycle)
  - Creat gets stuck on obstacles (no pathfinding)

### Creat Commands (Follow/Attack/Defensive)
- **What should happen:** F key toggles 3 command modes; creat behavior changes; HUD shows current mode
- **How to test:**
  - Press F repeatedly, verify cycle: FOLLOW → ATTACK → DEFENSIVE → FOLLOW
  - In ATTACK mode near enemy, verify creat attacks
  - In FOLLOW mode with enemy, verify creat doesn't attack
  - Check HUD shows current command name
- **Passing criteria:** F toggles correctly, creat responds to mode, HUD updates
- **Failure cases to watch:**
  - F key doesn't work (input not mapped)
  - Commands cycle but creat behavior doesn't change
  - HUD shows wrong command or doesn't update
  - Fire attack not respecting command mode check

### Creat Attacking in Combat
- **What should happen:** In ATTACK mode, creat finds nearest enemy within range and deals damage scaled by bond
- **How to test:**
  - Spawn enemy near creat
  - Enter ATTACK mode
  - Verify creat attacks nearest enemy
  - Check damage is higher with higher bond value
- **Passing criteria:** Creat targets correctly, damage scales with bond, attacks have cooldown
- **Failure cases to watch:**
  - No enemies detected (group registration missing)
  - Attacks don't damage (target.Health node not found)
  - Damage always same (bond multiplier not applied)
  - Attacks spam instantly (cooldown = 0)
  - Wrong target selected (nearest distance calculation broken)

---

## 3. Interaction System

### Interaction Prompt Visibility
- **What should happen:** [E] prompt appears when player approaches interactive objects; disappears when away
- **How to test:**
  - Walk toward FeedStation/RestPoint/etc
  - Verify [E] prompt appears at ~50 pixel range
  - Walk away and verify prompt disappears
- **Passing criteria:** Prompt shows/hides based on distance
- **Failure cases to watch:**
  - Prompt never appears (InteractPromptController not connected)
  - Prompt doesn't disappear (Area2D signals not firing)
  - Range is wrong (interaction_range incorrect)
  - Prompt position is off-screen

### Interaction Execution
- **What should happen:** Press E near interactive object → runs `on_interact()` on that object
- **How to test:**
  - Stand near FeedStation, press E → should call feed logic
  - Stand near RestPoint, press E → should call rest logic
  - Verify feedback (HUD update, inventory change, etc.)
- **Passing criteria:** Correct interaction runs, no errors in console
- **Failure cases to watch:**
  - E doesn't work (input not connected)
  - Wrong interaction runs (InteractionComponent targeting wrong object)
  - Interaction runs multiple times (no state guard)
  - No feedback (EventBus.hud_updated not emitted)

### Reusable Interaction Component
- **What should happen:** Same InteractionComponent logic works for all object types (Feed, Rest, Forge, Gather, etc.)
- **How to test:**
  - Place same InteractionComponent on different object types
  - Verify each runs its own `on_interact()` method
  - Check that component doesn't contain object-specific logic
- **Passing criteria:** Component is truly generic; all customization in derived classes
- **Failure cases to watch:**
  - Component has hardcoded "if this is FeedStation" logic
  - Component calls wrong parent method
  - Component has spaghetti interdependencies

---

## 4. Restoration Loop (Egg Care Phase)

### Egg Acquisition
- **What should happen:** Player enters trial zone → egg discovered → HUD shows [EGG ACQUIRED] → egg in inventory
- **How to test:**
  - Start game, select route, enter trial zone
  - Verify HUD changes to [EGG ACQUIRED]
  - Check inventory has "creat_egg_fire_creat" item
- **Passing criteria:** Egg appears in inventory, state changes, HUD updates
- **Failure cases to watch:**
  - Egg discovery trigger doesn't fire (Area2D not detecting player)
  - State doesn't change (CompanionLifecycle.acquire_egg() not called)
  - Inventory doesn't add egg item
  - HUD still shows normal state

### Egg Care Initialization (at RestPoint)
- **What should happen:** Player brings egg home, interacts with RestPoint → care begins → HUD shows [EGG IN CARE] with neglect/hatch time
- **How to test:**
  - Get egg, go to GreenwoodClearing, interact with RestPoint
  - HUD should show [EGG IN CARE], neglect %, hatch time remaining
  - Verify neglect starts at 0, hatch progress at 0
- **Passing criteria:** State changes to EGG_IN_CARE, timers initialize, HUD displays correctly
- **Failure cases to watch:**
  - RestPoint doesn't recognize egg state (check for EGG_ACQUIRED state)
  - State doesn't change to EGG_IN_CARE
  - Timers initialize wrong (neglect should start ~0, hatch_progress ~0)
  - HUD shows wrong values or doesn't update

### Egg Feeding (at FeedStation)
- **What should happen:** Player interacts with FeedStation while egg in care → neglect reduced → HUD updates → bond XP added
- **How to test:**
  - Egg in care mode
  - Interact with FeedStation
  - Check neglect decreased (should be -20 or similar)
  - Verify bond increased
  - Repeat multiple times, watch neglect approach 0
- **Passing criteria:** Neglect reduction works, bond XP granted, multiple feeds stack
- **Failure cases to watch:**
  - FeedStation doesn't check for EGG_IN_CARE state
  - Neglect doesn't decrease (feed_reduces_neglect not applied)
  - Neglect goes negative (no max() clamp)
  - Bond XP not added (BondSystem.add_bond_xp() not called)
  - HUD doesn't update after feeding

### Egg Neglect Progression
- **What should happen:** Over time, neglect increases if egg not fed; reaches threshold → egg dies
- **How to test:**
  - Egg in care mode, DON'T feed
  - Wait and watch HUD neglect % increase
  - Let it reach 100% and verify egg dies (state → NO_CREAT, egg_died signal)
- **Passing criteria:** Neglect increases ~0.5/sec, dies at 100%, can be prevented by feeding
- **Failure cases to watch:**
  - Neglect doesn't increase (delta not applied in _process)
  - Neglect increases too fast (delta multiplier wrong)
  - Egg doesn't die at threshold
  - No warning signal before death

### Egg Hatch Progression
- **What should happen:** Over time, hatch_progress increases; at 100% egg enters HATCHING state
- **How to test:**
  - Egg in care, feed occasionally to keep neglect low
  - Watch HUD hatch time decrease
  - Wait until time = 0, verify state changes to EGG_HATCHING
- **Passing criteria:** Progress advances ~1sec/sec, reaches 100% within hatch_duration
- **Failure cases to watch:**
  - Hatch progress doesn't increase (delta not applied)
  - Progress increases too fast/slow (duration calculation wrong)
  - State doesn't change to HATCHING at 100%
  - Time remaining shows negative values (no max(0.0))

### Egg Hatching → Creat Spawning
- **What should happen:** When state = CREAT_ACTIVE, FireCreat spawns at player position+50px, HUD shows creat stats
- **How to test:**
  - Let egg progress to 100%, verify creat spawns on screen
  - Check creat position is offset from player (not at exact center)
  - Verify HUD now shows Bond/Hunger/Command instead of egg state
- **Passing criteria:** Creat visible, positioned correctly, HUD transitions to creat stats
- **Failure cases to watch:**
  - Creat doesn't spawn (FireCreat.tscn path wrong or _spawn_creat_companion not called)
  - Creat spawns at wrong position (global_position calc wrong)
  - Creat spawns but immediately disappears (parent not set correctly)
  - HUD doesn't transition to creat display

---

## 5. Pre-Battle Preparation Loop

### Prep Space Access
- **What should happen:** Player can reach BossPrepSpace; can move around, interact with stations
- **How to test:**
  - Travel to prep space (or spawn directly in it)
  - Walk around, verify movement works
  - Check no enemies spawn
- **Passing criteria:** Space loads, player can move, clean environment
- **Failure cases to watch:**
  - Space doesn't load (scene path wrong in SceneRouter)
  - Player spawns off-screen
  - Enemies spawn accidentally
  - FPS drops (over-complex scene)

### Interactive Prep Stations (Placeholder)
- **What should happen:** Prep space has interactive stations for bond check, command selection, etc.
- **How to test:**
  - Approach each station
  - Verify [E] prompts appear
  - Interact and check for feedback
- **Passing criteria:** Stations interact correctly, show relevant info
- **Failure cases to watch:**
  - Prompts don't appear (Area2D setup wrong)
  - Interactions don't work (on_interact methods missing)
  - Stations don't show relevant info (hardcoded data)

### Creat Present & Responsive in Prep
- **What should happen:** Creat follows in prep space; commands can be toggled; HUD shows status
- **How to test:**
  - Creat visible in prep space
  - Press F to change commands
  - Verify creat doesn't attack (no enemies)
  - HUD shows bond, hunger, current command
- **Passing criteria:** Creat present, commands work, HUD accurate
- **Failure cases to watch:**
  - Creat doesn't follow into prep space (scene transition bug)
  - F key doesn't work
  - HUD shows wrong values

---

## 6. Crown Forge Loop (Placeholder)

### Forge Station Access
- **What should happen:** Player can reach forge NPC at home base; can interact
- **How to test:**
  - In GreenwoodClearing, approach CrownForgeNPC
  - Verify [E] prompt appears
  - Press E and check for feedback
- **Passing criteria:** Station loads, prompt shows, interaction works
- **Failure cases to watch:**
  - NPC not in scene (not placed in GreenwoodClearing.tscn)
  - Prompt doesn't appear
  - Interaction fails silently

### Crown Turn-In (Simple Placeholder)
- **What should happen:** Interact with forge, consume crown item, gain simple reward
- **How to test:**
  - Add crown to inventory via console/cheats
  - Interact with forge
  - Crown should be consumed, reward granted
- **Passing criteria:** Crown removed from inventory, reward visible in HUD
- **Failure cases to watch:**
  - Crown not consumed (inventory remove not called)
  - Reward not granted (reward logic empty)
  - No feedback to player

---

## 7. Scene Persistence and State Saving

### State Persists Through Zone Transitions
- **What should happen:** When player travels between zones, GameState values persist (egg in care, bond level, inventory, etc.)
- **How to test:**
  - Get egg, feed it to level bond
  - Travel to different zone and back
  - Verify egg state unchanged, bond same, inventory same
- **Passing criteria:** All state values preserved across transitions
- **Failure cases to watch:**
  - State resets on zone change (not using persistent autoloads)
  - Creat disappears on transition (scene transition doesn't spawn creat)
  - Inventory clears
  - Neglect timer resets

### Creat Persists Through Zone Transitions
- **What should happen:** After hatch, FireCreat follows through all zone changes; never despawns
- **How to test:**
  - Hatch creat
  - Move between zones multiple times
  - Verify creat always present, in sync with player
- **Passing criteria:** Creat visible in every zone, maintains following behavior
- **Failure cases to watch:**
  - Creat doesn't transition (not created with proper scene persistence)
  - Creat spawns multiple times on transition (instantiate called twice)
  - Creat loses player reference (player node not found in new scene)
  - Creat stuck at old position (global_position not updated)

### Player Position Persists
- **What should happen:** When player travels between zones, spawn position matches exit point
- **How to test:**
  - Walk to edge of zone, transition out
  - Reenter zone, verify player spawned at correct location
- **Passing criteria:** Spawn positions line up (ExitMarker → entry point mapping)
- **Failure cases to watch:**
  - Player spawns at default position (not using GameState.player_position)
  - ExitMarkers not set up in scenes
  - Zone entry logic ignores player position

### Game Can Be Saved and Loaded (Deferred for MVP)
- **What should happen:** F5 saves, F9 loads; all state restored
- **How to test:** (For later MVP iteration)
- **Passing criteria:** Full state serialization works
- **Failure cases to watch:** (For later)

---

## Quick Status Check Commands

Run these in the Godot console to verify state:

```gdscript
# Check creat state
print("Lifecycle state: ", CompanionLifecycle.get_state_name())
print("Has creat: ", GameState.has_creat)
print("Creat egg type: ", GameState.creat_egg_type)

# Check egg care metrics
print("Neglect: ", CompanionLifecycle.get_neglect_percentage(), "%")
print("Hatch time remaining: ", CompanionLifecycle.get_hatch_time_remaining(), "s")

# Check inventory
print("Inventory: ", InventorySystem.get_all_items())

# Check creat command
print("Creat command: ", CompanionCommands.get_command_name())
```

---

## Priority Order for Fixes

1. **CRITICAL** - Creat doesn't spawn after hatch (will block entire vertical slice)
2. **CRITICAL** - Egg lifecycle states not transitioning (core mechanic broken)
3. **CRITICAL** - Player movement doesn't work (can't play at all)
4. **HIGH** - Interactions don't fire (can't feed/rest egg)
5. **HIGH** - Creat doesn't follow (obvious visual bug)
6. **MEDIUM** - Commands don't work (still playable, just limited)
7. **MEDIUM** - Persistence broken (can't test full loops)
8. **LOW** - HUD doesn't update (still can see manually)

---

## How to Use This Checklist

1. **Before Testing:** Copy this file and check off working items as you verify them
2. **During Testing:** For each failure, note which "failure cases" match your observation
3. **For Fixing:** Prioritize by the "Priority Order" section above
4. **Document Results:** Keep notes on what worked vs. what needs fixing
