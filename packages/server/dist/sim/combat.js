export function resolveCombat(base) {
    // Simple placeholder: add small random variance
    const variance = Math.random() * 5;
    return Math.floor(base + variance);
}
