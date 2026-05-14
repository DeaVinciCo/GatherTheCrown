## 2026-05-14 - Supabase Auth + Full Hero Cloud Persistence (Phase 2)

### Completed

1. Supabase Auth replaced legacy password hashing
- Replaced legacy local hash auth in [packages/server/src/utils/auth.ts](packages/server/src/utils/auth.ts)
- Signup now creates Supabase Auth user via admin API and creates matching app User row with same UUID
- Added token verification flow (`verifyToken`) and authenticated profile hydration (`getUserWithHeroes`)
- Deprecated legacy `/auth/login` endpoint in favor of Supabase session + `/auth/me`

2. Server JWT protection + ownership checks
- Updated [packages/server/src/index.ts](packages/server/src/index.ts) with:
  - Bearer JWT middleware
  - `requireAuth` route guard
  - new `/auth/me` endpoint
  - authenticated hero creation/state routes
  - ownership checks for hero read/update/delete/state routes
  - `/users/me/hero-count` endpoint for authenticated roster limit checks

3. Expanded persistence schema for full game registry mapping
- Updated [packages/server/prisma/schema.prisma](packages/server/prisma/schema.prisma) with additional User/Hero fields:
  - session-related support on User (`guestIntroCompleted`, nullable password)
  - full Hero economy/progression/homebase/creat fields
- Added Supabase SQL migration [supabase/migrations/002_hero_full_fields.sql](supabase/migrations/002_hero_full_fields.sql)
- Added User self-access RLS policies in [supabase/migrations/001_gtc_core.sql](supabase/migrations/001_gtc_core.sql)

4. Client Supabase integration + authenticated autosave
- Added Supabase client dependency to [packages/client/package.json](packages/client/package.json)
- Added client env template [packages/client/.env.example](packages/client/.env.example)
- Added [packages/client/src/utils/supabaseClient.ts](packages/client/src/utils/supabaseClient.ts)
  - Supabase client singleton
  - username -> synthetic auth email mapper
- Updated [packages/client/src/scenes/LoginScreen.ts](packages/client/src/scenes/LoginScreen.ts)
  - sign in via Supabase
  - profile hydration via `/auth/me`
- Updated [packages/client/src/scenes/CreateAccountScreen.ts](packages/client/src/scenes/CreateAccountScreen.ts)
  - account creation via `/auth/signup`
  - immediate Supabase sign-in + profile hydration
- Updated [packages/client/src/scenes/ForgeHero.ts](packages/client/src/scenes/ForgeHero.ts)
  - Bearer-protected `/users/me/hero-count`
  - Bearer-protected `/heroes/create`
- Extended [packages/client/src/registry/GameRegistry.ts](packages/client/src/registry/GameRegistry.ts)
  - token/session fields
  - `setSession`, `clearSession`
  - `hydrateFromHero`
  - debounced `scheduleSyncToServer` + `syncToServer` autosave

5. Verification
- `pnpm install` -> success
- `pnpm --filter @game/server db:generate` -> success
- `pnpm --filter @game/client build` -> success
- `pnpm --filter @game/server build` -> only pre-existing quest typing errors remain in `packages/server/src/sim/quests.ts`

### Notes
- RLS policies depend on app `User.id` matching `auth.uid()`; signup path now enforces this by writing `User.id = supabase_auth_user.id`.

## 2026-05-14 - Phase A Execution Run 2 + RC1 Test Log

### Completed

1. Netlify Phase A advanced with live preview deploy
- Netlify auth confirmed (`Dea Vinci Co.` / `GAYte Keepers`).
- Site inventory captured from `packages/client` context.
- Preview deploy succeeded using no-build workflow:
  - Draft URL: https://6a05b238cd7ed03eafd6f18c--gather-the-crown-game.netlify.app
- URL smoke confirmed page title `Gather The Crown`.

2. Production deploy smoke attempt executed
- Attempted no-build production deploy on `gather-the-crown-game`.
- Blocked by Netlify account credit cap (403: credit usage exceeded).
- Production URL check currently returns 404 Site not found.

3. First release test log file created
- Added [RELEASE_TEST_LOG_2026-05-14_RC1.md](RELEASE_TEST_LOG_2026-05-14_RC1.md)
- Captures pass/fail/blocker matrix for build, deploy, and URL smoke checks.

4. Phase A validation doc refreshed
- Updated [NETLIFY_PHASE_A_VALIDATION_2026-05-14.md](NETLIFY_PHASE_A_VALIDATION_2026-05-14.md)
- Includes monorepo CLI crash details, subfolder build-path issue, preview pass, and production blocker.

### Current Blockers

1. Netlify deploy credits exceeded (production deploy blocked).
2. Root workspace is not a git root for branch-based release validation.
3. Root-level `netlify build` monorepo selection crash on Windows CLI prompt flow.


