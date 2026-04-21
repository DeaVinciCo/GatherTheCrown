export function resolveCombat(base: number): number {
  // Simple placeholder: add small random variance
  const variance = Math.random() * 5;
  return Math.max(0, Math.floor(base + variance));
}
