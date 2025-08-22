export const POTION_CAP = 6;
export const SPELL_CAP = 12;
export const MANA_COOLDOWN_MS = 40000;

export const BOND_TIERS = {
  LOW: 0.5,
  MID: 0.75,
  MAX: 1.0
};

export const ELEMENTAL_COUNTERS: Record<string, string> = {
  Fire: 'Frost',
  Frost: 'Fire',
  Lightning: 'Earth',
  Earth: 'Lightning',
  Shadow: 'Light',
  Light: 'Shadow'
};