### Netlify build command patch for monorepo compatibility
- Updated [netlify.toml](netlify.toml) build command:
  - Old: `cd packages/client && npx vite build`
  - Interim: `npx --prefix ./packages/client vite build` (subfolder Netlify build pass, root Netlify build fail: `Could not resolve entry module "index.html"`)
  - Final: `pnpm --filter @game/client build` (validated pass from both root and `packages/client`)
- Motivation: Ensures build works from both root and subfolder contexts and avoids brittle directory assumptions.
- Production retry status: still blocked by Netlify 403 account credit usage exceeded.
- Next: Restore credits, then rerun production no-build deploy smoke and remaining checklist.


2026-05-14 - Sanctuary Towne Hall Panel & Governance Integration
---------------------------------------------------------------
• Added in-game Towne Hall panel (press 'H' in Sanctuary Town) showing:
  - Council roster and Harbor Speaker
  - Voting rules and succession
  - Meeting time, place, and open invitation
  - Current meeting topics with descriptions
• Expanded council/NPC dialogue to reflect governance canon
• All changes match the Sanctuary Governance Charter and are error-free
• Ready for playtesting and further gameplay wiring
# Gather The Crown - Build Journal

Purpose: Persistent implementation log stored in-repo so progress does not disappear with chat/session history.

## 2026-05-13

### Completed Today

1. Settings panel and persistence
- Added [packages/client/src/ui/SettingsPanel.ts](packages/client/src/ui/SettingsPanel.ts) with:
  - music toggle
  - sfx toggle
  - music volume slider
  - sfx volume slider
  - controls reference
  - reduce motion toggle
- Extended [packages/client/src/audio/AudioManager.ts](packages/client/src/audio/AudioManager.ts):
  - localStorage-backed settings key: gtc_audio_settings
  - setMusicEnabled, setSfxEnabled
  - setMusicVolume, setSfxVolume
  - setReduceMotion
  - getSettings
- Wired settings access in:
  - [packages/client/src/scenes/MainMenu.ts](packages/client/src/scenes/MainMenu.ts)
  - [packages/client/src/scenes/Haven.ts](packages/client/src/scenes/Haven.ts)
  - [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts)

2. Hybrid origin + age-gap lore surfacing
- Expanded flavor dialogue in [packages/client/src/data/SanctuaryNpcRoster.ts](packages/client/src/data/SanctuaryNpcRoster.ts) for:
  - Old Ren, Tide, Harbor Jae, Wren, Juniper, Luma
- Expanded ambient teen/apprentice lines in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts)
- Added optional codex data file [packages/client/src/data/SanctuaryIsleNotes.ts](packages/client/src/data/SanctuaryIsleNotes.ts)

3. Education path upgrade (Field Years)
- Updated school progression model in [packages/client/src/data/SanctuaryFamilyRoster.ts](packages/client/src/data/SanctuaryFamilyRoster.ts):
  - littleLantern: ages 5-10
  - fieldYears: ages 11-12
  - hearthway: ages 13-17
- Reassigned all age-11/12 roster kids from hearthway to fieldYears.
- Updated school/location descriptions in [packages/client/src/data/SanctuaryLocationReference.ts](packages/client/src/data/SanctuaryLocationReference.ts).
- Updated codex school note in [packages/client/src/data/SanctuaryIsleNotes.ts](packages/client/src/data/SanctuaryIsleNotes.ts).
- Added Field Years ambient chatter and speaker labels in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts).

4. Creator credit hardcoded
- Added footer credit to [packages/client/src/scenes/MainMenu.ts](packages/client/src/scenes/MainMenu.ts)
- Text: "Game created and developed by Dea Vinci Co. · 'That's Another Good iDeaR™!'"
- Position: Bottom center of MainMenu screen, subtle gray text

5. Mother-and-daughters household added
- Added a new Sanctuary family in [packages/client/src/data/SanctuaryFamilyRoster.ts](packages/client/src/data/SanctuaryFamilyRoster.ts)
- Household: Mara and Daughters House
- Kids:
  - Lavender, age 5, Little Lantern House, longer locs
  - Primrose, age 4, shorter locs
- Added morning and afternoon town presence entries in [packages/client/src/data/SanctuaryFamilyRoster.ts](packages/client/src/data/SanctuaryFamilyRoster.ts)
- Added a special in-town prompt in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts) so they read as a mother with two girls, with the younger child always staying close to mom

6. Hero home-base placement
- Placed the hero home base on the northern cliff approach in [gtc_world_map_specifications.json](gtc_world_map_specifications.json)
- Added Greenwood Trail, Northwatch Cliffs, The Old Overlook, and Greenwood Clearing to [packages/client/src/data/SanctuaryLocationReference.ts](packages/client/src/data/SanctuaryLocationReference.ts)
- Updated [packages/client/src/scenes/SanctuaryHomeBase.ts](packages/client/src/scenes/SanctuaryHomeBase.ts) copy so the scene describes the cliffside clearing directly
- Intended feel: private, quiet, slightly removed from town, but still rooted in Sanctuary Isle

