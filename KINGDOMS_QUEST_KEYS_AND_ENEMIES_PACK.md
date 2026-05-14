# Four Kingdom Content Pack - Names, Royals, Townsfolk, Paths, Enemies, Keys

Purpose: lock a single playable content set for the active four-kingdom restoration arc.

Canon alignment:
- Kingdom IDs and progression order follow `packages/client/src/data/KingdomNamingSystem.ts` and `packages/client/src/systems/KingdomRestorationArc.ts`.
- This pack is content-forward and can be used by quest, dialogue, and encounter systems.

## Arc Scope

1. Aldermarch
2. Stormrage
3. Vastmalaise
4. Sunward

## Canon Naming Lock

- The 4th starter kingdom is canonically named `Sunward` for maps, progression IDs, and key systems.
- `Solmere` is retained as an in-world cultural/ancestral alias tied to House Solthane lines.

## Awakened Human Element Path Mapping (Lore Canon)

Use this mapping for awakened human origin stories and NPC callouts:

1. Earth/Water awakened lean -> Aldermarch path
2. Storm awakened lean -> Stormrage path
3. Shadow/Arcane awakened lean -> Vastmalaise path
4. Fire/Light awakened lean -> Sunward path

### Canon Distinction: Awakened vs Hero

- Awakened person: human with elemental resonance, not automatically a combatant.
- Hero: awakened person who trains with gear, weapons, field discipline, and kingdom certification.
- Town and kingdom populations include both combat and non-combat awakened roles.

## Shared Enemy Families (Allowed Across Every Kingdom)

These can appear in all abandoned structures and castle clearings with palette/stat variants.

- Gloom Rats (swarm melee)
- Rift Bats (air harass)
- Hollow Hounds (pack rush)
- Broken Wardens (fallen armored guards)
- Ash Witches (debuff casters)
- Vinebound Revenants (grapplers)
- Shard Slingers (ranged)
- Gate Leeches (portal parasites)

Use this baseline split for normal clears:
- 30% swarm (rats/bats)
- 30% melee pressure (hounds/wardens)
- 25% ranged control (slingers/witches)
- 15% utility/portal hazards (leeches/revenants)

## Shared Castle-Clearing Elite Set

Use these in each kingdom's keep/citadel clear before throne boss.

- Crownless Knight Captain (elite duel unit)
- Rift Standard Bearer (buff to nearby enemies)
- Gatebinder Monk (locks movement lanes)
- Vault Devourer (slow tank, high stagger)

## Quest Key System (People Keys and Royal Keys)

### Key Types

- House Keys: unlock homes, workshops, and personal storerooms
- Trade Keys: unlock shop floors, cellar cages, back-office chests
- Gate Sigils: unlock district gates and route barricades
- Archive Seals: unlock lore rooms, map rooms, old records
- Royal Keys (one per kingdom): unlock inner keep portal/royal vault door

### Universal Key Rules

- Every key is tied to one named NPC owner or steward.
- Lost-key quests always require at least one clue scene and one combat or traversal beat.
- Royal Key cannot be traded, only entrusted by a royal bloodline member, regent, or sworn keykeeper.
- Portal doors require both: local Royal Key + one restored district condition.

## 1) Aldermarch (Forest-River Crownland)

### Royal House

- Kingdom: The Kingdom of Aldermarch
- Crown Line: House Alderwyn
- Sovereign (missing): Queen Mirelle Alderwyn
- Heir-Regent (active): Prince Rowan Alderwyn
- Royal Key Name: Root-Crown Key
- Royal Key Steward: Warden-Matriarch Elsin Thorne (sworn to House Alderwyn)

### Capital and Place Names

- Capital: Towne of Aldermarch
- Harbor: Merchant Harbour
- Castle: Briarhold Keep
- Districts: Old Mill Ward, Lantern Market, Reedwalk Quarter, Greenbell Heights
- Paths and Routes:
  - Lanternbridge Path
  - Rootline Causeway
  - Mossbell Trail
  - Riverglass Walk
  - Thornwatch Steps

