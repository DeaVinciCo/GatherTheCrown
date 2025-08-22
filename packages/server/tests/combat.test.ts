import { describe, it, expect } from 'vitest';
import { resolveCombat } from '../src/sim/combat';

describe('resolveCombat', () => {
  it('adds random variance to base damage', () => {
    const base = 10;
    const results = new Set<number>();
    for (let i = 0; i < 20; i++) {
      results.add(resolveCombat(base));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('never returns negative damage', () => {
    for (let i = 0; i < 10; i++) {
      expect(resolveCombat(0)).toBeGreaterThanOrEqual(0);
    }
  });
});