7. Netlify publish attempt (blocked by auth)
- Built latest client successfully using: pnpm --filter @game/client build
- Attempted deploy from repo root and from package directory
- Root deploy hit Netlify CLI monorepo selector crash on Windows:
  - TypeError: Cannot read properties of undefined (reading 'value')
- Package-level deploy bypassed selector but returned:
  - JSONHTTPError: Forbidden
- Environment check confirms NETLIFY_AUTH_TOKEN is not set
- Next unblock step: run deploy with a valid Netlify Personal Access Token

### Verification
- Build command:
  - pnpm --filter @game/client build
- Result:
  - success (exit code 0)
  - 61 modules transformed

### Next Agenda (Recommended)

1. Audio Phase 1 implementation
- footsteps
- pickup sounds
- fishing sounds
- combat hit sounds
- ambient day/night loops
- quiet danger cue

2. Sanctuary Town request polish
- keep requests tiny
- add 3-5 micro-request templates
- tune rewards to remain small and rapport-focused

3. Inventory polish
- finalize category tabs
- lock Hero vs Creat inventory direction
- add Key Items / Quest Items section
- add Needed Now marker

4. Camera presentation decision
- choose baseline zoom/camera feel
- apply consistently to Haven, Trails, Sanctuary Town

5. Deploy/public build refresh
- publish current build on fresh URL
- verify mobile browser loads latest content

6. Codex/Help/Player Guide scene
- how to play
- currencies
- elements
- keys
- creat lifecycle
- sanctuary basics

## 2026-05-13 - Stability Hold Pass

### Completed

1. Player Guide scene implemented
- Added [packages/client/src/scenes/PlayerGuide.ts](packages/client/src/scenes/PlayerGuide.ts)
- Includes six sections matching backlog scope:
  - how to play
  - controls/keys
  - currencies and items
  - elements and creat growth
  - sanctuary basics
  - progress locks and key-item usage
- Added keyboard navigation (A/D or Left/Right), section jump keys (1-6), and ESC back to menu.

2. Menu integration
- Registered [packages/client/src/scenes/PlayerGuide.ts](packages/client/src/scenes/PlayerGuide.ts) in [packages/client/src/main.ts](packages/client/src/main.ts).
- Added Main Menu access in [packages/client/src/scenes/MainMenu.ts](packages/client/src/scenes/MainMenu.ts):
  - new "Player Guide" button
  - H key shortcut

3. Stability polish fix
- Updated [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts) HUD prompt so the default help text consistently shows `O: Settings`.

### Hold-Period Task List (Low Risk)

1. Audio hook scaffolding (no asset spend)
- Add non-breaking sound event calls where actions already exist (footstep/fish/hit/pickup), keeping graceful no-audio fallback.

2. Request micro-template expansion
- Add 3-5 additional tiny Sanctuary requests reusing existing reward and rapport flow.

3. Inventory clarity
- Add visible Key/Quest item section labels and "Needed Now" tagging for tracked objectives.

4. Camera consistency pass
- Align baseline zoom settings across Haven, SanctuaryTrail, and SanctuaryTown to reduce visual jumping.

## 2026-05-13 - Incremental Implementation Chunks

### Chunk 1 - World Rule Set (ordered)

1. Mixed neighborhood layout by district
- Locked as policy and district mix list in [gtc_world_map_specifications.json](gtc_world_map_specifications.json) under `island_world_rules.1_mixed_neighborhood_layout_by_district`.

2. Transport hierarchy by distance and cargo
- Added ordered tier model in [gtc_world_map_specifications.json](gtc_world_map_specifications.json) under `island_world_rules.2_transport_hierarchy_by_distance_and_cargo`.

3. Locked island scale for route planning
- Added fixed dimensions in [gtc_world_map_specifications.json](gtc_world_map_specifications.json) under `island_world_rules.3_locked_island_scale_for_map_and_route_planning`.

4. Typed client reference for implementation use
- Added [packages/client/src/data/SanctuaryWorldRules.ts](packages/client/src/data/SanctuaryWorldRules.ts) with:
  - `SANCTUARY_MIXED_NEIGHBORHOOD_LAYOUT`
  - `SANCTUARY_TRANSPORT_HIERARCHY`
  - `SANCTUARY_LOCKED_SCALE`

### Chunk 2 - Audio Phase 1 foundation + hooks

1. Core audio event API
- Extended [packages/client/src/audio/AudioManager.ts](packages/client/src/audio/AudioManager.ts) with no-asset fallback support:
  - `attachScene()`
  - `playFootstep()`
  - `playPickup()`
  - `playFishing()`
  - `playCombatHit()`
  - `playDangerCue()`
  - `playAmbientLoop()`
- Added safe throttling and WebAudio synth fallback when no sound files exist.

2. Sanctuary Town hooks
- Wired movement/fishing/request cues in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts).

