# NOW Phase — Complete Game Loop Test Guide

**Objective:** Verify the full game loop works end-to-end without crashes.  
**Expected Duration:** 10-15 minutes  
**Success Criteria:** Boot → CharacterCreation → Route → Egg → Home completes without errors

---

## Pre-Test Checklist

- [ ] GatherTheCrown project is open in Godot
- [ ] All scripts and scenes are saved
- [ ] No uncommitted changes
- [ ] Terminal/debug output is visible

---

## Test Sequence

### Step 1: Boot the Game

1. Click **Run** (or press F5) to start the game
2. You should see:
   - Godot splash screen
   - Boot scene loads
   - CharacterCreation screen appears with input fields
3. **Expected:** No errors in Output panel

### Step 2: Character Creation

1. Enter a hero name (e.g., "TestHero")
2. Select any element, race, look, clothes, and weapon
3. Click **[CREATE]** button
4. **Expected:** 
   - Status message: "Hero created and saved. Entering Forest Trials Entrance..."
   - Scene transitions to ForestTrialsEntrance
   - No errors in Output

### Step 3: Route Selection (ForestTrialsEntrance)

1. You should see:
   - Opening screen with route options
   - Text: "Press 1 for Sproutbound Trail, 2 for Emberroot..."
   - Player character visible in center
   - HUD in top-left corner

2. Press **1** to enter Sproutbound Trial
3. **Expected:**
   - Brief 0.35s delay
   - ForestTrials_Sproutbound scene loads
   - You see "Sproutbound Trail | ETA 5-8 min" title
   - Player visible on left, enemy on right
   - HUD updates showing hero health, mana, creat status

### Step 4: Combat Loop

1. You should see:
   - Title: "Sproutbound Trail | ETA 5-8 min"
   - Two character shapes (player on left, red marker on right)
   - Status: "Defeats: 0 / 4 | Egg target: after 3"
   - Hint: "Move with WASD/Arrows. Press [Space] near foe to resolve encounter..."

2. Press **Space** three times to defeat 3 enemies
3. **Expected:**
   - After defeat #1: Status updates to "Defeats: 1 / 4"
   - After defeat #2: Status updates to "Defeats: 2 / 4"
   - After defeat #3: Status updates to "Defeats: 3 / 4" + message "Creat Egg discovered after trial 3!"
   - HUD does NOT crash
   - Each defeat spawns a new red marker (new enemy)

4. Press **Space** one more time to complete the 4th encounter
5. **Expected:**
   - Status: "Defeats: 4 / 4"
   - Hint: "Path converging to Greenwood Clearing..."
   - Scene transitions to GreenwoodClearing (home base)
   - No errors

### Step 5: Home Scene (GreenwoodClearing)

1. You should see:
   - Player spawned in a safe zone
   - HUD still visible and updating
   - Checkpoint system active

2. Open the **Inventory** panel (press **I** or click INVENTORY gem button)
3. **Expected:**
   - Inventory shows items collected during route
   - No errors on open/close

4. Try to open **Map** (press **M** or click MAP gem button)
5. **Expected:**
   - Map screen appears
   - Can see basic zone layout
   - Can close it without crash

### Step 6: Save Verification

1. Exit the game (close the window or press **Esc** multiple times)
2. Start the game again (press F5)
3. **Expected:**
   - Game loads previous save state
   - Character is in GreenwoodClearing
   - Inventory still contains collected items
   - Hero profile is restored

---

## What to Check During Test

### HUD Display ✓

- [ ] Hero Health widget shows correct HP value (should decrease after damage)
- [ ] Mana/Potions widget displays current mana and potion count
- [ ] Creat Status widget shows "Creat not active yet" initially
- [ ] Attack Cooldown widget shows 1 unlocked slot initially
- [ ] All text is readable and doesn't overlap

### Scene Transitions ✓

- [ ] CharacterCreation → ForestTrialsEntrance (0.35s delay)
- [ ] ForestTrialsEntrance → ForestTrials_Sproutbound (0.35s delay on press 1)
- [ ] ForestTrials_Sproutbound → GreenwoodClearing (1.0s delay on route complete)
- [ ] No black screens or hanging during transitions

### Data Persistence ✓

- [ ] Hero name displayed correctly on return
- [ ] Inventory items persist after route
- [ ] Defeats counter increases correctly
- [ ] Egg discovery triggers at correct milestone
- [ ] Save file is created in user:// directory

### Error Reporting ✓

- [ ] Output panel shows no red [ERROR] messages
- [ ] Warnings are minor (yellow) and non-blocking
- [ ] Scene loads are logged with timestamps
- [ ] No silent failures (systems update silently)

---

## Common Issues & Fixes

### Problem: "Scene not found" error

**Solution:**
1. Check scene paths are exact (case-sensitive on Linux/Mac)
2. Verify all .tscn files exist in GatherTheCrown/scenes/
3. Check no scenes are currently open for editing

### Problem: Character Creation screen won't load

**Solution:**
1. Verify CharacterCreation.tscn exists
2. Check Boot.tscn routes correctly:
   - Boot.gd should call SceneRouter.go_to_zone("res://scenes/ui/CharacterCreation.tscn")
3. Restart Godot if autoload issues occur

### Problem: HUD widgets don't display

**Solution:**
1. Check HUD.tscn node hierarchy is correct
2. Verify all widget scripts are attached to their nodes
3. Check hud_state_mapper.gd is found by the loader
4. Look for [ERROR] messages about missing scripts

### Problem: Enemy doesn't spawn or interact

**Solution:**
1. Check ForestTrials_Sproutbound.tscn has a StaticEnemy node or loads Enemy.tscn
2. Verify enemy_ai.gd script exists and is attached
3. Check Health node exists on enemy for damage system
4. Look for warnings about missing enemy resources

### Problem: Egg discovery doesn't trigger

**Solution:**
1. Verify CompanionLifecycle.egg_acquired signal is wired
2. Check egg_element_picker.gd exists and loads
3. Confirm defeat_count >= egg_discovery_defeat (3)
4. Look for [WARNING] about egg discovery logic

---

## Success Checklist

- [x] Boot completes without error
- [x] CharacterCreation works with any hero name
- [x] ForestTrialsEntrance displays route options
- [x] Route selection transitions correctly
- [x] Combat encounters spawn and resolve
- [x] Egg discovery triggers after 3rd defeat
- [x] Route completion transitions to home
- [x] HUD displays all four quadrant widgets with live data
- [x] Inventory and map work
- [x] Save/load cycle works
- [x] No red [ERROR] messages in Output

**If all items are checked: Phase NOW is COMPLETE ✅**

---

## Next Steps (After Test Passes)

1. Document any behavioral quirks or edge cases
2. Note exact timings for transitions
3. Verify frame rate is stable (check FPS counter)
4. Take screenshots of each scene for documentation
5. Proceed to Priority 2: Lock HUD layout with annotated image

---

## Output Log Location

After running the game, check these files for detailed logs:

- Console Output: Godot Editor Output panel (bottom)
- Test Report: `user://game_loop_test_log.txt` (if validator script is added)
- Debug Log: Check system temp folder for Godot crash logs (if applicable)

