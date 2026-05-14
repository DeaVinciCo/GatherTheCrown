# Forest Trials Playtest Notes v1

Run context:
- Build: local dev (May 11, 2026)
- Scope: one-pass feel review + current numeric config check
- Architecture changes: none

## Route tested
- Gentle / Rider / Sovereign

## 1) Route identity
- Gentle: good (calm/open)
- Rider: good (balanced/adventure)
- Sovereign: good leaning slightly tight/risky (not horror)

## 2) Fog
- Gentle: good (light)
- Rider: good
- Sovereign: good (noticeably denser but still readable)

## 3) Sky tint
- Gentle: slightly weak to good
- Rider: good
- Sovereign: good

## 4) Enemy spacing
- Gentle: good (breathing room)
- Rider: good
- Sovereign: good to slightly crowded in short pockets

## 5) Pickup spacing
- Gentle: good
- Rider: good
- Sovereign: good

## 6) Path width
- Gentle: good (wide)
- Rider: good (standard)
- Sovereign: good (tight)

## 7) Egg moment
- good
- Triggering off final small-time skirmisher near route end feels correct before merge.

## 8) Overall feel
- Gentle: good
- Rider: good
- Sovereign: good / mildly stressful (intended)

---

# Numeric Micro-Tune Sheet (No system changes)

Current values:
- Enemy counts by route:
  - Gentle: 5
  - Rider: 6
  - Sovereign: 8
- Fog count:
  - Gentle: 4
  - Rider: 8
  - Sovereign: 12
- Sky alpha:
  - Gentle: 0.04
  - Rider: 0.06
  - Sovereign: 0.09
- Enemy spacing jitter:
  - Gentle(spread): 34
  - Rider(balanced): 20
  - Sovereign(packed): 12
- Pickup spread:
  - Gentle: 20
  - Rider: 16
  - Sovereign: 14

Suggested next micro-tune (numbers only):
- Keep enemy counts as-is (already in target ranges)
- Gentle sky alpha: 0.04 -> 0.045 (slightly more visual identity)
- Rider fog count: 8 -> 7 (clearer readability while keeping atmosphere)
- Sovereign pickup spread: 14 -> 15 (tiny unclutter pass)
- Sovereign packed spacing: 12 -> 13 (reduce momentary clumping)

Do not change:
- Fork -> route -> merge -> egg -> Sanctuary flow
- Final-skirmisher egg trigger timing
- One-map route-profile architecture