3. Haven Grounds hooks
- Wired ambient, footsteps, combat hit, pickup cues, and low-health warning cue in [packages/client/src/scenes/HavenGrounds.ts](packages/client/src/scenes/HavenGrounds.ts).

4. Forest Zone hooks
- Wired ambient by route mood (day/night), footsteps, fishing cast/catch, combat hits, pickup cues, and low-health warning in [packages/client/src/scenes/ForestZone.ts](packages/client/src/scenes/ForestZone.ts).

### Chunk 3 - Sanctuary Isle physical exploration buildout

1. New walkable isle overworld scene
- Added [packages/client/src/scenes/SanctuaryIsleOverworld.ts](packages/client/src/scenes/SanctuaryIsleOverworld.ts)
- Includes:
  - large physical island layout with district zones
  - mixed residential life layer (ambient moving residents)
  - signed path corridors connecting core routes
  - interactable route markers for travel and local inspection

2. Path writing + circulation routes surfaced in-scene
- Embedded readable route flow directly in the world:
  - Greenwood Clearing -> Greenwood Trail -> Towne Lane
  - Towne Lane -> Market Stretch -> Fishers Walk
  - Market Stretch -> Cliff Ladder Path -> Northwatch/Overlook
  - Fishers Walk -> Towne Lane -> Greenwood return loop

3. Scene integration
- Registered new scene in [packages/client/src/main.ts](packages/client/src/main.ts)
- Added Home Base launch button and map destination in [packages/client/src/scenes/SanctuaryHomeBase.ts](packages/client/src/scenes/SanctuaryHomeBase.ts)

4. Validation
- Client build passes after integration (64 modules transformed).

## 2026-05-13 - Four Kingdom Content Lock (Names, NPCs, Keys, Enemies)

### Completed

1. Four-kingdom narrative content pack added
- Added [KINGDOMS_QUEST_KEYS_AND_ENEMIES_PACK.md](KINGDOMS_QUEST_KEYS_AND_ENEMIES_PACK.md)
- Content includes:
  - Kingdom-level naming and place naming aligned to current four-kingdom arc:
    - Aldermarch
    - Stormrage
    - Vastmalaise
    - Sunward
  - Royal house lines, active regents/stewards, and explicit Royal Key names
  - Townsfolk "find missing item" requests by kingdom (quest-ready)
  - Owners of fallen/abandoned/taken-over structures with structure-specific key types
  - Route/path naming and district/place naming for each kingdom
  - Shared baseline enemy families allowed across all kingdoms
  - Castle-clearing elite pack plus kingdom-specific throne bosses
  - One major quest boss per kingdom for non-castle "big fights"
  - Portal and door unlock sequence with People Keys, Gate Sigils, and Royal Keys

2. Keyholder authority pinned for scripting
- Royal keyholder chain and authority defined so quest/state scripts can map ownership without rename churn.

3. Integration target notes included
- Added explicit implementation mapping pointers for quest/dialogue/encounter systems:
  - `packages/client/src/data/*Roster*.ts`
  - `packages/shared/src/quests.ts`
  - `packages/server/src/content/bosses.ts`
  - `packages/client/src/systems/KingdomRestorationArc.ts`

### Chunk 4 - Gameplay look pass (camera + readability + exploration feel)

1. Closer gameplay camera views in active exploration scenes
- Updated [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts):
  - default camera moved closer for path readability
  - camera presets added: 1 (wide), 2 (gameplay), 3 (close)
  - hero marker enlarged for better on-path readability

- Updated [packages/client/src/scenes/SanctuaryTrail.ts](packages/client/src/scenes/SanctuaryTrail.ts):
  - closer default camera
  - camera presets added: 1/2/3
  - hero marker enlarged
  - ambient + footstep audio connected

2. Sanctuary Isle overworld now feels more like live gameplay
- Updated [packages/client/src/scenes/SanctuaryIsleOverworld.ts](packages/client/src/scenes/SanctuaryIsleOverworld.ts):
  - closer default camera with 1/2/3 presets + wheel zoom
  - denser greenery scatter for stronger terrain read
  - added real exploration pickups (forage/water/material) across districts
  - live pickup progress HUD and collection feedback

3. Pickup readability pass
- Trail and overworld pickups now use stronger glow/pulse animation and clearer collection feedback.

4. Validation
- Client build passes after look pass (64 modules transformed).

### Chunk 5 - Requests, inventory markers, and extra no-asset hooks

1. Sanctuary Town micro-request expansion
- Expanded request templates in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts) from 3 seeds to a larger rotating pool with additional:
  - trinket errands
  - ingredient pickups
  - delivery notes
- Kept rewards small and rapport-friendly, matching the existing progression intent.
- Updated request board copy to clarify rotating delivery/request availability.