### Townsfolk (Need Help Finding Things)

- Nella Brook (apothecary apprentice)
  - Missing item: Satchel of Bittermint Vials
  - Likely location: flooded storeroom under Old Mill Ward
- Tovin Pike (ferryman)
  - Missing item: Brass Tide Compass
  - Likely location: broken dock office in Merchant Harbour
- Sister Hale Fern (shrine keeper)
  - Missing item: Hymnal Ledger of Vows
  - Likely location: abandoned chapel archive

### Owners of Fallen/Taken Structures

- Garrick Soot (owner, Soot & Stitch Smithy)
  - Structure state: taken over by Broken Wardens
  - Unlock key: Smithfloor Trade Key
- Maera Willow (owner, Willowwake Boarding House)
  - Structure state: partial collapse and rat nests
  - Unlock key: Boarding House House Key
- Orin Vale (owner, Vale Grain Loft)
  - Structure state: seized by smugglers and hounds
  - Unlock key: Loft Cage Key

### Abandoned-Place Enemies (Aldermarch Mix)

- Gloom Rats
- Hollow Hounds
- Vinebound Revenants
- Shard Slingers
- Mini-boss: The Milljaw Gnawlord (Old Mill Ward)

### Castle Clearing and Boss

- Castle clearing elites: Shared Elite Set + Thorn Wardens
- Throne boss: Briar Regent Caldrake
  - Theme: root armor, corridor entangle, shield bloom phase
  - Defeat reward: Gate Sigil of Greenbell + access to Royal Antechamber

### Key People Chain

1. Nella Brook gives clue to flooded mill tunnel map.
2. Garrick Soot grants Smithfloor Trade Key after smithy reclaim.
3. Warden-Matriarch Elsin Thorne tests oath at Thornwatch Steps.
4. Elsin entrusts Root-Crown Key for Briarhold inner portal.

## 2) Stormrage (Highland Thunder Kingdom)

### Royal House

- Kingdom: The Stormrage Kingdom
- Crown Line: House Tempesthane
- Sovereign (entombed): King Baric Tempesthane
- Acting Regent: Lady Veyra Tempesthane
- Royal Key Name: Skybolt Crown Key
- Royal Key Steward: Master Castellan Roarke Flint

### Capital and Place Names

- Capital: Citadel of Stormrage
- Harbor: Thunderstrike Harbour
- Castle: Thunderbrand Citadel
- Districts: Anvil Ring, Gale Market, High Bell Bastion, Raincut Terrace
- Paths and Routes:
  - Thunderstep Road
  - Skyforge Span
  - Coilwind Stair
  - Bellhammer Pass
  - Rainlash Traverse

### Townsfolk (Need Help Finding Things)

- Jessa Coil (signal engineer)
  - Missing item: Storm Beacon Relay Core
  - Likely location: wrecked bastion signal room
- Bram Oath (stablehand)
  - Missing item: Saddle Talisman Ring
  - Likely location: overrun stables in Raincut Terrace
- Elder Nox Tallow (scribe)
  - Missing item: Ledger of Oath-Banners
  - Likely location: lightning-split archive vault

### Owners of Fallen/Taken Structures

- Hadrik Forgeborn (owner, Forgeborn Anvils)
  - Structure state: occupied by Gate Leeches and cultists
  - Unlock key: Master Forge Trade Key
- Mira Gale (owner, Galewind Inn)
  - Structure state: roof collapse and bat infestation
  - Unlock key: Cellar House Key
- Toren Pikewall (owner, Pikewall Cartwright)
  - Structure state: barricaded by deserters
  - Unlock key: Cartwright Yard Key

### Abandoned-Place Enemies (Stormrage Mix)

- Rift Bats
- Broken Wardens
- Ash Witches
- Gate Leeches
- Mini-boss: Belltower Arclash Warden (High Bell Bastion)

