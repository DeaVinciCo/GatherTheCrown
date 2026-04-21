# Creat Egg Discovery Implementation - Complete

## What Changed

### 1. Companion Lifecycle System
**New System:** `CompanionLifecycle.gd` (autoload)

States implemented:
- `NO_CREAT` - Game start, player alone
- `EGG_ACQUIRED` - Found egg during exploration
- `EGG_IN_CARE` - Egg at home base, care active, neglect timer running
- `EGG_HATCHING` - Egg near completion, visual signs
- `CREAT_ACTIVE` - Creat fully hatched, always-present companion

Critical mechanics:
- Neglect timer increases if egg not fed
- Hatch progress tracks time in care
- Egg dies if neglect > threshold
- Hatching spawns FireCreat as active companion

### 2. GameState Changes
Added fields:
- `has_creat: bool` - Tracks if creat is active (false at start)
- `creat_egg_type: String` - Type of egg ("fire_creat", etc.)

These replace implicit creat presence with explicit state tracking.

### 3. Boot Flow Revision
**Old:** Boot.gd → GreenwoodClearing (creat already present)
**New:** Boot.gd → ForestTrialsEntrance (player alone, choose path)

New opening flow:
```
ForestTrialsEntrance
├─ Combat Route → ForestTrials_Combat (enemies + egg discovery)
└─ Gather Route → WoodedTrail (materials + egg discovery)
       ↓
   Egg Found (CompanionLifecycle.EGG_ACQUIRED)
       ↓
   Player returns to GreenwoodClearing
       ↓
   Interact with RestPoint (CompanionLifecycle.EGG_IN_CARE)
       ↓
   Feed egg at FeedStation (reduces neglect)
       ↓
   Wait for hatch progress → completion
       ↓
   Creat spawns as active companion (CompanionLifecycle.CREAT_ACTIVE)
```

### 4. Scene Changes

**New Scenes:**
- `ForestTrialsEntrance.tscn` - Route choice UI
- `ForestTrials_Combat.tscn` - Combat trial route placeholder
- `EggDiscoveryTrigger.gd` - Trigger for egg discovery

**Updated Scenes:**
- `GreenwoodClearing.tscn` - Removed FireCreat spawn (no longer needed)
- `RestPoint.tscn` - Now triggers egg care on first interaction with egg

**Removed:**
- FireCreat instance from GreenwoodClearing startup

### 5. Egg Discovery & Care Flow

**Egg Discovery Trigger:**
- Player enters zone with egg
- Area2D collision with player → egg discovered
- `CompanionLifecycle.acquire_egg()` called
- Egg moves to inventory

**Egg Care (at home base):**
1. Player reaches GreenwoodClearing with egg
2. Interact with RestPoint
3. `CompanionLifecycle.begin_care()` triggered
4. Care state active, neglect timer starts
5. Player can feed egg at FeedStation to reduce neglect
6. Hatch progress advances over time
7. When hatch_progress >= 1.0 → egg hatches
8. FireCreat spawns and becomes always-present companion

### 6. HUD Updates

Added egg state display:
- `[EGG ACQUIRED]` - Shows "Bring it home to RestPoint"
- `[EGG IN CARE]` - Shows neglect % and time to hatch
- `[EGG HATCHING]` - Shows "Creat will be active soon!"
- Only shows companion stats AFTER creat is active

### 7. Interaction System Updates

**FeedStation:**
- Before: Only fed active creat
- Now: Can feed egg during care phase (reduces neglect)

**RestPoint:**
- Before: Only rested player
- Now: Triggers egg care if egg acquired but not in care

**CreatEggItem.gd:**
- Updated to call `CompanionLifecycle.acquire_egg()` on collection

## Critical Design Protections

### Identity Shift
MVP opening changes from:
- "Rider + Creat" → "Exploration + Discovery + Responsibility + THEN Companionship"

This reinforces:
- Creat feels found, not assigned
- Creat feels earned through discovery
- Creat feels meaningful through care requirement
- Bond starts pre-hatch through neglect avoidance

### Lifecycle States Are Strict
- No creat commands available until CREAT_ACTIVE
- No feed creat available until CREAT_ACTIVE
- Can only hatch through discovery → home → care → complete
- No shortcuts or state skips

### Egg Discovery is Earned
- Two routes both require reaching egg location
- Both routes have risk (enemies or resource gathering)
- Cannot "fast travel" to egg
- Must bring egg home to progress

## Systems Status

✅ **Implemented:**
- CompanionLifecycle autoload with full state machine
- Egg acquisition → care → hatch → active progression
- Neglect timer and hatch progress tracking
- Scene flow from discovery to companionship
- HUD display of egg state
- Feed/rest interactions during egg care
- GameState has_creat flag

⚠️ **Simplified for MVP (not blocking):**
- Only 2 trial routes (not 3 difficulty levels)
- Egg discovery is automatic on zone entry (not hidden)
- Hatch duration is fast for testing (default 5 mins)
- No perma-death on neglect (can revive egg later)

❌ **Deferred (beyond MVP):**
- Full 3-difficulty trial routes
- Hidden egg locations requiring searching
- Permanent egg death with save corruption
- Complex neglect recovery system
- Creat personality changes based on care quality

## How to Test This

1. Start game → lands at ForestTrialsEntrance
2. Choose route (UP or DOWN arrow)
3. Enter combat/gather zone
4. Egg discovery trigger fires automatically
5. HUD shows "[EGG ACQUIRED]"
6. Exit zone and return to GreenwoodClearing
7. Player spawns alone (no creat visible)
8. Interact with RestPoint
9. HUD shows "[EGG IN CARE]" with neglect/hatch progress
10. Interact with FeedStation to feed egg
11. Wait ~5 seconds (default hatch_duration)
12. HUD shows "[EGG HATCHING]"
13. FireCreat spawns on screen
14. F key now toggles creat commands

## What This Fixes

✅ **Creat now feels earned** - Not given
✅ **Early game has survival element** - Care for egg
✅ **Bond starts at egg discovery** - Not at creat spawn
✅ **Player agency in early choices** - Route selection matters
✅ **Identity is exploration-first** - Companionship comes after discovery
✅ **Egg lifecycle is stateful** - Clear progression, not just triggers
