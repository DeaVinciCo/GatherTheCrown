# Release Test Log - RC1 - 2026-05-14

Scope: First release test log generated immediately after Phase A deployment validation work.

## Build Under Test
- Build target: @game/client
- Build command: pnpm --filter @game/client build
- Artifact path: packages/client/dist

## Environment
- Netlify CLI: netlify-cli/26.0.1
- Netlify account: Dea Vinci Co. (team: GAYte Keepers)
- Candidate site used for smoke checks: gather-the-crown-game (site id: 6d1b063d-bb5a-4f48-860b-7d108350ec3f)

## Test Cases

### RC1-A01 - Client production build
- Result: Pass
- Evidence: Vite build completes successfully and emits index.html plus assets.

### RC1-A02 - Publish directory integrity
- Result: Pass
- Evidence: packages/client/dist contains index.html, assets, and _redirects.

### RC1-A03 - Netlify auth and project visibility
- Result: Pass (with root-folder workflow caveat)
- Evidence: netlify status reports authenticated user.
- Evidence: netlify sites:list from packages/client returns 3 projects.

### RC1-A04 - Root-folder netlify build workflow
- Result: Fail
- Evidence: running netlify build from workspace root triggers monorepo selector crash.
- Error: TypeError: Cannot read properties of undefined (reading 'value').

### RC1-A05 - Client-folder netlify build workflow
- Result: Fail
- Evidence: netlify build from packages/client picks up root netlify.toml and fails command.
- Error: build.command cd packages/client && npx vite build resolves incorrectly when already inside packages/client.

### RC1-A06 - Draft preview deploy (no-build)
- Result: Pass
- Command: netlify deploy --no-build --dir dist --site 6d1b063d-bb5a-4f48-860b-7d108350ec3f
- Draft URL: https://6a05b238cd7ed03eafd6f18c--gather-the-crown-game.netlify.app
- Smoke check: Page opens and reports title Gather The Crown.

### RC1-A07 - Production deploy smoke (no-build)
- Result: Blocked
- Command: netlify deploy --no-build --prod --dir dist --site 6d1b063d-bb5a-4f48-860b-7d108350ec3f
- Blocker: Netlify 403 Account credit usage exceeded.

### RC1-A08 - Production URL load check
- Result: Fail
- URL checked: https://gather-the-crown-game.netlify.app
- Outcome: Site not found (404).

### RC1-A09 - Root-folder netlify build with explicit filter
- Result: Pass
- Command: netlify build --filter @game/client
- Evidence: Build completes successfully using final netlify.toml command.

### RC1-A10 - Client-folder netlify build after final command patch
- Result: Pass
- Command: netlify build (from packages/client)
- Evidence: Build completes successfully with netlify.toml command pnpm --filter @game/client build.

### RC1-A11 - Production deploy smoke retry (no-build)
- Result: Blocked
- Command: netlify deploy --no-build --prod --dir dist --site 6d1b063d-bb5a-4f48-860b-7d108350ec3f
- Blocker: Netlify 403 Account credit usage exceeded.

## Summary
- Passed: 6
- Failed: 2
- Blocked: 2

## Blockers
1. Netlify account credit usage exceeded prevents production deploy.
2. Root-folder Netlify CLI monorepo selector crash blocks normal netlify build workflow.
3. Current production URL for gather-the-crown-game resolves to Site not found.

## Recommended Immediate Fix Order
1. Restore deploy credits on Netlify account.
2. Confirm production site DNS/domain mapping for gather-the-crown-game.
3. Re-run production deploy smoke and full app route smoke.