### Castle Clearing and Boss

- Castle clearing elites: Shared Elite Set + Stormbound Halberdiers
- Throne boss: Tempest Marshal Graive
  - Theme: chain lightning lanes, thunder summons, storm wall phase
  - Defeat reward: Gate Sigil of Raincut + access to Sky Vault Lift

### Key People Chain

1. Jessa Coil repairs one beacon to reveal hidden citadel route.
2. Hadrik Forgeborn grants Master Forge Trade Key after forge reclaim.
3. Castellan Roarke Flint requires clearing High Bell Bastion.
4. Roarke entrusts Skybolt Crown Key for Thunderbrand inner gate.

## 3) Vastmalaise (Mire-Ruin Plague Kingdom)

### Royal House

- Kingdom: The Vastmalaise Kingdom
- Crown Line: House Malachor
- Sovereign (lost): Queen Sable Malachor
- Surviving Regent-Seer: Prince Caelum Malachor
- Royal Key Name: Mireglass Crown Key
- Royal Key Steward: Archivist-Marshal Ithra Vonn

### Capital and Place Names

- Capital: Enclave of Vastmalaise
- Harbor: Misthaven Pier
- Castle: Mireglass Palace
- Districts: Rotfen Ward, Veil Market, Silt Chapel Ring, Duskgate Commons
- Paths and Routes:
  - Widowreed Track
  - Mire Lantern Route
  - Siltbone Causeway
  - Blackwater Ledge
  - Duskveil Run

### Townsfolk (Need Help Finding Things)

- Pella Mire (healer)
  - Missing item: Antitoxin Satchel
  - Likely location: collapsed infirmary annex
- Corin Voss (lampwright)
  - Missing item: Sunsalt Lamp Core
  - Likely location: flooded lamp cellar under Veil Market
- Brother Yann (story keeper)
  - Missing item: Book of Names (memorial registry)
  - Likely location: sealed crypt archive in Silt Chapel Ring

### Owners of Fallen/Taken Structures

- Vexa Thorn (owner, Thorn Remedy House)
  - Structure state: taken by Ash Witches
  - Unlock key: Remedy House Key
- Jorik Fen (owner, Fenbarge Supply Depot)
  - Structure state: seized by smugglers and hounds
  - Unlock key: Depot Gate Key
- Alwen Drear (owner, Drear Loomworks)
  - Structure state: rot collapse plus revenant nest
  - Unlock key: Loomworks Trade Key

### Abandoned-Place Enemies (Vastmalaise Mix)

- Gate Leeches
- Ash Witches
- Vinebound Revenants
- Hollow Hounds
- Mini-boss: Rotfen Plague Herald (Rotfen Ward)

### Castle Clearing and Boss

- Castle clearing elites: Shared Elite Set + Mireguard Reapers
- Throne boss: Sable Echo, the Uncrowned Queen
  - Theme: poison bloom fields, mirror clones, curse pulse phase
  - Defeat reward: Gate Sigil of Duskgate + Archive Seal access

### Key People Chain

1. Pella Mire sends player to recover antitoxin in infirmary.
2. Vexa Thorn grants Remedy House Key and resistance craft unlock.
3. Archivist-Marshal Ithra Vonn opens sealed records in Silt Chapel.
4. Ithra entrusts Mireglass Crown Key for palace portal lock.

## 4) Sunward (Desert-Oasis Solar Kingdom)

### Royal House

- Kingdom: The Sunward Kingdom
- Crown Line: House Solthane
- Sovereign Spirit: King Azar Solthane
- Living Regent: Princess Nadira Solthane
- Royal Key Name: Dawnfire Crown Key
- Royal Key Steward: Captain-Keys Ammon Rheel

### Capital and Place Names

