import { describe, it, expect } from 'vitest';
import { POTION_CAP, STRINGS } from '../src';

describe('constants', () => {
  it('caps potions at six', () => {
    expect(POTION_CAP).toBe(6);
  });

  it('has a title string', () => {
    expect(STRINGS.title).toBeTruthy();
  });
});
