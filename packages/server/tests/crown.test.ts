import { describe, it, expect } from 'vitest';
import { applyCrownDurabilityLoss, createCrownPuzzle, insertCrownPiece } from '../src/sim/crown';

describe('crown puzzle and shatter system', () => {
  it('completes crown only when correct pieces are inserted', () => {
    const state = createCrownPuzzle('story-crown', 'story');

    expect(insertCrownPiece(state, 'metal-slot', 'Starforged')).toBe(true);
    expect(insertCrownPiece(state, 'gem-slot', 'Painite')).toBe(true);
    expect(insertCrownPiece(state, 'core-slot', 'Core')).toBe(true);
    expect(state.completed).toBe(true);
  });

  it('rejects wrong puzzle piece', () => {
    const state = createCrownPuzzle('melee-crown', 'melee');
    expect(insertCrownPiece(state, 'gem-slot', 'Sapphire')).toBe(false);
    expect(state.completed).toBe(false);
  });

  it('shatters crown when durability reaches zero', () => {
    const state = createCrownPuzzle('racing-crown', 'racing', 10);
    const result = applyCrownDurabilityLoss(state, 12);

    expect(result.shattered).toBe(true);
    expect(result.pulseSeconds).toBe(8);
    expect(state.shattered).toBe(true);
    expect(state.durability).toBe(0);
  });
});
