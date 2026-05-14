import { describe, it, expect } from 'vitest';
import { BOSSES } from '../src/content/bosses';
import { createBossEncounter, isBossDefeated, resolveBossHit } from '../src/sim/boss';

describe('boss encounter simulation', () => {
  it('scales raid HP for tier 5 encounters', () => {
    const encounter = createBossEncounter(BOSSES[0], 5, 10);
    expect(encounter.maxHp).toBeGreaterThan(BOSSES[0].stats.hp);
  });

  it('advances phase when crossing threshold', () => {
    const encounter = createBossEncounter(BOSSES[1], 4, 3);
    const before = encounter.phase;

    while (encounter.phase === before && !isBossDefeated(encounter)) {
      resolveBossHit(encounter, { baseDamage: 200, crit: true });
    }

    expect(encounter.phase).toBeGreaterThan(before);
  });

  it('applies weakness-trigger status when elemental counter is used', () => {
    const encounter = createBossEncounter(BOSSES[1], 2, 1);
    const result = resolveBossHit(encounter, {
      baseDamage: 50,
      attackerElement: 'Fire',
      defenderElement: 'Frost'
    });

    expect(result.statusApplied).toBe('burn');
  });
});
