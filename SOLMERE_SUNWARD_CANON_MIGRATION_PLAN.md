# Solmere vs Sunward Canon Migration Plan

## Goal
Resolve naming drift between Solmere and Sunward with a low-risk path for runtime data, docs, and content references.

## Option A (Recommended): Dual Canon
- Keep Sunward as the gameplay geography and runtime key namespace.
- Keep Solmere as a faction/cultural alias used in lore text.
- Add explicit alias rule in narrative docs: "Solmere peoples originate from the Sunward realm."

### Why Option A
- No breaking change in IDs or save-state keys.
- Minimal code churn and lower regression risk.
- Lets existing documents keep Solmere flavor while runtime remains stable.

## Option B: Full Rename to Solmere
- Rename all Sunward keys, IDs, and item references to Solmere.
- Migrate existing save keys and add compatibility alias layer.

### Risks of Option B
- High chance of broken references across content packs and TS constants.
- Requires migration code for stored registry keys.
- Raises test surface for quests, locks, map routes, and boss metadata.

## Impact Matrix
- Runtime constants: high impact for Option B, low for Option A.
- Save compatibility: high impact for Option B, none for Option A.
- Narrative continuity: both options valid.
- Build stability: Option A safer.

## File Scope if Option B Is Chosen
- packages/shared/src/quests.ts
- packages/client/src/systems/MasterItemCatalog.ts
- packages/client/src/data/WorldLocationReference.ts
- packages/server/src/content/bosses.ts
- gtc_world_map_specifications.json
- KINGDOMS_QUEST_KEYS_AND_ENEMIES_PACK.md

## Backward Compatibility Rules (Required for Option B)
- Keep old Sunward IDs as aliases for at least one major content cycle.
- On load, map old keys to new Solmere keys before gameplay checks.
- On save, write both canonical and alias keys until migration window closes.

## Recommended Path
1. Adopt Option A now for production stability.
2. Add one canonical naming note in major lore docs.
3. Revisit full rename only if user-facing branding requires Solmere as primary realm name.
