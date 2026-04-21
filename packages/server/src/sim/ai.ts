export type EnemyAIState = 'idle' | 'chase' | 'retreat' | 'attack';

export interface EnemyAIParams {
  hp: number;
  distance: number;
  previousState?: EnemyAIState;
  canAttack?: boolean;
}

const LOW_HP_THRESHOLD = 20;
const ATTACK_RANGE = 2;
const ATTACK_EXIT_RANGE = 3;
const CHASE_RANGE = 50;
const DISENGAGE_RANGE = 60;

/**
 * State machine for enemies with hysteresis to prevent rapid state flipping.
 * - "retreat" when HP is low
 * - "attack" when close to a target (and canAttack is not false)
 * - "chase" when a target is in sight range
 * - "idle" otherwise
 */
export function basicEnemyAI(state: EnemyAIParams): EnemyAIState {
  if (state.hp < LOW_HP_THRESHOLD) return 'retreat';

  const wasAttacking = state.previousState === 'attack';

  // Use exit range when already attacking to prevent oscillation
  const attackThreshold = wasAttacking ? ATTACK_EXIT_RANGE : ATTACK_RANGE;

  if (state.distance < attackThreshold && state.canAttack !== false) {
    return 'attack';
  }

  const wasChasing = state.previousState === 'chase';
  const chaseThreshold = wasChasing ? DISENGAGE_RANGE : CHASE_RANGE;

  if (state.distance < chaseThreshold) {
    return 'chase';
  }

  return 'idle';
}

