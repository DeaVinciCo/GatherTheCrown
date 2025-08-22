import { DROP_RATES, GOLD_MULTIPLIERS } from '@game/shared';

export function rollDrop(rarity: keyof typeof DROP_RATES): boolean {
  return Math.random() < DROP_RATES[rarity];
}

export function calculateReward(base: number, multiplier: keyof typeof GOLD_MULTIPLIERS = 'BASE'): number {
  return Math.floor(base * GOLD_MULTIPLIERS[multiplier]);
}

export function calculateCost(base: number, multiplier: keyof typeof GOLD_MULTIPLIERS = 'BASE'): number {
  return Math.floor(base * GOLD_MULTIPLIERS[multiplier]);
}

export function applyInflation(cost: number, days: number, rate = 0.02): number {
  return Math.floor(cost * Math.pow(1 + rate, days));
}
