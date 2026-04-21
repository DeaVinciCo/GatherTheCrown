import { DROP_RATES, GOLD_MULTIPLIERS } from '@game/shared';
export function rollDrop(rarity) {
    return Math.random() < DROP_RATES[rarity];
}
export function calculateReward(base, multiplier = 'BASE') {
    return Math.floor(base * GOLD_MULTIPLIERS[multiplier]);
}
export function calculateCost(base, multiplier = 'BASE') {
    return Math.floor(base * GOLD_MULTIPLIERS[multiplier]);
}
export function applyInflation(cost, days, rate = 0.02) {
    return Math.floor(cost * Math.pow(1 + rate, days));
}
