export function basicEnemyAI(state: { hp: number }): 'attack' | 'idle' {
  return state.hp > 0 ? 'attack' : 'idle';
}
