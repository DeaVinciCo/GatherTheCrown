# Untouched Concepts Shortlist (2026-05-13)

Purpose: quick pull-list of high-value concepts not fully implemented in the active runtime track.

## Tier A - Next Build Candidates

1. Full attack slot system in CircleGem HUD
- Keep #1 static/non-droppable main attack
- #2-#5 player-selectable and droppable
- Per-slot active timer + cooldown timer + hover detail
- Why now: aligns directly with latest combat HUD direction

2. Creat survival panel completion
- Creat HP/stamina/boost/XP/food/happy with green->red scales
- Locked/unlocked states by growth stage and bond threshold
- Why now: core to companion fantasy and readability

3. Mana/potions/boost resources pass
- Top-right quadrant full behavior with quick-use and counts (ex: 5 max)
- Hover tooltips + click options
- Why now: requested directly and affects battle/race usability

4. Persistent metal frame + announcements rail
- Thin metal border around game viewport
- Bottom center-right marquee for crown/rank/achievement announcements
- Why now: strong identity layer and player feedback channel

5. Eternal Return-style camera rig package
- Slight angle behind-hero exploration camera
- Adjustable orbit/offset/zoom while moving
- Dedicated travel/search/combat/race profiles
- Why now: visual feel and navigation readability

## Tier B - High Value, Defer One Sprint

6. Kingdom restoration content expansion (runtime)
- Move more kingdom systems from docs into playable scene content
- Add progression-linked environment state changes

7. Skill tree runtime parity
- Expand from reference systems to full skill tree UI + progression effects

8. Faction ecosystem runtime pass
- Faction reputation visuals, faction-specific quest arcs, and route modifiers

9. Story-cinematic transitions
- Lightweight cutscene/sequence system for kingdom and crown milestones

## Tier C - Later Production

10. Full multiplayer expansion
- Race and battle netcode parity beyond prototype-level flows

11. Economy/Auction/Trade systems
- Extended market loops and long-term resource sinks

12. Device-specific performance pipeline
- Full mobile quality ladder + dynamic scaling + scene budget tooling

## Suggested Execution Order

1. CircleGem attack slots + cooldown bars
2. Creat panel completion
3. Mana/potions quick-use + hover/click menus
4. Border + marquee system
5. Camera rig profiles (Eternal Return-like travel view)

## Notes

- Keep internal IDs stable where possible to avoid regressions while improving player-facing labels.
- Prioritize one polished vertical slice (travel + battle + race HUD continuity) before broad feature fan-out.
