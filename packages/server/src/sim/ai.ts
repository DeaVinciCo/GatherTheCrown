export type EnemyAIState = 'idle' | 'chase' | 'retreat' | 'attack';

export interface EnemyAIParams {
  hp: number;
  distance: number;
}

/**
 * Very small state machine for enemies.
 * - "retreat" when HP is low
 * - "attack" when close to a target
 * - "chase" when a target is in sight
 * - otherwise "idle"
 */
export function basicEnemyAI(state: EnemyAIParams): EnemyAIState {
  if (state.hp < 20) return 'retreat';
  if (state.distance < 2) return 'attack';
  if (state.distance < 50) return 'chase';
  return 'idle';
}

