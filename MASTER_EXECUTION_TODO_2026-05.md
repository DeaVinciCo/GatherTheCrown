# Master Execution Todo (May 2026)

Purpose: Single source of truth for what is left, in execution order, based on current runtime reality and long-term production goals.

Locked decisions (based on user guidance + first-game risk reduction):
- Primary track: TypeScript runtime first
- Next milestone: Playable vertical slice
- Polish level before next public build: Enough to clearly communicate the game idea (gameplay-first, targeted polish)
- Unity timing: Pause Unity feature development until runtime slice ships; keep Unity as later migration option
- HUD priority: Maximum readability under all scene and compact-layout conditions
- Vertical-slice route (locked): Forest Trials route sign/fork -> Rider's Path -> merge trail -> Sanctuary Isle Home Base return gate
- Vertical-slice anchor boss (locked): Thornmane
- Vertical-slice target length (locked): 60 minutes

Status legend:
- [ ] not started
- [~] in progress
- [x] done
- [!] blocked on decision

## 0) Decision Gates (Must lock first)

1. [x] Primary shipping track
- Locked: A (TypeScript runtime branch first, web-playable milestone)

2. [x] Scope target for the next milestone
- Locked: A (Playable vertical slice, 30-45 min)

3. [x] Visual direction lock for HUD/UI
- Locked: readability-first hierarchy and high contrast with style preserved.

4. [~] Lore naming lock
- In progress: canonical naming audit and alias cleanup pass still needed across all scenes/data labels.

5. [x] Asset strategy for next sprint
- Locked: B (Mixed) with gameplay-first execution and targeted polish where needed for clarity.

## 1) Source-of-Truth Cleanup (Documentation Integrity)

1. [x] Create one status matrix file (Done / In Progress / Not Started) for runtime and Unity separately.
2. [x] Mark legacy docs as design-complete vs implementation-complete to remove contradictions.
3. [x] Add cross-links from roadmap docs to the status matrix.
4. [ ] Freeze old milestone docs as archival where outdated.

## PATCH LOG (2026-05-14)
- [x] Patched netlify.toml build command for root/subfolder compatibility (monorepo-safe, context-agnostic build command; see BUILD_JOURNAL.md for details).
5. [ ] Add weekly cadence section (what gets updated, by whom, and when).

Definition of done:
- Any person can read one file and know exactly what is truly done right now.

## 2) Runtime Branch Release Baseline (Current Track)

1. [~] Complete Next Execution Pipeline Phase A (Netlify path validation).
2. [ ] Complete Next Execution Pipeline Phase B (full gameplay test pass with log).
3. [ ] Complete Next Execution Pipeline Phase C (next build selected with 3-7 tasks).
4. [x] Create/refresh deployment checklist (env vars, branch, publish directory, smoke tests).
5. [x] Add one test report file per release candidate run.

Definition of done:
- Clean deploy path, reproducible smoke checks, and written pass/fail history.

## 3) Core Gameplay Completion (High Priority)

1. [ ] Character creation flow finalization.
2. [ ] Save/load hardening (start, checkpoint, return, and migration edge cases).
3. [ ] Creat evolution feature completion in runtime scenes.
4. [ ] Audio system pass (music loops, SFX priorities, volume routing, mute states).
5. [ ] Settings/accessibility pass (controls, motion, audio, readability).

Definition of done:
- A new player can start, play, save, return, and continue without confusion.

## 4) UX and Readability Pass (Gameplay Clarity)

1. [ ] Finalize CircleGem HUD hierarchy and tune to gameplay readability thresholds.
2. [ ] Standardize in-scene prompts and action wording.
3. [ ] Inventory clarity pass (key items, needed-now tagging, sorting defaults).
4. [ ] Quest/route guidance pass (map cues, route arrows, fallback hints).
5. [ ] Camera consistency pass across all active scenes.

Definition of done:
- Players can identify next action in under 3 seconds in active gameplay loops.

## 5) Content Vertical Slice (Minimum Playable Slice)

1. [x] Lock one primary route start to finish (story + combat + reward + return).
2. [ ] Ensure one full kingdom loop has complete objectives and resolution.
3. [x] Include at least one meaningful boss encounter with proper reward pacing.
4. [ ] Include one progression gate and one unlock event.
5. [ ] Add end-of-slice summary panel (stats, rewards, next objective).

Definition of done:
- 30-45 minute coherent slice without placeholder-critical blockers.

## 6) Art/Audio Production Gate

1. [ ] Decide and publish art style constraints (palette, line, proportions, icon language).
2. [ ] Fill immediate asset gaps for the vertical slice only.
3. [ ] Create prioritized asset queue for post-slice expansion.
4. [ ] Complete baseline audio package for UI, movement, combat, rewards, ambience.

Definition of done:
- Vertical slice feels intentional, not prototype-random.

## 7) Technical Hardening

1. [ ] Regression checklist for core scenes (boot/menu/travel/combat/save/load).
2. [ ] Error budget and known issues list with severity tags.
3. [ ] Performance pass for target platforms (at least web baseline).
4. [ ] Build output monitoring (chunk warnings, dependency growth, startup time).
5. [ ] Crash/fallback handling for missing assets and malformed save state.

Definition of done:
- No game-breaking blockers in the primary slice path.

## 8) Expansion Backlog (After Vertical Slice)

1. [ ] Additional playable characters.
2. [ ] Additional creat roster by element targets.
3. [ ] Additional biomes and boss types.
4. [ ] Advanced multiplayer foundations.
5. [ ] Achievement/economy/faction depth pass.

## 9) Unity Track (Parallel or Later)

1. [ ] Confirm whether Unity is active development now or later milestone.
2. [ ] If active: map runtime systems to Unity script ownership and parity status.
3. [ ] If later: define freeze criteria before migration begins.
4. [ ] Keep Unity docs aligned to actual implementation status, not design status.

## Immediate Ordered Sprint (Recommended Start)

1. [x] Decision Gate #1 and #2 (track + milestone type).
2. [x] Source-of-Truth Cleanup task #1 (status matrix file).
3. [~] Next Execution Pipeline Phase A.
4. [ ] Next Execution Pipeline Phase B.
5. [ ] Next Execution Pipeline Phase C.
6. [ ] Core Gameplay Completion item #1 and #2.

Sprint board artifact:
- [SPRINT_1_DAY_BY_DAY_BOARD_2026-05.md](SPRINT_1_DAY_BY_DAY_BOARD_2026-05.md)
- [NETLIFY_PHASE_A_VALIDATION_2026-05-14.md](NETLIFY_PHASE_A_VALIDATION_2026-05-14.md)

---

## Open Questions (Fill as we decide)

- Locked route: Forest Trials route sign/fork -> Rider's Path -> merge trail -> Sanctuary Isle Home Base return gate.
- Locked boss: Thornmane (Tier 2 target profile).
- Locked target playtest length: 60 minutes.