- Capital: Oasis of Sunward
- Harbor: Golden Cove
- Castle: Solspire Palace
- Districts: Brass Bazaar, Palmcourt Terrace, Glasskiln Ward, Duneward Gate
- Paths and Routes:
  - Sunveil Road
  - Duneglass Way
  - Saffron Causeway
  - Emberwind March
  - Mirage Ladder

### Townsfolk (Need Help Finding Things)

- Imani Sef (water keeper)
  - Missing item: Aquifer Dial Wheel
  - Likely location: sand-choked pumping vault
- Rook Halem (courier)
  - Missing item: Sealed Dispatch Tube
  - Likely location: raider camp near Duneward Gate
- Old Mother Kiri (textile elder)
  - Missing item: Sunloom Pattern Tablets
  - Likely location: collapsed loom hall in Glasskiln Ward

### Owners of Fallen/Taken Structures

- Daro Kesh (owner, Kesh Spicehouse)
  - Structure state: taken by slingers and desert raiders
  - Unlock key: Spicehouse Trade Key
- Selene Marr (owner, Marr Glasskiln)
  - Structure state: unstable, heat vents and leech nests
  - Unlock key: Kiln House Key
- Bato Or (owner, Or Stable Court)
  - Structure state: occupied by armored scavengers
  - Unlock key: Stable Court Gate Key

### Abandoned-Place Enemies (Sunward Mix)

- Shard Slingers
- Broken Wardens
- Rift Bats
- Hollow Hounds
- Mini-boss: Dunebrand Pillager-King (Brass Bazaar vault lane)

### Castle Clearing and Boss

- Castle clearing elites: Shared Elite Set + Solar Lancers
- Throne boss: Regent of Cinders, Azrakel
  - Theme: heatwave rings, mirror-sun beams, collapsing shade zones
  - Defeat reward: Gate Sigil of Duneward + final royal portal unlock

### Key People Chain

1. Imani Sef restores aquifer controls and reopens Sunveil Road.
2. Daro Kesh grants Spicehouse Trade Key after bazaar reclaim.
3. Captain-Keys Ammon Rheel requires two district sigils to proceed.
4. Ammon and Princess Nadira co-grant Dawnfire Crown Key.

## Boss Layering for Quests (Big Fights Outside Castle)

One major quest boss per kingdom before or after castle clear.

- Aldermarch Quest Boss: Rootmaw Hart-Tyrant (wildwood arena)
- Stormrage Quest Boss: Ironcloud Roc Sovereign (cliff ring)
- Vastmalaise Quest Boss: Mire Apostle Thren (chapel basin)
- Sunward Quest Boss: Glass Seraph Kheled (sunken observatory)

Recommended rule:
- Quest boss first clear grants People Key upgrade token.
- Castle boss clear grants Royal Key progression state.

## Portal and Door Unlock Logic (Simple)

For each kingdom portal chain:

1. Clear 2 local structure-owner recoveries.
2. Complete 1 townsfolk lost-item quest with clue trail.
3. Defeat 1 local mini-boss in abandoned district.
4. Receive Gate Sigil from local authority.
5. Complete castle clearing and boss.
6. Receive Royal Key from named steward/royal.
7. Unlock royal portal door and inner vault route.

## Named Keyholders Quick Index

- Aldermarch Royal Keyholder: Warden-Matriarch Elsin Thorne
- Stormrage Royal Keyholder: Castellan Roarke Flint
- Vastmalaise Royal Keyholder: Archivist-Marshal Ithra Vonn
- Sunward Royal Keyholder: Captain-Keys Ammon Rheel (with Princess Nadira Solthane)

## Implementation Mapping Notes

Suggested integration targets:
- Dialogue and NPC roster data: `packages/client/src/data/*Roster*.ts`
- Quest chain states and IDs: `packages/shared/src/quests.ts`
- Encounter content pass: `packages/server/src/content/bosses.ts`
- Kingdom progression hook points: `packages/client/src/systems/KingdomRestorationArc.ts`

This file intentionally pins names and role ownership so quest scripting can proceed without renaming churn.
