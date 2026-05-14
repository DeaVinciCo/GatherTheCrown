import { describe, it, expect } from 'vitest';
import { POTION_CAP, STRINGS, DROP_RATES, GOLD_MULTIPLIERS } from '../src';

describe('constants', () => {
  it('caps potions at six', () => {
    expect(POTION_CAP).toBe(6);
  });

  it('has a title string', () => {
    expect(STRINGS.en.title).toBeTruthy();
  });

  it('defines basic drop rates', () => {
    expect(DROP_RATES.COMMON).toBeGreaterThan(0);
  });

  it('uses a base gold multiplier of one', () => {
    expect(GOLD_MULTIPLIERS.BASE).toBe(1);
  });
});
