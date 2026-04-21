# Manual Test Checklist: Egg-Based Opening Flow

## Critical Pre-Test Verification (Do First)

Before running any test cases, verify these 5 things in VS Code:

### 1. Player Truly Starts Alone ✓ CHECK
**What to verify:**
- [ ] No FireCreat node visible in GreenwoodClearing scene hierarchy (should be removed)
- [ ] No companion-only UI appears in opening (check HUD script for early companion stat display)
- [ ] No command prompts visible (F key should do nothing before hatch)
- [ ] Console shows no "FireCreat spawned" message at game start

**If any fail:**
- Search project for hardcoded creat spawns
- Check HUD.gd for companion stat display conditions
- Verify CompanionCommands only works after CREAT_ACTIVE state

---

### 2. Egg Acquisition Only Via Trigger ✓ CHECK
**What to verify:**
- [ ] Egg can only be found at designated trigger zones (400,400 in Combat; 500,400 in Gather)
- [ ] Egg cannot be obtained twice (second trigger in same zone doesn't spawn another egg)
- [ ] Inventory never shows duplicate eggs after multiple triggers
- [ ] State only transitions to EGG_ACQUIRED once

**If any fail:**
- Check EggDiscoveryTrigger.gd has `has_triggered` guard
- Verify CompanionLifecycle.acquire_egg() returns early if state != NO_CREAT
- Check InventorySystem doesn't add duplicate creat_egg items

---

### 3. Bringing Egg Home Transitions Cleanly ✓ CHECK
**What to verify:**
- [ ] Entering GreenwoodClearing with EGG_ACQUIRED state keeps egg in inventory
- [ ] HUD shows "[EGG ACQUIRED]" message, not care stats
- [ ] Interacting with RestPoint transitions to EGG_IN_CARE without errors
- [ ] No softlock (player can still move, interact, exit)

**If any fail:**
- Check scene transition preserves GameState
- Verify RestPoint.on_interact() checks for EGG_ACQUIRED state
- Ensure exit markers and zone transitions work

---

### 4. Creat Systems Locked Until Hatch ✓ CHECK
**What to verify:**
- [ ] F key does nothing before CREAT_ACTIVE (no command cycling)
- [ ] FireCreat node doesn't exist in scene before hatch
- [ ] HUD doesn't show creat stats (Bond/Hunger/Command) before hatch
- [ ] No combat assist or sync benefits apply to creat

**If any fail:**
- Check CompanionCommands._process() for state guard
- Verify HUD.gd uses `if GameState.has_creat` before drawing creat stats
- Confirm FireCreat spawn only happens in complete_hatch()

---

### 5. Hatch Feels Like a Real Moment ✓ CHECK
**What to verify:**
- [ ] HUD clearly shows "[EGG HATCHING]" before creat appears
- [ ] Creat appears on screen at correct position (offset from player)
- [ ] Creat immediately responds to movement (follows player)
- [ ] HUD transitions cleanly to creat stats display
- [ ] Console shows "Creat hatched and active" message

**If any fail:**
- Check HUD displays EGG_HATCHING state
- Verify FireCreat spawns with correct parent and position
- Ensure creat movement code runs immediately

---

## Test Cases

### Test Case 1: Starting Game with No Creat

**Setup:**
1. Delete save file (if exists)
2. Launch game fresh
3. Wait for Boot scene to finish loading

**Expected Result:**
- Boot transitions to ForestTrialsEntrance
- No creat visible on screen
- HUD shows no companion stats
- Two route options visible (Combat/Gather)
- Console shows "CompanionLifecycle initialized: NO_CREAT"

**Failure Cases to Watch:**
- [ ] FireCreat appears at start
- [ ] HUD shows empty creat stats (0 bond, 0 hunger)
- [ ] F key cycles commands (should do nothing)
- [ ] Player starts with creat following
- [ ] Boot.gd doesn't show lifecycle initialization

**Fix if fails:**
- Verify project.godot has CompanionLifecycle in autoload list
- Check Boot.gd routes to ForestTrialsEntrance (not GreenwoodClearing)
- Confirm FireCreat removed from all scenes except as dynamic spawn

---

### Test Case 2a: Choose Combat Route

**Setup:**
1. Start from Test Case 1 (player at ForestTrialsEntrance)
2. Press UP arrow

**Expected Result:**
- Scene transitions to ForestTrials_Combat
- Player visible at position (100, 300) or near there
- Can move with WASD
- HUD visible
- "[EGG ACQUIRED]" not yet shown
- Console shows "Transitioning to zone: res://scenes/world/ForestTrials_Combat.tscn"

**Failure Cases to Watch:**
- [ ] Player not visible (scene didn't spawn Player)
- [ ] Player position wrong (outside viewport)
- [ ] HUD not visible
- [ ] Scene doesn't load (console error)
- [ ] Movement doesn't work (Player script error)

**Fix if fails:**
- Check ForestTrials_Combat.tscn has Player.tscn instance
- Verify player spawn position in scene editor
- Check CharacterMotor2D.handle_movement() works

---

### Test Case 2b: Choose Gather Route

**Setup:**
1. Start from Test Case 1 (player at ForestTrialsEntrance)
2. Press DOWN arrow

**Expected Result:**
- Scene transitions to WoodedTrail
- Player visible at position (100, 300) or near there
- Can move with WASD
- HUD visible
- "[EGG ACQUIRED]" not yet shown
- Console shows "Transitioning to zone: res://scenes/world/WoodedTrail.tscn"

**Failure Cases to Watch:**
- [ ] Player not visible
- [ ] FireCreat visible (creat shouldn't exist yet)
- [ ] Scene doesn't load
- [ ] Movement doesn't work

**Fix if fails:**
- Check WoodedTrail.tscn has Player but NOT FireCreat
- Verify player spawn position
- Check _ready() doesn't spawn creat early

---

### Test Case 3: Discovering the Egg

**Setup:**
1. Complete Test Case 2a (at ForestTrials_Combat)
2. Walk toward egg trigger at (400, 400)
3. Enter the Area2D collision

**Expected Result:**
- Player position shows near (400, 400)
- HUD changes to show "[EGG ACQUIRED]"
- Subtitle or label appears: "You discovered a creat egg!"
- Console shows "Egg acquired: fire_creat"
- Inventory now contains "creat_egg_fire_creat": 1
- Can still move and interact normally

**Failure Cases to Watch:**
- [ ] Egg trigger never fires (area collision not set up)
- [ ] HUD doesn't change
- [ ] Inventory doesn't show egg
- [ ] Egg trigger fires multiple times (has_triggered guard not working)
- [ ] Console shows error in egg_discovery_trigger.gd
- [ ] Scene crashes or softlocks

**Fix if fails:**
- Check EggDiscoveryTrigger has Area2D with proper collision shape
- Verify trigger position matches scene design
- Check CompanionLifecycle.acquire_egg() is called
- Ensure trigger only fires once (has_triggered = true guard)

---

### Test Case 4: Returning Home with Egg

**Setup:**
1. Complete Test Case 3 (player has egg, "[EGG ACQUIRED]" in HUD)
2. Walk to ExitMarker at (50, 360)
3. Press E or auto-exit triggers zone change
4. Wait for GreenwoodClearing to load

**Expected Result:**
- Scene transitions to GreenwoodClearing
- Player visible at spawn position
- HUD still shows "[EGG ACQUIRED]"
- Player can move normally
- No creat visible yet
- Console shows zone transition message

**Failure Cases to Watch:**
- [ ] Player doesn't spawn in new zone
- [ ] HUD loses egg state (shows blank)
- [ ] GameState doesn't persist (egg disappears)
- [ ] Player spawns off-screen
- [ ] Creat somehow appears early
- [ ] Scene transition fails

**Fix if fails:**
- Check SceneRouter.go_to_zone() changes scene correctly
- Verify GameState persists as autoload
- Check GreenwoodClearing._ready() doesn't spawn creat if not CREAT_ACTIVE
- Ensure player spawn position is set in scene

---

### Test Case 5: Entering Egg Care State

**Setup:**
1. Complete Test Case 4 (player in GreenwoodClearing with egg)
2. Walk to RestPoint at (550, 450)
3. See "[E] Rest" prompt
4. Press E to interact

**Expected Result:**
- State changes from EGG_ACQUIRED to EGG_IN_CARE
- HUD shows "[EGG IN CARE]"
- HUD shows "Neglect: 0%" (or close to 0)
- HUD shows "Hatch in: ~300 seconds" (or configured duration)
- Console shows "Beginning egg care: fire_creat"
- Player can move normally, interact continues to work

**Failure Cases to Watch:**
- [ ] E key doesn't work (interaction not firing)
- [ ] State doesn't change (RestPoint doesn't call begin_care())
- [ ] HUD shows blank or wrong message
- [ ] Neglect timer starts negative
- [ ] Hatch timer shows wrong duration
- [ ] Scene softlocks (can't move/interact)

**Fix if fails:**
- Check RestPoint.on_interact() checks for EGG_ACQUIRED state
- Verify CompanionLifecycle.begin_care() is called
- Check HUD displays neglect and hatch time correctly
- Ensure timers initialize properly (neglect = 0, hatch_progress = 0)

---

### Test Case 6: Feeding and Neglect Behavior

**Setup:**
1. Complete Test Case 5 (player in EGG_IN_CARE)
2. Walk to FeedStation at (400, 450)
3. See "[E] Feed Creat" prompt
4. Press E to feed

**Expected Result (First Feed):**
- Neglect decreases (from ~0% to maybe -5%, clamped to 0%)
- HUD updates to show new neglect value
- Console shows "Fed egg. Neglect reduced to: <value>"
- Bond XP increases (console or HUD)
- Player can interact again immediately

**Expected Result (Repeated Feeds):**
- Each feed reduces neglect by ~20% (configurable)
- Neglect can't go below 0% (clamped)
- HUD updates each time
- Multiple feeds stack

**Expected Result (No Feeding for 10+ seconds):**
- Neglect slowly increases over time
- HUD neglect % increases continuously
- Rate is slow enough to see but noticeable (should reach ~5-10% after 10 seconds)

**Failure Cases to Watch:**
- [ ] E key doesn't work at FeedStation
- [ ] Neglect doesn't decrease
- [ ] Neglect goes negative (no clamp)
- [ ] HUD doesn't update
- [ ] Feeding doesn't call add_bond_xp()
- [ ] Can't feed again immediately (cooldown issue)
- [ ] Neglect doesn't increase when not feeding

**Fix if fails:**
- Check FeedStation.on_interact() checks for EGG_IN_CARE state
- Verify CompanionLifecycle.feed_egg() reduces neglect
- Ensure neglect is clamped to [0, 100]
- Check _process() delta is applied to neglect_timer
- Verify add_bond_xp() is called

---

### Test Case 7: Hatch Progress and Hatching Transition

**Setup:**
1. Complete Test Case 6 (player in EGG_IN_CARE, fed egg)
2. Move near FeedStation to have egg visible in HUD
3. Watch HUD hatch timer
4. Wait for timer to reach 0

**Expected Result (First 4 minutes):**
- Hatch timer counts down steadily (~1 second per second)
- Timer shows values like "299s", "250s", "100s"
- Neglect timer slowly increases (~0.5% per second) if not feeding

**Expected Result (Last 10 seconds):**
- HUD still shows "[EGG IN CARE]"
- Timer showing "10s", "5s", "1s", "0s"

**Expected Result (At 0 seconds/Hatching):**
- HUD changes to "[EGG HATCHING]"
- Brief pause (< 1 second)
- FireCreat appears on screen offset from player (+50px to the right)
- Creat is clearly visible and distinct from player
- HUD transitions to show:
  - [ ] Bond: <percentage>%
  - [ ] Hunger: <value>
  - [ ] Command: [FOLLOW] (or default command)
- Console shows "Creat hatched and active: fire_creat"
- Console shows "Fire Creat spawned and ready to follow"

**Failure Cases to Watch:**
- [ ] Timer doesn't count down
- [ ] Timer counts too fast or too slow
- [ ] HUD doesn't show hatching message
- [ ] Creat doesn't spawn
- [ ] Creat spawns at wrong position (overlapping player or off-screen)
- [ ] HUD doesn't transition (still shows neglect/hatch time)
- [ ] Creat is invisible (sprite issue)
- [ ] Creat spawns multiple times
- [ ] Console shows errors during spawn

**Fix if fails:**
- Check CompanionLifecycle._process() applies delta to hatch_progress
- Verify begin_hatching() transitions state
- Check _spawn_creat_companion() finds correct scene root
- Ensure FireCreat.tscn loads and instantiates
- Verify creat parent is set correctly
- Check HUD checks GameState.has_creat before drawing creat stats

---

### Test Case 8: Unlocking Creat Systems Only After Hatch

**Setup:**
1. Complete Test Case 7 (creat hatched, visible on screen)
2. Test each system immediately after hatch

**Expected Result - F Key Commands:**
- Press F → creat command cycles
- HUD shows "Command: [ATTACK]"
- Press F again → "Command: [DEFENSIVE]"
- Press F again → "Command: [FOLLOW]"
- Cycling works smoothly

**Expected Result - Creat Following:**
- Move player with WASD
- Creat follows behind player
- Distance maintained at ~50px
- Movement is smooth, not jerky
- Creat doesn't get stuck

**Expected Result - HUD Display:**
- Shows Bond: <percentage>%
- Shows Hunger: <value>
- Shows Command: [FOLLOW/ATTACK/DEFENSIVE]
- Values update when commands change or stats change

**Expected Result - Commands Actually Work:**
- Switch to ATTACK mode
- Creat enters attack stance/behavior (if enemies present)
- Switch to FOLLOW mode
- Creat returns to passive following
- Switch to DEFENSIVE mode
- Creat changes behavior

**Failure Cases to Watch:**
- [ ] F key doesn't work (no command cycling)
- [ ] F key worked BEFORE hatch (command system should be locked)
- [ ] HUD command display doesn't update
- [ ] Creat doesn't follow player
- [ ] Creat position is locked (doesn't move with player)
- [ ] Creat follows but is jittery or teleporting
- [ ] Commands are visible in HUD but don't affect creat behavior

**Fix if fails:**
- Check CompanionCommands._process() input check
- Verify CompanionCommands guarded by state check (not just during EGG_IN_CARE)
- Check HUD draws creat stats only if GameState.has_creat
- Verify FireCreat._physics_process() checks CompanionCommands.is_attacking()
- Ensure creat movement code is active post-hatch

---

### Test Case 9: Preventing Duplicate Egg Acquisition

**Setup:**
1. Start new game (Test Case 1)
2. Choose route and find egg (Test Case 3)
3. Return to trial zone
4. Walk to same egg trigger again

**Expected Result:**
- Walking into egg trigger again does NOT give another egg
- HUD still shows "[EGG ACQUIRED]" (no change)
- Inventory still shows only 1 creat_egg
- Console does NOT show "Egg acquired" message again

**Alternative Setup (Different Routes):**
1. Start new game, choose Combat route, find egg
2. Find way to access Gather route without hatching
3. Try to find egg on Gather route

**Expected Result:**
- Even if both routes have egg triggers, second trigger doesn't fire
- Only one egg ever acquired per game

**Failure Cases to Watch:**
- [ ] Second egg trigger fires and adds duplicate egg
- [ ] Inventory shows "creat_egg": 2
- [ ] State reverts from CREAT_ACTIVE back to EGG_ACQUIRED
- [ ] Egg triggers with has_triggered guard not working

**Fix if fails:**
- Check EggDiscoveryTrigger has has_triggered flag
- Verify has_triggered = true after first trigger
- Check CompanionLifecycle.acquire_egg() rejects if state != NO_CREAT
- Ensure trigger only fires once per scene instance

---

### Test Case 10: Preventing Companion UI/Actions Before Hatch

**Setup:**
1. Start new game (Test Case 1)
2. At ForestTrialsEntrance (no egg yet)

**Expected Result - Pre-Egg:**
- HUD shows no egg message or companion stats
- F key does nothing (no output)
- No prompt for creat commands

**Setup (Continued):**
1. Choose route and find egg (Test Case 3)
2. At trial zone with "[EGG ACQUIRED]"

**Expected Result - Post-Egg, Pre-Care:**
- HUD shows "[EGG ACQUIRED]" message
- F key does nothing (creat doesn't exist yet)
- No creat stats visible
- No bond/hunger/command display

**Setup (Continued):**
1. Return home and enter care (Test Case 5)
2. At GreenwoodClearing with "[EGG IN CARE]"

**Expected Result - During Care:**
- HUD shows egg care stats (neglect, hatch time)
- F key does nothing (creat not hatched yet)
- No creat stats visible
- No command display

**Setup (Continued):**
1. Wait for egg to hatch (Test Case 7)

**Expected Result - Post-Hatch:**
- HUD transitions to show creat stats
- F key now works (cycles commands)
- Command display appears and updates

**Failure Cases to Watch:**
- [ ] F key works before hatch
- [ ] Creat stats visible before hatch
- [ ] Command prompts appear too early
- [ ] HUD shows mixed egg and creat stats
- [ ] UI flickers between egg and creat display
- [ ] Any companion-only actions available pre-hatch

**Fix if fails:**
- Audit HUD.gd for all state checks
- Verify all CompanionCommands guarded by CREAT_ACTIVE check
- Check no creat interactions available before hatch
- Ensure egg UI and creat UI are mutually exclusive

---

## Quick Verification Checklist

Use this during testing to track what's working:

```
PRE-TEST VERIFICATION:
- [ ] Player starts alone (no creat visible)
- [ ] Egg acquisition only via trigger
- [ ] Bringing egg home works
- [ ] Creat systems locked until hatch
- [ ] Hatch feels like a real moment

TEST CASES:
- [ ] Test Case 1: Starting with no creat
- [ ] Test Case 2a: Combat route
- [ ] Test Case 2b: Gather route
- [ ] Test Case 3: Egg discovery
- [ ] Test Case 4: Returning home
- [ ] Test Case 5: Entering care
- [ ] Test Case 6: Feeding and neglect
- [ ] Test Case 7: Hatch progression
- [ ] Test Case 8: Creat systems unlock
- [ ] Test Case 9: Duplicate egg prevention
- [ ] Test Case 10: Pre-hatch UI lock

SUMMARY:
Total Passed: __/15
Total Failed: __/15
```

---

## MVP Approximation Note

⚠️ **Important:** This test checklist validates the MVP simplification:

**MVP Simplification (This Test):**
- Combat route vs Gather route (2 choices)
- Single egg per route

**Final Canon Design (Future):**
- Easy/Medium/Hard difficulty paths in Forest Trials
- Home base alternate low-risk path
- More nuanced route complexity

**For now:** This testing validates the MVP prototype works. Don't let successful MVP testing rewrite the actual design intent. The routes are a proof-of-concept, not the final structure.

---

## How to Use This Checklist

1. **Before testing:** Read "Critical Pre-Test Verification" and spot-check those 5 things
2. **During testing:** Work through test cases in order
3. **On each failure:** Note which "Failure Cases to Watch" matched your observation
4. **After failure:** Use "Fix if fails" section for debugging approach
5. **Completion:** All 10 test cases passing = MVP opening flow is solid

## What Success Looks Like

✅ Player starts alone, discovers egg through choice, brings it home, cares for it, and creat hatches as a meaningful moment.

❌ False completeness: Creat present at start, egg auto-given, systems accessible early, hatch is silent.
