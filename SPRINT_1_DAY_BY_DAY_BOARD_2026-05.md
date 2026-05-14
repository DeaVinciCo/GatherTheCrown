# Sprint 1 Day-by-Day Board (May 2026)

Purpose: Convert locked vertical-slice decisions into executable daily work.

## Locked Slice Parameters
- Route start: Forest Trials route sign and fork selection.
- Route profile: Rider's Path.
- Route end: Sanctuary Isle Home Base return gate after merge trail and egg unlock.
- Anchor fight: Thornmane.
- Anchor fight tier target: Tier 2 (Roaming Boss / Worldbinder profile).
- Public playtest target length: 60 minutes.

## Sprint 1 Goal
Ship one stable, replayable vertical-slice candidate path with one anchor boss and one documented smoke/test pass pipeline.

## Day 1 - Deployment Baseline (Task 1)
- Validate client build command and publish directory.
- Validate Netlify config and redirect behavior.
- Confirm required client environment variables and create env checklist.
- Prepare preview and production smoke checklist templates.
- Output:
  - NETLIFY_PHASE_A_VALIDATION_2026-05-14.md updated with pass/fail and blockers.
- Definition of done:
  - Build and publish path are verified locally and deployment blockers are explicitly listed.

## Day 2 - Route Script Lock
- Implement and verify exact route script boundaries for Rider's Path:
  - start trigger
  - fork choice
  - merge trigger
  - egg unlock event
  - return gate handling
- Ensure route timer and objective text are deterministic.
- Definition of done:
  - One run follows the same route script from start to return without dead ends.

## Day 3 - Anchor Boss Integration (Thornmane)
- Add/align Thornmane encounter as route-end anchor.
- Tune to Tier 2 target profile:
  - 3-5 minute encounter budget
  - 2-3 readable mechanics
  - clear telegraph windows
- Add reward payload and post-fight state transition.
- Definition of done:
  - Boss can be triggered, completed, rewarded, and exited in one full route run.

## Day 4 - Save/Load and Progression Hardening
- Harden save points and resume behavior for this route.
- Validate checkpoint behavior before boss, after boss, and after return.
- Add guardrails for partial progress states.
- Definition of done:
  - Save and resume works at all critical points without route corruption.

## Day 5 - UX Readability and Prompt Clarity
- Standardize prompts and objective text for this route only.
- Verify HUD readability under movement/combat pressure.
- Ensure action prompts stay under 3-second comprehension rule.
- Definition of done:
  - New tester can follow route and boss flow without verbal coaching.

## Day 6 - Full Regression + Test Log
- Execute full route script with pass/fail capture.
- Run checklist:
  - boot/menu
  - route start/fork
  - traversal + pickups
  - boss
  - reward
  - return and summary
- Output:
  - one markdown log with repro notes for any failures.
- Definition of done:
  - Pass/fail log exists and blockers are prioritized.

## Day 7 - Public Slice Candidate Cut
- Resolve top-priority blockers from Day 6.
- Re-run smoke and full route checklist.
- Freeze candidate build scope.
- Definition of done:
  - Candidate build is tagged as ready or explicitly deferred with reasons.

## Backlog Parking Rule (during Sprint 1)
- Do not add net-new systems.
- Only accept work that improves clarity, stability, or completion of this slice path.

## Acceptance Metrics
- 60-minute end-to-end session is playable without hard blockers.
- Thornmane encounter is complete and readable.
- Deployment checklist and smoke checklist are executable and stored in repo.
- At least one full test report is produced in markdown.
