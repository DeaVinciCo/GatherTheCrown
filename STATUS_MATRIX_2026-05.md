# Status Matrix (May 2026)

Purpose: Reality-based status across active runtime and legacy Unity track.

## Scope Rule
- Done: Implemented and build-validated in active branch.
- In Progress: Partial implementation or pending integration/testing.
- Not Started: Planned/designed but no active implementation in current track.

## A) Runtime Branch (TypeScript/Phaser) - Primary Track

### Done
- CircleGem curved quadrant HUD with readability/style refinements and left pop-out behavior.
- Camera baseline and presets across active exploration flow.
- Awakened-human terminology migration in player-facing runtime labels (partial broad pass completed).
- Core scene framework and traversal stack (menu, sanctuary flows, forest, haven, volcanic route paths).
- Audio hook foundation and settings integration baseline.
- Build stability: client builds successfully in recent validations.

### In Progress
- Canonical naming alignment across all scene/data imports and labels.
- End-to-end regression test log pipeline.
- Vertical-slice route implementation on locked 60-minute Rider's Path slice.
- Save/load hardening and edge-case migration handling.
- Creat evolution completion in active runtime route.

### Recently Unblocked/Completed
- Deployment pipeline closure (Netlify path/env/smoke test completion): Unblocked by netlify.toml build command patch for root/subfolder compatibility (2026-05-14).

### Not Started (or not started in this active runtime context)
- Full content scale targets (all kingdoms, full boss roster, full biomes).
- Multiplayer implementation for current runtime track.
- Full art/audio production package beyond targeted clarity polish.
- Final launch prep milestones (beta, release candidate, marketing package).

## B) Unity Track - Secondary (Paused for now)

### Done
- Unity script starter set exists under Unity/Scripts (core/manager/UI base scripts).
- Unity migration and setup documentation exists.

### In Progress
- None (feature development paused pending runtime vertical slice completion).

### Not Started
- Full Unity production implementation described in migration roadmap phases.
- Unity content buildout (scenes, assets, complete systems parity).
- Unity multiplayer and launch-oriented production phases.

## C) Documentation Integrity

### Done
- Master ordered todo created and locked with execution choices.
- Build journal logging cadence maintained for major changes.
- Canonical status notes and cross-links added to major roadmap/summary/migration docs.

### In Progress
- Source-of-truth normalization finalization for remaining legacy/archive planning docs.

### Not Started
- Full archival pass for outdated planning docs.
- Weekly status governance cadence section across roadmap/status docs.

## D) Immediate Execution Order (Active)

1. Complete Netlify pipeline validation and smoke checks.
2. Execute full gameplay testing pass and produce one pass/fail markdown log.
3. Execute the locked vertical-slice route with explicit start/end scenes and required transitions.
4. Harden save/load on the locked route.
5. Finish canonical naming pass for player-facing labels on that route.

## Decisions Locked
- Primary track: TypeScript runtime first.
- Next milestone: Playable vertical slice.
- Polish level: Enough to clearly communicate the game idea.
- Unity timing: Pause Unity feature dev until runtime slice ships.
- HUD style priority: Maximum readability under all scene conditions.
- Vertical-slice route: Forest Trials route sign/fork -> Rider's Path -> merge trail -> Sanctuary Isle Home Base return gate.
- Vertical-slice anchor boss: Thornmane (Tier 2 target profile).
- Vertical-slice target playtest length: 60 minutes.

## Execution Artifacts
- Sprint board: [SPRINT_1_DAY_BY_DAY_BOARD_2026-05.md](SPRINT_1_DAY_BY_DAY_BOARD_2026-05.md)
- Phase A validation log: [NETLIFY_PHASE_A_VALIDATION_2026-05-14.md](NETLIFY_PHASE_A_VALIDATION_2026-05-14.md)
