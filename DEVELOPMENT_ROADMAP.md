# Gather The Crown — Development Roadmap

**Current State:** Core play loop stabilizing; HUD transitioning to gem-square modular; most red scene/resource errors resolved.

---

## NOW (Next 1-2 weeks)
### Goal: Zero red errors + one playable slice feels complete

**Priority 1: Eliminate all red parse/resource errors**
- [ ] Verify all scene files load without errors (ForestTrials_*.tscn, Player.tscn, Enemy.tscn)
- [ ] Confirm ext_resource chains are correct across all actor scenes
- [ ] Test round-trip: Boot → CharacterCreation → ForestTrialsEntrance → Route → Combat → Pickup → Home
- [ ] **Verification:** Run game, press 1, complete one trial route, see egg pickup notification

**Priority 2: Lock the gem-square HUD layout mock**
- [ ] Place text labels on gem-square image showing exact placement
  - Top left: HERO HEALTH (red heart, segmented bar)
  - Top right: MANA / POTIONS (smooth fills, dual tracks)
  - Center: XP / LEVEL (main progress ring)
  - Left mid: ATTACK / COOLDOWN (slot indicators, cooldown arcs)
  - Bottom center: CREAT XP / BOND (smooth fill, secondary track)
  - Bottom right: CREAT HEALTH / FOOD (blue heart, segmented + smooth)
  - Corners: RIDER / CREAT / MAP / INVENTORY / OPTIONS (gem buttons)
- [ ] Match widget positions in HUD.tscn to annotated layout
- [ ] Test HUD updates live during gameplay (move, attack, take damage, pick up loot)
- [ ] **Verification:** All four quadrant widgets display correct live values; gem buttons respond to clicks

**Priority 3: Stabilize the forest intro slice**
- [ ] Boot → CharacterCreation path fully stable
- [ ] ForestTrialsEntrance loads correctly, player spawns visible
- [ ] One trial route (ForestTrials_Sproutbound) completes start-to-exit
- [ ] Enemy spawn, aggro, combat, and defeat all work
- [ ] Egg pickup triggers discovery correctly
- [ ] Element selection (egg type choice) works
- [ ] Player returns home/checkpoint without error
- [ ] **Verification:** Full loop video captured, no crashes or silent failures

---

## NEXT (Weeks 3-4)
### Goal: Systems foundations solid; one polished vertical slice

**Priority 1: Finalize all red-list system foundations**
- [ ] Player stats (HP, XP, mana, stamina) persist across scenes
- [ ] Creat lifecycle (egg → care → hatch → active → bond) transitions smoothly
- [ ] Combat rules (damage, cooldown, attack selection) are consistent
- [ ] Loot tables distribute correctly by enemy type
- [ ] Inventory / AdvancedInventorySystem add/remove/persist without issues
- [ ] Checkpoint save/load cycle works
- [ ] Map screen navigation works for all unlocked zones
- [ ] Save file created and restored successfully

**Priority 2: Add second trial route as proof of pattern**
- [ ] ForestTrials_Emberroot loads and completes
- [ ] Same enemy/loot setup as Sproutbound (proof of repeatability)
- [ ] Player can run both routes back-to-back
- [ ] **Verification:** Two routes feel like the same "thing," not accidents

**Priority 3: Finalize one enemy type + loot set**
- [ ] Sproutbound creature (e.g., Sproutling) has clear identity
- [ ] Attack pattern consistent
- [ ] Loot drops (gems, shards, materials) match loot table
- [ ] Player can equip/use dropped items
- [ ] **Verification:** Combat feels intentional, not random

**Priority 4: Title/menu/character creation flow polish**
- [ ] Title screen plays without errors
- [ ] Character creation finishes correctly
- [ ] No placeholder graphics (use current art reference as temporary base)
- [ ] **Verification:** New player can start game, create character, enter world

---

## LATER (Weeks 5-8)
### Goal: Repeatable systems in place; world feels expandable

**Priority 1: Add world structure**
- [ ] Add 2-3 more world zones (e.g., CrownridePath, WoodedTrail complete)
- [ ] Implement zone-to-zone travel (map + doorways)
- [ ] Add checkpoint system for each zone
- [ ] Implement restore/unlock gates (which items unlock which zones)

**Priority 2: Expand content by pattern**
- [ ] Add 2-3 more enemy types (different stats, loot, behaviors)
- [ ] Add 2-3 more creat egg types (fire, water, earth — full discovery loop)
- [ ] Add 2-3 more weapon/gear types (player can equip variety)
- [ ] Add material/resource gathering points (pickaxe/hatchet use cases)

**Priority 3: Expand creat systems**
- [ ] Creat commands (attack mode, defend, rest) functional
- [ ] Creat bond/hunger UI displays correctly
- [ ] Feeding creat uses inventory items
- [ ] Bonding increases with successful combat participation

**Priority 4: Expand HUD with secondary info panels**
- [ ] Gem buttons open placeholder menu screens (Rider, Creat, Inventory, Options)
- [ ] Inventory menu lists items and quantities
- [ ] Map screen shows all discovered zones with travel
- [ ] Options screen allows audio/graphics toggles (placeholder)