2. Inventory clarity pass (Key/Quest/Needed Now)
- Updated [packages/client/src/ui/InventoryMenu.ts](packages/client/src/ui/InventoryMenu.ts):
  - renamed quest-needs tab label to `Needed Now`
  - added explicit per-item chips for:
    - `KEY ITEM`
    - `QUEST ITEM`
    - `NEEDED NOW`
  - added summary counters for key, quest, and needed-now totals
  - aligned `need-quest` filtering to the new unified needed-now logic.

3. Additional audio event hooks only (no paid assets)
- Added extra interaction hooks in [packages/client/src/scenes/SanctuaryHomeBase.ts](packages/client/src/scenes/SanctuaryHomeBase.ts) using existing `AudioManager` methods only:
  - action button feedback (gather/craft/egg care/inspect/rest)
  - route transitions (trail/town/story/return)
  - fishing catch interaction
  - low-severity danger cue on blocked story access
- No new audio assets were introduced.

4. Validation
- Build command: `pnpm --filter @game/client build`
- Result: success (64 modules transformed).

### Chunk 6 - Camera baseline normalization

1. Unified baseline camera presets across core play scenes
- Updated [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts):
  - baseline zoom normalized to `1.26`
  - standardized camera preset keys to:
    - `1 = 1.14` (wide)
    - `2 = 1.26` (gameplay baseline)
    - `3 = 1.36` (close)
  - added clamped `setCameraZoom` helper for consistency.

- Updated [packages/client/src/scenes/HavenGrounds.ts](packages/client/src/scenes/HavenGrounds.ts):
  - added matching `1/2/3` camera preset hotkeys using the same baseline values as Town and Trail.

2. Result
- Haven, SanctuaryTrail, and SanctuaryTown now share a consistent gameplay baseline and preset model.

### Chunk 7 - Sanctuary Isle navigation guidance + dock-first travel flow

1. Travel guidance HUD added in [packages/client/src/scenes/SanctuaryIsleOverworld.ts](packages/client/src/scenes/SanctuaryIsleOverworld.ts)
- Added compact triangular direction arrow and compass needle guidance toward the current objective route marker.
- Added objective distance readout (`Guide: <location> (<distance>m)`) for immediate orientation help.

2. Map view switching in Sanctuary Isle overworld
- Added `M` toggle between Travel View and Map View.
- In Map View, guidance HUD elements (compass + arrow) are hidden by design.
- Returning to Travel View restores follow camera and guidance overlays.

3. Dock-first arrival and cross-island route intent
- Hero now starts at Visiting Dock in Sanctuary Isle overworld to reflect boat arrival from external zones.
- Expanded on-map route writing to include Visiting Dock -> Fishers Walk -> Market Stretch -> Towne Lane -> Greenwood/Home Base pathing.

4. Haven/Forest routing updated to dock flow
- Updated direct sanctuary travel from [packages/client/src/scenes/HavenGrounds.ts](packages/client/src/scenes/HavenGrounds.ts), [packages/client/src/scenes/Haven.ts](packages/client/src/scenes/Haven.ts), and [packages/client/src/scenes/ForestZone.ts](packages/client/src/scenes/ForestZone.ts) to route through `SanctuaryIsleOverworld` instead of direct Home Base teleport.

### Chunk 8 - Sanctuary residential interiors, shift flows, and purpose-driven street errands

1. Enterable home interiors for residential clusters
- Added five enterable residential cluster doors in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts):
  - Market Cluster Homes
  - Fishers Walk Cluster
  - Hallow Cluster Homes
  - Ring Path Homes
  - Hearth Row Homes
- Pressing `E` at a home-entry marker opens an interior overlay with cluster details and current shift usage.
- Pressing `E` or `ESC` exits interior view back to town navigation.

2. Time-of-day schedule flow differences (morning / afternoon / evening)
- Added shift flow profiles in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts) to vary:
  - ambient NPC count
  - movement lane bounds
  - movement speed ranges
  - shift summary in HUD
- Result: morning, afternoon, and evening each now produce distinct population movement feel.

3. Street/path-bound local errands
- Expanded town request schema in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts) with:
  - `street`
  - `routeHint`
- Updated all micro-request templates to bind each errand to a named street/path (e.g., Inne Lane, Market Cross, Fishers Walk, Ring Path, Poste Walk).
- Updated request accept/reminder/pickup/completion messaging to reference route names so streets feel purpose-driven rather than decorative.

4. Town readability support
- Added street/path signage labels in [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts) to reinforce route identity.

5. Validation
- Build command: `pnpm --filter @game/client build`

### Chunk 11 - Sanctuary request cadence + Needed Now tracking tune + small-screen chip readability

1. Sanctuary Town rotating request cadence pass
- Updated [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts):
  - introduced request queue status (`queued`) with cadence seeding by shift profile
  - limited board visibility to a rotating pool (`visiblePool: 4`)
  - limited concurrent active requests (`maxActive: 2`)
  - auto-rotates the next queued request into availability when one is completed
  - added live board status line (`open / active / queued`) for quick cadence readability.

