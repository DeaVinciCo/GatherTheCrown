# Story Mode World Blueprint

Created: April 2026
Owner: Narrative + World Systems

## Core Story Loop (What the game is about)

The player chooses either Home Base or Forest Trials, then progresses through a repeating but escalating Story Mode loop:

1. Travel through outdoor routes (forests, roads, fields, town outskirts)
2. Enter indoor spaces (shops, inns, taverns, castles, ruins)
3. Accept side quests from townspeople
4. Clear infested or broken locations of lower-tier enemies
5. Recover lost items, resources, and town property
6. Restore that location and return it to the owner
7. Progress to a kingdom castle arc
8. Clear 2-5 castle floors (varies by castle)
9. Resolve the ruler condition (cursed, captive, manipulated, or absent)
10. Hand the kingdom back to rightful rule
11. Repeat for the next kingdom with stronger enemies and better rewards

Tone guardrail:
- Keep conflict adventurous and mythic.
- No dark/demonic framing.
- Stakes can be haunted/cursed/taken-over without horror-heavy direction.

## Environment Types

Outdoor:
- Forest paths
- Town roads
- Travel corridors between settlements
- Rest camps before boss zones

Indoor:
- Shops
- Inns
- Taverns
- Manor houses
- Castle interiors
- Abandoned utility spaces (storage, kitchens, halls, archives)

Art reminder:
- Green ground reads as grass for outdoor readability.
- Indoor spaces should feel lived-in first, hostile second.

## Forest Trials Runtime Targets

Use these as target completion windows (including light exploration, gather actions, and short recovery pauses):

- Sproutbound (Easy): 6-9 minutes
- Emberroot (Medium): 10-14 minutes
- Crownfire (Hard): 14-18 minutes
- Whispergrove Forage (Light trail + scavenging): 10-15 minutes

Forage route intent:
- Mixed terrain path (woods to one side, grass and weeds on the other)
- 2-4 low-level enemy encounters (typically 2-3 hits each)
- Focus on camp supplies: food, crafting pieces, and basic material drops before night settlement

## Side Quest Taxonomy + Color Keys

Use one clear color key per side quest category to reduce UI confusion.

- Finder Quests (Town Recovery): Azure
  - Goal: Locate missing town items and return them.
  - Example: Lost medicine pouch, missing inn ledger, stolen bell parts.

- Clearance Quests (Location Purge): Amber
  - Goal: Clear low-tier infestations in abandoned/broken spaces.
  - Reward emphasis: Gold Coins, shards, gems, food, materials.

- Restoration Quests (Rebuild + Handback): Emerald
  - Goal: Deliver gathered materials and complete site restoration.
  - Outcome: Location ownership restored to NPC/family/guild.

- Royal Arc Quests (Kingdom Progress): Crimson Gold
  - Goal: Advance and resolve the active castle arc.
  - Includes floor-clearing and ruler-resolution outcomes.

## Enemy Tiering for Non-Boss Spaces

Lower-tier enemies (inside reclaimed spaces):
- Scavengers (weak, fast)
- Raiders (balanced)
- Ward-breakers (tankier, slower)

Rules:
- Use these tiers in shops/inns/taverns/castle utility rooms.
- Keep them threatening but not oppressive.
- Reserve larger mechanical complexity for floor captains and rulers.

## Castle Arc Structure

Each kingdom castle has 2-5 floors. Floor count depends on story severity and kingdom importance.

Per-floor flow:
1. Entry checkpoint and short objective text
2. Combat and/or puzzle room sequence
3. Recovery room (food/rest/supply)
4. Floor captain encounter
5. Reward + progression gate unlock

Ruler state outcomes (choose one per kingdom):
- Cursed ruler: cleanse and restore
- Captive ruler: rescue route and extraction
- Enchanted/controlled ruler: break spell influence
- Missing ruler: complete search branch before final floor handoff

Optional extra objective:
- If ruler state requires it, add one additional quest branch before final kingdom handover.

## Rewards + Drops

Always-possible rewards:
- Gold Coins (GC)
- Gems
- Metal shards
- Food/provisions
- Loot/materials for restoration

Design notes:
- Story-critical drops should be deterministic (avoid hard RNG walls).
- Combat drops can remain RNG-based.
- Ensure every loop supplies at least one resource useful to hero element or creat feeding.

Suggested timed drop feature (optional):
- Regional supply drop every 3-6 hours real time.
- Drop table weighted toward:
  - Player element needs
  - Creat food/care items
  - Active restoration materials

## Mini-Games and Modes Inside Story Mode

Integrated activities:
- Races (Crownride)
- Mini-games for materials or keys
- PvE challenge rooms
- Limited-scope PvP nodes (optional in story world hubs)

Battle Royale decision:
- Not for current phase.
- Add only as a post-story or seasonal mode after core story + side quest loops are polished.
- If pursued, keep it separate from main progression economy.

## Practical Build Order (Scope-safe)

Phase 1 (now):
- Finalize one complete kingdom loop
- Implement side quest color keys in HUD/map/journal
- Build 1 indoor reclaimed location + 1 outdoor travel route
- Implement one castle with exactly 2 floors

Phase 2:
- Add ruler-state branching
- Expand to 2-3 kingdoms total
- Add restoration visuals (before/after state swap)
- Add regional timed supply drop (3-6h)

Phase 3:
- Add optional PvP hub activities and advanced race ladders
- Add 4-5 floor castles for high-tier kingdoms
- Evaluate Battle Royale as separate live mode

## Existing Systems That Already Support This

Current project systems already map well:
- Checkpoints support travel/rest/floor progression
- Kingdom findings support item recovery and delivery
- Advanced inventory supports food/material categories and keyring
- Announcement popups support quest complete/race placement messaging

## Acceptance Criteria for "Story Mode Ready"

A build is Story Mode ready when:
- Player can complete one full kingdom handback arc end-to-end
- At least 3 side quests exist with distinct color keys
- One restoration site visibly changes state after completion
- Castle has floor progression and ruler outcome resolution
- Rewards consistently feed both hero progression and creat care loop

## One-line Pillar

Story Mode fantasy is: restore the realm one place at a time, then return each kingdom to rightful rule.
