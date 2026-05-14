# GTC Folder Comparison Report
**Main Workspace** vs **`gtc/game-main/`**
_Created by Dea Vinci Co._

---

## Overview

Both folders are the **same TypeScript/Phaser/Colyseus monorepo** at different points in development.
The main workspace (`Gather the Crown Creats and Foes/`) is the more evolved version.
The second folder (`gtc/game-main/`) is an earlier snapshot packaged as `GatherTheCrown-CreatsAndFoes-v1.0-20250904.zip`.

Both share the same monorepo structure:
```
packages/
  client/   ← Phaser 3 + Vite
  server/   ← Colyseus + Express + Prisma
  shared/   ← Types, constants, quest definitions
```

---

## Identical Between Both (same or near-identical code)

| File | Notes |
|---|---|
| All 9 client scenes (BattleArena, Boot, CrownTrial01, District01, ForestZone, ForgeHero, Haven, MainMenu, Preload) | Main's Haven uses `t()` i18n helper; gtc uses raw `STRINGS.xxx` |
| `actors/HeroSprite.ts` | Identical |
| `cutscenes/CutscenePlayer.ts` | Identical |
| `environment/Weather.ts` | Identical |
| `ui/AchievementPanel.ts`, `ArtifactFrameHUD.ts`, `InventoryMenu.ts`, `LayoutManager.ts`, `SkillTree.ts`, `Widgets.ts` | Identical |
| `server/sim/ai.ts`, `crafting.ts`, `economy.ts`, `items.ts` | Identical |
| `server/rooms/BattleRoom.ts`, `LobbyRoom.ts`, `StoryRoom.ts` | Identical |
| `shared/src/types.ts`, `constants.ts`, `messages.ts` | Identical |
| `package.json`, `tsconfig.base.json`, `pnpm-workspace.yaml` | Identical |

---

## In `gtc/game-main` Only (NOT in main workspace — now merged)

| File | Purpose | Action Taken |
|---|---|---|
| `packages/client/src/ui/Menus.ts` | Stub developer store overlay | ✅ Ported to main |
| `packages/client/src/ui/Tooltips.ts` | `attachTooltip(el, text)` helper | ✅ Ported to main |
| `packages/shared/src/strings.ts` | Flat STRINGS constant (old i18n) | ℹ️ Main upgraded this to `locale/i18n.ts` — not needed |
| `packages/shared/tests/basic.test.ts` | Constants unit tests | ℹ️ Main has equivalent (updated for i18n) |
| `GatherTheCrown-CreatsAndFoes-v1.0-20250904.zip` | Packaged build snapshot | ℹ️ Archive only — no Godot project inside |

---

## In Main Workspace Only (NOT in `gtc/game-main`)

| File | Purpose | Status |
|---|---|---|
| `packages/server/src/sim/boss.ts` | 5-tier boss encounter system with phases, enrage, raid scaling | ✅ Fully implemented |
| `packages/server/src/sim/crown.ts` | Crown puzzle slots, durability, shatter mechanics | ✅ Fully implemented |
| `packages/server/src/sim/combat.ts` | Full elemental system (gtc has 5-line stub) | ✅ Fully implemented |
| `packages/server/tests/boss.test.ts` | Boss tier/phase/elemental tests | ✅ Passing |
| `packages/server/tests/crown.test.ts` | Crown insertion/shatter tests | ✅ Passing |
| `packages/client/src/locale/i18n.ts` | i18n wrapper (upgrade from STRINGS) | ✅ Present |
| `packages/client/src/audio/AudioManager.ts` | Sound system | ✅ Present |
| `packages/server/src/content/bosses.ts` | 3 authored bosses (Fire, Frost, Earth) | ✅ Present |
| `packages/server/src/content/creats.ts` | 3 authored creats (Pyrogryph, Frostling, Terradrake) | ✅ Present |
| `packages/server/src/content/weapons.ts` | Weapon definitions | ✅ Present |
| `packages/server/src/persistence/HeroStore.ts` | Prisma hero persistence | ✅ Present |
| All design docs (18 .txt + 25+ .md files) | Full GDD and system specs | ✅ Present |
| Unity project (`Gather the Crown/Assets/Scripts/`) | C# game build | ✅ Present |
| Python prototype (`prototype/*.py`) | Pygame playable prototype | ✅ Present |
| TypeScript prototype (`prototypes/`) | TS multi-mode prototype | ✅ Present |
| All `gtc_*.json` data files | Boss, economy, combat, map specs | ✅ Present |

---

## Key Differences Summary

### `packages/server/src/sim/combat.ts`
- **gtc**: 5-line placeholder (`base + random(5)`)
- **Main**: Full 10-element system with counters, status effects, crit, variance

### `packages/client/src/scenes/Haven.ts`
- **gtc**: Uses `STRINGS.menu_forest` (direct string constant)
- **Main**: Uses `t('menu_forest')` (i18n function from `locale/i18n.ts`)

### `packages/shared/src/`
- **gtc**: Has `strings.ts` (flat object)
- **Main**: Has `locale/i18n.ts` (proper i18n with locale keys) — evolved version

---

## Test Results (Main Workspace)

All 8 server tests pass:
```
✓ crown puzzle and shatter system > completes crown only when correct pieces are inserted
✓ crown puzzle and shatter system > rejects wrong puzzle piece
✓ crown puzzle and shatter system > shatters crown when durability reaches zero
✓ resolveCombat > adds random variance to base damage
✓ resolveCombat > never returns negative damage
✓ boss encounter simulation > scales raid HP for tier 5 encounters
✓ boss encounter simulation > advances phase when crossing threshold
✓ boss encounter simulation > applies weakness-trigger status when elemental counter is used

Test Files: 3 passed (3) | Tests: 8 passed (8)
```

---

## Conclusion

The **main workspace is the definitive version** — it contains everything the gtc folder has, plus:
- Full boss, crown, and combat systems (implemented this session)
- Audio, i18n, persistence, authored content
- Complete game design documentation
- Unity and Python prototypes
- All data JSON files

The `gtc/game-main/` folder is a clean earlier snapshot useful as a **backup reference**.
The `GatherTheCrown-CreatsAndFoes-v1.0-20250904.zip` inside it is a packaged archive of that same snapshot.

See [GODOT_PORTABILITY_REPORT.md](GODOT_PORTABILITY_REPORT.md) for full GDScript port guide.

---

*Dea Vinci Co. — Gather The Crown: Creats & Foes*
