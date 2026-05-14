# Four Kingdom Starter Arc

Purpose: make the first four restorations the intentional early-mid progression lane around Sanctuary Isle.

## Arc Order

1. Aldermarch
2. Stormrage
3. Vastmalaise
4. Sunward

## Suggested Progression Targets

1. After Aldermarch
- Suggested hero level band: 8-11
- Suggested prep level floor: 4

2. After Stormrage
- Suggested hero level band: 11-15
- Suggested prep level floor: 7

3. After Vastmalaise
- Suggested hero level band: 15-19
- Suggested prep level floor: 10

4. After Sunward
- Suggested hero level band: 19-24
- Suggested prep level floor: 13

## Restoration Rewards (Per Kingdom)

1. Aldermarch
- +90 Prep XP
- +140 Gold
- +1 Potion

2. Stormrage
- +120 Prep XP
- +180 Gold
- +1 Potion
- +1 Aid

3. Vastmalaise
- +150 Prep XP
- +220 Gold
- +2 Potions
- +1 Aid

4. Sunward
- +180 Prep XP
- +280 Gold
- +2 Potions
- +2 Aid

## Arc Completion Bonus

After all four kingdom rewards are claimed:
- +140 Prep XP
- +350 Gold
- +2 Potions
- +2 Aid

## Implementation Notes

Source module:
- `packages/client/src/systems/KingdomRestorationArc.ts`

Content lock reference:
- `KINGDOMS_QUEST_KEYS_AND_ENEMIES_PACK.md`

Main call to award each restoration:
- `claimKingdomRestorationReward(registry, kingdomId)`

Guardrails:
- Each kingdom reward is claim-once
- Arc completion bonus is claim-once