2. Needed Now logic narrowed to explicit active tracking flags
- Updated [packages/client/src/ui/InventoryMenu.ts](packages/client/src/ui/InventoryMenu.ts):
  - `isNeededNow` now only returns true for explicitly flagged tracked items:
    - `item.neededForQuest`
    - `item.neededForCrafting`
  - removed broad inferred inclusion from key/quest category/tag heuristics.
  - `need-quest` view now specifically filters to `neededForQuest`.

3. Quick chip/readability pass for smaller screens
- Updated [packages/client/src/ui/InventoryMenu.ts](packages/client/src/ui/InventoryMenu.ts):
  - added compact-mode sizing adjustments (`window.innerWidth <= 640`)
  - improved chip padding/font size, marker spacing, and top-row wrapping behavior
  - adjusted summary text sizing for compact view.

4. Validation
- Build command: `pnpm --filter @game/client build`
- Result: success (66 modules transformed).

### Chunk 12 - Global location shortcut standard (I / M / Shift)

1. Shared shortcut utility added
- Added [packages/client/src/utils/locationShortcuts.ts](packages/client/src/utils/locationShortcuts.ts)
- New `createLocationShortcutHandler()` centralizes location-key behavior so controls stay consistent.
- Standardized core intent:
  - `M` = map action
  - `I` = inventory action
  - `Shift` = chat action (also keeps `C` as chat alias)

2. Applied shared shortcuts across built location scenes
- Updated these scenes to use the shared shortcut handler and global key listener lifecycle:
  - [packages/client/src/scenes/Haven.ts](packages/client/src/scenes/Haven.ts)
  - [packages/client/src/scenes/HavenGrounds.ts](packages/client/src/scenes/HavenGrounds.ts)
  - [packages/client/src/scenes/ForestZone.ts](packages/client/src/scenes/ForestZone.ts)
  - [packages/client/src/scenes/SanctuaryHomeBase.ts](packages/client/src/scenes/SanctuaryHomeBase.ts)
  - [packages/client/src/scenes/VolcanoZone.ts](packages/client/src/scenes/VolcanoZone.ts)
  - [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts)
  - [packages/client/src/scenes/SanctuaryTrail.ts](packages/client/src/scenes/SanctuaryTrail.ts)
  - [packages/client/src/scenes/SanctuaryIsleOverworld.ts](packages/client/src/scenes/SanctuaryIsleOverworld.ts)

3. Missing location handlers filled
- Added inventory/map/chat open handlers where absent:
  - [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts)
  - [packages/client/src/scenes/SanctuaryTrail.ts](packages/client/src/scenes/SanctuaryTrail.ts)
  - [packages/client/src/scenes/SanctuaryIsleOverworld.ts](packages/client/src/scenes/SanctuaryIsleOverworld.ts)
- Updated on-screen control hints to reflect `Shift=Chat` consistently.
- Removed redundant direct `I/M/C` listeners in Forest to avoid double-trigger behavior.

4. Validation
- Build command: `pnpm --filter @game/client build`
- Result: success (67 modules transformed).
- Result: success (64 modules transformed).

### Chunk 13 - Archaic nomenclature pass (old-timey 'e' suffix)

1. Applied archaic spelling transformation across all location/building names
- Standardized nomenclature throughout codebase for old-timey aesthetic:
  - `town` → `towne`
  - `inn` → `inne`
  - `post` / `post` → `poste` (already applied in prior updates)

2. Files updated with archaic naming
- [packages/client/src/data/SanctuaryLocationReference.ts](packages/client/src/data/SanctuaryLocationReference.ts):
  - Updated npcShorthandReferences from 'town center' to 'towne center'
  - Updated districtPurpose from 'from town traffic' to 'from towne traffic'

- [packages/client/src/data/SanctuaryNpcRoster.ts](packages/client/src/data/SanctuaryNpcRoster.ts):
  - Updated SANCTUARY_WEEKLY_SHIFT_MATRIX evening shift: 'Inn hand' → 'Inne hand'
  - Updated SANCTUARY_QUICK_CONVOS dialogue strings:
    - 'inn balcony' → 'inne balcony'
    - 'run town errands' → 'run towne errands'
  - Updated NPC_FLAVOR_LINES for Harbor Jae: 'owe this town' → 'owe this towne'
  - Updated NPC_FLAVOR_LINES for Wren: 'this town introduces' → 'this towne introduces'
  - Updated getQuickConvo default: 'around town' → 'around towne'

- [packages/client/src/data/SanctuaryWorldRules.ts](packages/client/src/data/SanctuaryWorldRules.ts):
  - Updated district name: 'Market and Inn Belt' → 'Market and Inne Belt'

- [packages/client/src/data/SanctuaryIsleNotes.ts](packages/client/src/data/SanctuaryIsleNotes.ts):
  - Updated codex entry: 'town record' → 'towne record'
  - Updated codex entry: 'town built it' → 'towne built it'