**Priority 5: Add one boss/pre-battle prep**
- [ ] One boss-type enemy exists in a boss arena
- [ ] Pre-battle prep screen allows loadout/creat choice
- [ ] Boss has unique attack pattern
- [ ] Boss defeat unlocks a new zone or crown
- [ ] **Verification:** Full boss loop from map → prep → combat → reward → return

---

## MUCH LATER (Weeks 9+)
### Goal: Game identity emerges; content and polish phase

**Priority 1: Replacement art pass**
- [ ] Replace placeholder shapes with actual creature sprites
- [ ] Replace placeholder HUD with styled gem-square frame
- [ ] Map uses polished atlas or parchment style
- [ ] Weapons/items have recognizable fantasy icons
- [ ] Title screen uses final or near-final logo/art

**Priority 2: Faction/kingdom/story structure**
- [ ] Add story chapters (Kingdom 1, Kingdom 2, Kingdom 3 progression)
- [ ] Add faction identities (restoration vs exploration vs combat)
- [ ] Add side quests and mini-games
- [ ] Implement restoration sites and building progression
- [ ] Lock content behind story gates

**Priority 3: Expanded content library**
- [ ] 4-6 total creats with full lifecycle
- [ ] 6-10 enemy types with unique behaviors
- [ ] 4-6 kingdoms/zones with story progression
- [ ] 10-15 weapons/gear variants
- [ ] 20+ loot/resource types
- [ ] Multiple boss encounters

**Priority 4: Visual identity + juice**
- [ ] Shadow/neon aesthetic pass (lighting, particle effects)
- [ ] Menu transitions and animations
- [ ] Combat hit effects and feedback
- [ ] HUD status changes (level up glow, sync pulse, etc.)
- [ ] Title screen mood setting
- [ ] Music/SFX integration (placeholder → composed)

**Priority 5: Advanced systems (optional)**
- [ ] Seasonal events
- [ ] Prestige/new game+ modes
- [ ] Multiplayer (if desired)
- [ ] Cross-save platform sync
- [ ] Achievement/trophy system

---

## Validation Checkpoints

### After NOW phase:
- [ ] Game boots, no errors
- [ ] One trial route completes start-to-finish
- [ ] HUD displays all quadrant data live
- [ ] Egg discovery and creat selection works
- [ ] Save/checkpoint system functions

### After NEXT phase:
- [ ] Two trial routes are interchangeable
- [ ] Character creation feels intentional
- [ ] One boss or mini-boss encounter works
- [ ] Player can identify at least one unique enemy type
- [ ] Loot feels rewarding (not random)

### After LATER phase:
- [ ] Player can play 30-60 minutes without crashes
- [ ] World has at least 4 explorable zones
- [ ] Creat bonding/feeding/command loop is complete
- [ ] At least 3 enemy types with distinct behaviors
- [ ] Inventory and item management is usable
- [ ] Map navigation is intuitive

### After MUCH LATER phase:
- [ ] Game has identifiable visual style
- [ ] Story progression gates are working
- [ ] Multiple creats feel meaningfully different
- [ ] Boss encounters feel like climactic moments
- [ ] Player investment in creat bond feels rewarded
- [ ] Game is feature-complete for launch

---

## Key Decisions

**What NOT to build yet:**
- ~~Multiplayer~~ (save for post-launch)
- ~~12 kingdoms~~ (3-4 is enough for vertical slice)
- ~~Final art~~ (placeholder shapes work; timing matters more)
- ~~Seasonal events~~ (add after core loop is proven)
- ~~Advanced customization~~ (keep creats to discovery-based types first)

**What to build immediately:**
- ✅ Stability (no red errors)
- ✅ One complete 30-minute experience
- ✅ Proof that systems are repeatable
- ✅ Loot that feels purposeful
- ✅ Creat bond that feels rewarding

---

## Recommended Weekly Sprint Format

**Week 1-2 (NOW):**
- Mon–Wed: Red error elimination + testing
- Thu–Fri: HUD layout finalization + widget position lock
- Mon–Wed: Slice stability testing (full boot→egg→home loop)
- Thu–Fri: Polish and buffer

**Week 3-4 (NEXT):**
- Mon–Wed: Second route + enemy type refinement
- Thu–Fri: Boss/mini-boss implementation
- Mon–Wed: Menu/title/character creation polish
- Thu–Fri: Integration testing + documentation

**Week 5+ (LATER/MUCH LATER):**
- Prioritize by: "Does this unblock the next player action?"
- Batch similar work (e.g., "enemy week," "creat week," "art week")
- Keep testing; one broken system breaks the whole game

---

## Success Metric

**You're ready for expanded development when:**
1. You can play from title → egg discovery → home → repeat without crashing
2. HUD displays all relevant state correctly
3. At least one boss encounter feels intentional
4. Creat bond progression feels rewarding
5. You can describe the game in one sentence to a friend, and they understand it

**That moment is probably 3-4 weeks away.**
