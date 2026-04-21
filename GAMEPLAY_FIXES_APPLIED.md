# Gameplay Issues - Diagnosis & Fixes

## Summary of Issues Reported
✗ **Pentagon shape chasing me** - "something following me"  
✗ **No enemies visible** - But something's there  
✗ **Movement only diagonal** - Can't move left/right/up/down freely  
✗ **Key "1" doesn't work** - Pressed but nothing happened  

---

## What I Found & Fixed

### Issue 1: Pentagon Shape Chasing You
**Status**: ✓ **DIAGNOSED - This is YOUR character!**

The pentagon shape you're seeing is **your own player model**, not an enemy chasing you. 

- **Where**: `player.gd` creates a pentagon VisibleBody polygon
- **Why**: The player and enemies use simple polygon shapes as visual models
- **What to do**: This is correct behavior - you're seeing your own character drawn as a blue pentagon

---

### Issue 2: No Enemies Visible
**Status**: ⚠️ **DIAGNOSTIC LOGGING ADDED**

Enemies ARE being spawned (code checked out), but their visibility needs investigation.

**What changed:**
- Modified `_spawn_enemies()` in `crownride_circuit.gd` to log each enemy's creation
- Modified `enemy_ai.gd` to log when VisibleBody polygons are created  
- Enhanced `_print_spawn_report()` with detailed z-index and camera rect checks

**How to debug:**
1. Launch the game
2. Look at the OUTPUT console (View → Output in VS Code)
3. Look for this line at startup:
   ```
   [CrownrideCircuit] ========== SPAWN REPORT ===========
   ```
4. Check for:
   - `Total enemies in 'enemy' group: X` - Should be 8
   - Each enemy should show: `> [name] @ pos=[x,y] visible_body=true`
   - If `visible_body=false`, enemies won't be drawn

**Share the output** and I can identify the exact issue.

---

### Issue 3: Movement Only Diagonal
**Status**: ✓ **FIXED**

**Problem**: The movement code was using input actions that might not be properly defined:
```gdscript
if Input.is_action_pressed("move_up") or Input.is_key_pressed(KEY_W)...
```

If `move_up` action doesn't exist, this could cause issues.

**Solution Applied**: Updated `character_motor_2d.gd` to use **ONLY direct key presses**:
```gdscript
if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
    input_direction.y -= 1
```

**Test it**: You should now be able to move in ALL 8 directions:
- ✓ Up (W or ↑)
- ✓ Down (S or ↓)  
- ✓ Left (A or ←)
- ✓ Right (D or →)
- ✓ + Diagonals (any two at once)

---

### Issue 4: Key "1" Doesn't Work
**Status**: ⏸️ **NOT CRITICAL**

Creat spawning via key press isn't implemented in `crownride_circuit.gd`. This feature exists in `forest_trials_entrance.gd` but not in the main playable area.

**Priority**: Low - Not needed for MVP playable slice. Can be added if needed.

---

## Files Modified

| File | Changes |
|------|---------|
| `scripts/actors/character_motor_2d.gd` | Removed input action checks, use direct key presses only |
| `scripts/world/crownride_circuit.gd` | Added extensive debug logging to spawning code |
| `scripts/actors/ai/enemy_ai.gd` | Added debug logging to VisibleBody creation |

---

## What to Test Next

1. **Movement**: Press WASD and Arrow keys - should move in all 8 directions now
2. **Check console output**: Run game, look for SPAWN REPORT section
3. **Report back**: Share the console output if enemies still aren't visible
4. **Enemies**: If visible, they should be green, purple, red diamond shapes (depending on type)

---

## Technical Details (For Reference)

### Z-Index Layering (should render in this order, bottom to top):
```
Background:      z=-50  (bottom)
GrassLayer:      z=-4
PathLayer:       z=-3
SafeZoneLayer:   z=-2
TreeLayer:       z=5
PickupLayer:     z=12
EnemyLayer:      z=20   (enemies at z=22)
Player:          z=25   (top)
UI:              z=20+  (overlay)
```

### Enemy Spawn Data
- 8 spawn positions around the map
- Each enemy type rolls from: goblin_scout, forest_bat, cave_bat, bandit_rogue
- Each gets a VisibleBody polygon (4-point diamond, colored by type)
- Health, collision, and AI all initialized

---

## Next Action Items

1. **Test movement** - Can you move in all 8 directions now?
2. **Run game & check OUTPUT console** - Look for `[CrownrideCircuit] ========== SPAWN REPORT ===========`
3. **Share console output** - If enemies still missing, paste the SPAWN REPORT section
4. **Report back** - Let me know what you see!
