# Netlify Phase A Validation - 2026-05-14

Objective: Execute Next Execution Pipeline Phase A and record verifiable outcomes.

## Scope
1. Confirm deploy target and branch strategy.
2. Validate build command for web client.
3. Validate publish directory.
4. Verify required environment variables.
5. Prepare preview and production smoke checks.

## Execution Results

### 1) Deploy target and branch strategy
- Result: Partially validated with explicit site IDs; git-branch strategy still blocked in this workspace context.
- Reason: Workspace is not a git repository here (no .git root available), but Netlify account and site list were validated from packages/client.
- Evidence:
  - git rev-parse --is-inside-work-tree -> failed
  - git branch --show-current -> failed
  - git remote -v -> failed
- Netlify sites discovered:
  - gather-the-crown-game (6d1b063d-bb5a-4f48-860b-7d108350ec3f)
  - duc-app (f872905f-e271-47fb-891e-556afcfb62f3)
  - gather-the-crown (5714b8ca-bb1c-46a7-9524-a935afa1d2c2)
- Action needed:
  - Run these checks from the repository root that contains .git, or re-open this workspace at the git root.

### 2) Build command validation
- Result: Pass.
- Command run:
  - pnpm --filter @game/client build
- Outcome:
  - Vite production build completed successfully.
  - Build artifact generated with index.html and asset bundle.

### 3) Publish directory validation
- Result: Pass.
- netlify.toml publish directory:
  - packages/client/dist
- Files present in publish dir after build:
  - index.html
  - assets/
  - _redirects

### 4) Environment variable validation
- Client runtime variable detected:
  - VITE_API_URL (from packages/client/src/utils/api.ts)
- Status:
  - Required variable identified.
  - Environment values per target environment still need confirmation in Netlify UI.

### 5) Netlify tooling and smoke readiness
- Netlify CLI availability:
  - netlify-cli/26.0.1 installed and callable.
- Netlify auth status:
  - authenticated as Dea Vinci Co. (team: GAYte Keepers).
- Root-folder workflow issue:
  - `netlify build` from workspace root triggers CLI monorepo selector crash (`TypeError: Cannot read properties of undefined (reading 'value')`).
- Client-folder workflow issue:
  - `netlify build` from packages/client fails because root `netlify.toml` uses `cd packages/client && npx vite build`, causing nested path failure.
- Preview smoke execution:
  - Pass via no-build deploy command:
    - `netlify deploy --no-build --dir dist --site 6d1b063d-bb5a-4f48-860b-7d108350ec3f`
  - Draft URL:
    - https://6a05b238cd7ed03eafd6f18c--gather-the-crown-game.netlify.app
  - URL smoke:
    - Page opens with title `Gather The Crown`.
- Production smoke execution:
  - Blocked on deploy attempt:
    - `netlify deploy --no-build --prod --dir dist --site 6d1b063d-bb5a-4f48-860b-7d108350ec3f`
  - Netlify API response:
    - 403 Forbidden: account credit usage exceeded.
  - Existing production URL check:
    - https://gather-the-crown-game.netlify.app returns Site not found (404).

## Phase A Status
- Overall: In progress (build-path validation complete; production deploy blocked externally).
- Complete:
  - Build command validation
  - Publish directory validation
  - Root and subfolder Netlify build compatibility via final command patch
  - Preview deploy smoke check
  
### Patch Log
- 2026-05-14: Patched netlify.toml build command for root/subfolder compatibility.
  - Interim command: `npx --prefix ./packages/client vite build`
    - Subfolder Netlify build: pass.
    - Root Netlify build with `--filter @game/client`: fail (`Could not resolve entry module "index.html"`).
  - Final command: `pnpm --filter @game/client build`
    - Verified pass from both root and `packages/client` contexts.
- 2026-05-14: Production no-build deploy retry executed.
  - Result: Blocked (403 Account credit usage exceeded).
- Blocked/Pending:
  - Git branch strategy confirmation in real git root
  - Production deploy smoke check

## Smoke Checklist (Ready to Run)

### Preview Deploy Smoke
- [x] Deploy preview from target branch/workspace root.
- [x] App loads at preview URL.
- [ ] Route fallback works for deep links.
- [ ] Main menu renders without console fatal errors.
- [ ] Forest route entry and return path load.
- [ ] API-backed calls resolve using preview env values.

### Production Deploy Smoke
- [ ] Deploy production from designated release branch. (blocked by Netlify credit cap)
- [ ] App boot and main menu pass.
- [ ] Critical route path pass (start -> route -> boss -> return).
- [ ] No fatal console/runtime errors.
- [ ] API endpoint and CORS behavior pass.

## Immediate Next Actions
1. Resolve Netlify account credit limit to unblock production deploys.
2. Re-run target/branch checks from actual git root.
3. Continue remaining preview smoke checks (route fallback, runtime route path, API checks).
4. Re-run production deploy smoke checklist after credit restoration.

Release test log:
- [RELEASE_TEST_LOG_2026-05-14_RC1.md](RELEASE_TEST_LOG_2026-05-14_RC1.md)
