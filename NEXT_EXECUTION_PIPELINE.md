# Next Execution Pipeline

## Objective
Lock current work, stabilize deployment, validate gameplay, then choose the next build with confidence.

## Phase A - Netlify Upgrade

1. Confirm current deploy target and branch strategy.
2. Validate build command for web client:
- `pnpm --filter @game/client build`
3. Ensure publish directory matches Vite output:
- `packages/client/dist`
4. Add/verify environment variables required by client runtime.
5. Run one preview deploy and one production deploy smoke check.

## Phase B - Game Testing Pass

1. Boot and menu flow
- app boot
- save/load entry
- route to Haven/HavenGrounds

2. Core scene traversal
- Sanctuary Isle entry from dock
- SanctuaryTown interaction loop
- ForestTrialsGate -> ForestZone routes
- VolcanoZone clear + return path

3. Systems regression checks
- prep/readiness banners and rewards
- route arrows and shift transitions in SanctuaryTown
- interior cooldown + tiny gains log behavior
- chat overlay open/send/close flow

4. Output
- one markdown test log with pass/fail + repro notes

## Phase C - Select Next Build

Use this filter:
1. Improves player clarity or retention
2. Low refactor risk
3. Uses existing systems instead of net-new frameworks

Top candidates:
1. Canonical naming pass in scenes/data imports
2. Dock entry coordinate mapping and travel UX
3. Forest/Volcano progression reward balancing polish

## Definition of Done for this pipeline

1. Netlify deployment path validated.
2. Testing log committed/updated.
3. Next build scope chosen with 3-7 explicit tasks.