- [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts):
  - Updated ambient dialogue: 'town had a harder decade' → 'towne had a harder decade'
  - Updated map lore text: 'east of town' → 'east of towne'

- [packages/client/src/data/SanctuaryFamilyRoster.ts](packages/client/src/data/SanctuaryFamilyRoster.ts):
  - Updated household vibe description: 'Trading-post' → 'Trading-poste'

3. Impact & intent
- Cohesive old-timey branding across all location names and dialogue
- Maintains capitalization consistency (Towne for proper nouns, towne for generic references)
- Dialogue now reads with consistent archaic flair throughout location text and NPC interactions

4. Validation
- Build command: `pnpm --filter @game/client build`
- Result: success (67 modules transformed).

### Chunk 14 - Dynamic street rotation by shift (morning/afternoon/evening)

1. Street rotation system created
- Added [packages/client/src/data/SanctuaryStreetRotations.ts](packages/client/src/data/SanctuaryStreetRotations.ts):
  - `SANCTUARY_STREETS`: Central registry of 8 streets with shift-specific purposes
  - `getStreetPurpose()`: Returns shift-aware description for any street
  - `getStreetsForShift()`: Returns all streets sorted by shift emphasis
  - `getPrimaryStreetsForShift()`: Returns top 3 emphasized streets for current shift
  
  - Morning emphasis: Fishers Walk (dock prep), Market Cross (opening), Ring Path (training)
  - Afternoon emphasis: Market Cross (peak traffic), Poste Walk (courier rush), Ring Path (drills)
  - Evening emphasis: Hearth Row (tavern crowd), Fishers Walk (quiet pier), Inne Lane (rest prep)

2. Street signage now displays shift-specific activity
- Updated [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts):
  - Modified `drawStreetPathSignage()` to show street name + shift-specific purpose below
  - Each street displays what's actively happening during current shift
  - Text appears in shifted colors at street marker locations
  
  - Example: Market Cross morning = "Market opens, vendors setting up stalls"
  - Example: Market Cross afternoon = "Peak market traffic, restocking between shifts"
  - Example: Market Cross evening = "Vendors closing and loading unsold goods"

3. Requests now prioritize shift-emphasized streets
- Added shift-aware methods to SanctuaryTown scene:
  - `streetCoordinates`: Maps street names to marker positions for consistent errand placement
  - `getShiftEmphasisStreets()`: Returns emphasized streets for display in request pool
  - `prioritizeRequestsByShift()`: Orders requests by shift emphasis (called at init)
  
- Updated `getRequestCadenceOrder()`:
  - Type priorities already vary by shift (morning: ingredient→delivery→trinket, etc.)
  - NOW also sorts within types to favor emphasized streets
  - Morning peak errands pull from busy dock/market/training areas
  - Evening peak errands pull from tavern/quiet pier/rest areas

4. Impact & user experience
- Streets feel "alive" with contextual descriptions that change throughout the day
- Errand board naturally populates with location-appropriate requests
- Morning: "Gather salt reed from Fishers Walk" appears early in morning
- Evening: "Carry note to Hearth Row tavern" appears early in evening
- Path purpose updates dynamically as player traverses Sanctuary Towne across shifts

5. Validation
- Build command: `pnpm --filter @game/client build`
- Result: success (68 modules transformed).

### Chunk 15 - Discernment as core theme (replaces generic warnings/cautions)

1. Replaced all generic warning messages with discernment-focused language
- Updated [packages/client/src/systems/CreatBondSystem.ts](packages/client/src/systems/CreatBondSystem.ts):
  - "Your creat is malnourished and growing distant" → "Use your discernment: your creat is malnourished and pulling away"
  - "Bond is weakening. Your creat may disobey" → "Your discernment is needed. Bond is fragile — your creat may resist"
  - "Creat is hungry" → "Your discernment notices: creat needs nourishment"

