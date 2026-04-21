# Untested Systems Validation Checklist

**Purpose:** Spot broken pieces in map, inventory, HUD, and core UI before expanding story content.

**Test Duration:** ~20 minutes per cycle

---

## 1. Forge A Hero Character Creation (NEW UI)

- [ ] Launch game → reaches CharacterCreation screen
- [ ] All 3 banner paths visible (Red/Blue/Gold)
- [ ] Can select each banner → preview changes show correctly
- [ ] Name input accepts text (min 2 chars)
- [ ] Race, Look, Element dropdowns work
- [ ] "FORGE YOUR HERO" button creates character and saves
- [ ] "Continue with existing hero" works if character exists
- [ ] Status messages appear for validation errors
- [ ] No script errors in console

**Expected:** All UI renders, selections persist, character saves.

---

## 2. HUD Display (In CrownrideCircuit or any playable zone)

### Gem-Square Layout
- [ ] Top-left: Hero health visible (red segmented)
- [ ] Top-right: Mana/potions display visible
- [ ] Center: XP/level ring visible
- [ ] Bottom-left: Attack/cooldown slots visible
- [ ] Bottom-center: Creat XP/bond visible
- [ ] Bottom-right: Creat health/food visible

### Live Updates
- [ ] Take damage → hero health decreases
- [ ] Attack → attack cooldown fills
- [ ] Creat attacks → sync meter increases
- [ ] GC counter updates on loot pickup
- [ ] Gems collected → gem counters update

**Expected:** All gauges render and respond to gameplay events.

---

## 3. Map Screen (Press M to open)

- [ ] Map opens without crash
- [ ] Shows discovered zones as labeled areas
- [ ] Player position marker visible
- [ ] Can see zone names and layout
- [ ] Close with Escape or M again
- [ ] No render glitches or text overflow

**Expected:** Clean parchment-style map with zones and markers.

---

## 4. Inventory Screen (Press I to open)

### Tab Navigation
- [ ] All 8 tabs visible (GEAR, PROVISIONS, ARMORY, ARCANA, MATERIALS, TRADE, CREAT, QUEST)
- [ ] Can click/arrow between tabs
- [ ] Each tab shows correct item categories
- [ ] Item counts/stacks display correctly

### Item Display
- [ ] Items listed with quantity
- [ ] Food items show in PROVISIONS
- [ ] Starting weapons show in ARMORY
- [ ] Creat food shows in CREAT tab

### Capacity
- [ ] Used/max slots display (e.g., "25/100")
- [ ] Close with Escape or I again

**Expected:** Tabbed inventory with at least 5+ starting items visible.

---

## 5. Hotkey Responsiveness (Baseline)

- [ ] M opens/closes map
- [ ] I opens/closes inventory
- [ ] Shift → attack (or activate sync if ready)
- [ ] E → interact with NPCs/exits
- [ ] Space → normal attack
- [ ] F → feed creat

**Expected:** All hotkeys respond without stuck inputs or double-toggles.

---

## 6. Combat Loop (In CrownrideCircuit or forage zone)

- [ ] Can kill 2-3 enemies
- [ ] Each enemy drop shows loot (GC, gems, maybe food)
- [ ] Loot pickup adds to inventory
- [ ] GC counter updates visibly
- [ ] No stuck enemies or infinite loops
- [ ] Boss fight launches without crash (even if just observing)

**Expected:** Combat flow works and loot feeds into inventory.

---

## 7. Save/Load (Optional but critical)

- [ ] Play through character creation → save
- [ ] Close game
- [ ] Reopen → character loads
- [ ] Inventory state preserved
- [ ] Hero position saved/restored

**Expected:** Save file exists and data persists.

---

## Test Flow (Fastest Path)

1. **Boot → CharacterCreation** (2 min)
   - Create hero with Red banner, name "Test", skip to home base
2. **Home Base (GreenwoodClearing)** (3 min)
   - Press I → check inventory (starting items)
   - Press M → check map
   - Press Shift → verify hotkey doesn't hang
3. **Go to CrownrideCircuit** (8 min)
   - Press M/I to toggle during travel
   - Kill 4-6 enemies
   - Observe HUD updates and loot drops
4. **Return home** (2 min)
   - Check inventory has new loot
   - Verify no crashes

**Total:** ~15-20 minutes to hit all major systems once.

---

## Red Flags to Watch For

- UI doesn't respond or freezes
- Text overflows or renders off-screen
- Hotkeys get stuck (M stays on, I doesn't toggle)
- Inventory doesn't update on pickup
- HUD gauges don't animate
- Map text is unreadable
- Any console errors on startup

---

## Post-Test Report

If something breaks, note:
1. **What you did** (e.g., "opened inventory twice")
2. **What happened** (e.g., "screen stayed open")
3. **Error message** (if any)
4. **Still playable?** (yes/no)

Pass this to the next session so we can prioritize fixes.
