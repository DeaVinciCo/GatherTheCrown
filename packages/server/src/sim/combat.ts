export type CombatElement =
  | 'Fire'
  | 'Water'
  | 'Earth'
  | 'Air'
  | 'Storm'
  | 'Frost'
  | 'Light'
  | 'Shadow'
  | 'Arcane'
  | 'Void';

export interface CombatInput {
  attackerElement?: CombatElement;
  defenderElement?: CombatElement;
  critChance?: number;
  critMultiplier?: number;
  resistPercent?: number;
  bonusDamage?: number;
}

export type CombatStatus = 'freeze' | 'burn' | 'stun' | 'silence' | 'confuse';

export interface CombatResult {
  damage: number;
  isCrit: boolean;
  elementMultiplier: number;
  statusApplied?: CombatStatus;
}

const ELEMENTAL_COUNTERS: Partial<Record<CombatElement, CombatElement>> = {
  Fire: 'Frost',
  Frost: 'Fire',
  Storm: 'Earth',
  Earth: 'Storm',
  Shadow: 'Light',
  Light: 'Shadow'
};

const WEAKNESS_STATUS: Record<string, CombatStatus> = {
  'Fire>Frost': 'burn',
  'Frost>Fire': 'freeze',
  'Storm>Earth': 'stun',
  'Earth>Storm': 'stun',
  'Shadow>Light': 'confuse',
  'Light>Shadow': 'silence'
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function resolveCombatDetailed(base: number, input: CombatInput = {}): CombatResult {
  const safeBase = Math.max(0, base);
  const critChance = clamp(input.critChance ?? 0.1, 0, 1);
  const critMultiplier = Math.max(1, input.critMultiplier ?? 1.5);
  const resistPercent = clamp(input.resistPercent ?? 0, 0, 0.95);
  const bonusDamage = input.bonusDamage ?? 0;

  const variance = Math.floor(Math.random() * 6);
  const isCrit = Math.random() < critChance;

  let elementMultiplier = 1;
  let statusApplied: CombatStatus | undefined;

  if (input.attackerElement && input.defenderElement) {
    const counter = ELEMENTAL_COUNTERS[input.attackerElement];
    if (counter === input.defenderElement) {
      elementMultiplier = 1.25;
      const statusKey = `${input.attackerElement}>${input.defenderElement}`;
      statusApplied = WEAKNESS_STATUS[statusKey];
    } else if (ELEMENTAL_COUNTERS[input.defenderElement] === input.attackerElement) {
      elementMultiplier = 0.85;
    }
  }

  const critValue = isCrit ? critMultiplier : 1;
  const mitigated = (safeBase + variance + bonusDamage) * elementMultiplier * critValue * (1 - resistPercent);
  const damage = Math.max(0, Math.floor(mitigated));

  return {
    damage,
    isCrit,
    elementMultiplier,
    statusApplied
  };
}

export function resolveCombat(base: number, input?: CombatInput): number {
  return resolveCombatDetailed(base, input).damage;
}