- Updated [packages/client/src/ui/InventoryMenu.ts](packages/client/src/ui/InventoryMenu.ts):
  - Changed warning color from red (#fca5a5) to gold (#fde68a) for more wisdom/guidance feel
  - "Inventory over capacity from previous progression" → "Use your discernment: inventory overflowing from past journeys"

- Updated [packages/client/src/scenes/SanctuaryTown.ts](packages/client/src/scenes/SanctuaryTown.ts):
  - "Town board limit reached" → "Use your discernment: you are already engaged in X paths. Complete one before taking on another"
  - Added to welcome message: "Use your discernment"

- Updated [packages/client/src/scenes/HavenIntro.ts](packages/client/src/scenes/HavenIntro.ts):
  - Starting guidance: "Gather what you can. Haven rewards the observant" → "Use your discernment. Gather what you can. Haven rewards those who see clearly"
  - Knockback message: "You were knocked back, but the Haven still shelters you" → "Your discernment failed that moment. The Haven still shelters you. Choose your path more carefully"

- Updated [packages/client/src/scenes/ForestZone.ts](packages/client/src/scenes/ForestZone.ts):
  - Defeat message: "You were overwhelmed in the forest" → "You were overwhelmed. Your discernment will guide you better next time"

- Updated [packages/client/src/scenes/VolcanoZone.ts](packages/client/src/scenes/VolcanoZone.ts):
  - Defeat message: "Consumed by the volcano" → "The volcano consumed your discernment this time"

2. Added "Discernment" as first page of Player Guide
- Updated [packages/client/src/scenes/PlayerGuide.ts](packages/client/src/scenes/PlayerGuide.ts):
  - New opening page emphasizes discernment as core principle
  - Text: "Read your creat's needs. Recognize which path suits this moment. See opportunities others miss."
  - "Discernment is not impulse. It is the practice of seeing clearly, choosing wisely, and acting with intention."
  - Moved "How to Play" to page 2 to ensure discernment philosophy comes first

3. Philosophy & Impact
- "Discernment" replaces generic "proceed with caution" style language
- Players learn that the game values wisdom, observation, and thoughtful choice
- Warnings now feel like mentor guidance rather than system restrictions
- Color shift in warnings: red (#ef4444) → gold (#f59e0b/#fde68a) conveys learning/wisdom rather than danger
- Creates cohesive thematic experience where every setback is a lesson in discernment

4. Validation
- Build command: `pnpm --filter @game/client build`
- Result: success (68 modules transformed).

### Chunk 9 - Chat policy system: typography, tokens, priority routing, PM UX, faction-scoped broadcasts

1. Shared chat overlay introduced
- Added [packages/client/src/ui/GameChatOverlay.ts](packages/client/src/ui/GameChatOverlay.ts) as a centralized chat UI/policy module.
- Replaced scene-specific duplicate chat menus in:
  - [packages/client/src/scenes/Haven.ts](packages/client/src/scenes/Haven.ts)
  - [packages/client/src/scenes/HavenGrounds.ts](packages/client/src/scenes/HavenGrounds.ts)
  - [packages/client/src/scenes/SanctuaryHomeBase.ts](packages/client/src/scenes/SanctuaryHomeBase.ts)
  - [packages/client/src/scenes/VolcanoZone.ts](packages/client/src/scenes/VolcanoZone.ts)

2. Final typography hierarchy and exact channel color tokens
- Added explicit hierarchy tokens for title/section/channel/message/meta/announcement text sizing and weight in [packages/client/src/ui/GameChatOverlay.ts](packages/client/src/ui/GameChatOverlay.ts).
- Added explicit color-token set for channels and priorities, including faction-derived channel coloring.

3. Announcement priority rules
- Added routing policy in [packages/client/src/ui/GameChatOverlay.ts](packages/client/src/ui/GameChatOverlay.ts):
  - game news / changes / restrictions -> global only
  - low/medium achievements -> faction only
  - major milestones (Level 20+) -> global allowed

4. PM UX features
- Added PM inbox, unread counters, thread selection, recent thread preview, quick-reply actions, and mute/block controls in [packages/client/src/ui/GameChatOverlay.ts](packages/client/src/ui/GameChatOverlay.ts).

5. Faction-scoped achievements and announcements behavior
- Chat now reads player faction from registry keys and applies faction color styling.
- Achievement announcements are faction-scoped by default; only major milestones (Level 20+) are routed globally.
- Global feed is reserved for important game notices/news/changes/restrictions and major milestone events.

6. Validation
- Build command: `pnpm --filter @game/client build`
- Result: success (65 modules transformed).

### Chunk 10 - Cutscene preparedness checklist + Prep XP points system

1. Shared Prep XP point system implemented
- Added [packages/client/src/systems/PrepProgression.ts](packages/client/src/systems/PrepProgression.ts) with:
  - `getPrepProgress()`
  - `gainPrepXp()`
  - Prep Level progression and `prepXPLog` source tracking.

2. Story cutscene preparedness checklist implemented and surfaced
- Updated [packages/client/src/scenes/StoryIntro.ts](packages/client/src/scenes/StoryIntro.ts):
  - added visible `Cutscene Preparedness Checklist` panel
  - added live `Prep XP Points / Prep Level / Next Level` status panel
  - interaction beats now award XP via shared progression system
  - writes completion state via `storyCutscenePrepComplete` registry flag.

3. Prep XP gain normalization in existing prep loops
- Updated [packages/client/src/scenes/SanctuaryHomeBase.ts](packages/client/src/scenes/SanctuaryHomeBase.ts) fishing prep XP to use shared progression and show prep level in feedback.
- Updated [packages/client/src/scenes/ForestZone.ts](packages/client/src/scenes/ForestZone.ts) fishing/camp prep XP to use shared progression and show prep level in feedback.

4. Status
- The checklist and XP points system are now both implemented and explicitly listed in code and journal.

5. Validation
- Build command: `pnpm --filter @game/client build`
