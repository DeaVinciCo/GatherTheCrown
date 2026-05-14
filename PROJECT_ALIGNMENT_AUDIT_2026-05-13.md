# Project Alignment Audit (2026-05-13)

## Why this audit exists
`COMPLETE_GAME_BUILD_SUMMARY.md` is valuable as historical design scope, but it is currently a Unity/C# plan and does not reflect the active Phaser + TypeScript + Vite implementation.

## What appears stale or not actively implemented

1. Engine/runtime mismatch
- The summary states `Platform: Unity (C#)` and `Ready to build this in Unity`.
- Active implementation is a web game in `packages/client` using Phaser 3 and Vite.

2. Architecture mismatch
- Summary lists many Unity scripts (`GameManager.cs`, `PlayerController.cs`, etc.).
- Current codebase uses TypeScript scene/system modules (`ForestZone.ts`, `SanctuaryTown.ts`, `HeroCreatNeedsTracker.ts`, etc.).

3. World naming mismatch (legacy vs current focus)
- Summary uses the legacy 8-kingdom set (Sylvara, Pyrrathia, etc.).
- Current world references also include the connected 4-kingdom naming lane (Aldermarch, Stormrage, Vastmalaise, Sunward) plus Sanctuary Isle.

4. Large unchecked sections likely not recently revisited
- Art/assets checklist block remains all unchecked.
- Technical requirements block remains all unchecked.
- 18-month roadmap phases remain unchecked and timeline-bound to a Unity pipeline.

## What should be treated as current source-of-truth

1. Active implementation
- `packages/client/src/**`

2. Current world/location references
- `packages/client/src/data/WorldLocationReference.ts`
- `packages/client/src/data/LocationSystem.ts`
- `packages/client/src/data/KingdomNamingSystem.ts`

3. Current build command
- `pnpm --filter @game/client build`

## Recommended handling for COMPLETE_GAME_BUILD_SUMMARY.md

1. Keep it as archival design scope.
2. Add a note at top in a later pass: "Historical Unity-era planning doc; see active execution docs for current stack."
3. Do not use it alone for implementation tracking.

## Immediate execution sequence (agreed practical flow)

1. Upgrade Netlify deployment pipeline.
2. Run focused game testing pass (functional + progression + scene transitions).
3. Pick next build scope from highest-impact, lowest-risk items.
4. Capture all new ideas in inbox first, then triage weekly.

## Candidate stale/untracked doc families to review next

1. Unity migration plans and `.cs` architecture references.
2. Long-horizon launch budget/timeline assumptions.
3. Legacy kingdom naming references that conflict with current canonical names.
