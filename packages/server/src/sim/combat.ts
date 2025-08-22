export function resolveCombat(base: number): number {
  // Simple placeholder: add small random variance
  const variance = Math.random() * 5;
  return Math.floor(base + variance);
}
