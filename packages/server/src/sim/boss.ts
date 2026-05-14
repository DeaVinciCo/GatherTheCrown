import { Boss } from '@game/shared';

export type BossTier = 1 | 2 | 3 | 4 | 5;

export interface BossPhase {
  phase: number;
  hpThreshold: number;
  damageMultiplier: number;
  resistanceMultiplier: number;
  enrage: boolean;
}

export interface BossEncounter {
  bossId: string;
  tier: BossTier;
  maxHp: number;
  hp: number;
  phase: number;
  phases: BossPhase[];
  playerCount: number;
  elementAdaptation?: string;
  activeStatuses: Array<'freeze' | 'burn' | 'stun' | 'silence' | 'confuse'>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getBossTierConfig(tier: BossTier): { hpMultiplier: number; phaseCount: number } {
  switch (tier) {
    case 1:
      return { hpMultiplier: 1, phaseCount: 1 };
    case 2:
      return { hpMultiplier: 1.5, phaseCount: 2 };
    case 3:
      return { hpMultiplier: 2.25, phaseCount: 3 };
    case 4:
      return { hpMultiplier: 3, phaseCount: 4 };
    case 5:
      return { hpMultiplier: 4, phaseCount: 4 };
    default:
      return { hpMultiplier: 1, phaseCount: 1 };
  }
}

export function createBossEncounter(boss: Boss, tier: BossTier, playerCount = 1): BossEncounter {
  const config = getBossTierConfig(tier);
  const raidScale = tier === 5 ? Math.max(1, playerCount * 0.35) : 1;
  const maxHp = Math.floor(boss.stats.hp * config.hpMultiplier * raidScale);

  const phases: BossPhase[] = [];
  for (let i = 1; i <= config.phaseCount; i++) {
    const hpThreshold = clamp(1 - i / (config.phaseCount + 1), 0.05, 0.95);
    phases.push({
      phase: i,
      hpThreshold,
      damageMultiplier: 1 + i * 0.12,
      resistanceMultiplier: clamp(1 - i * 0.08, 0.6, 1),
      enrage: tier >= 4 && i >= 3
    });
  }

  return {
    bossId: boss.id,
    tier,
    maxHp,
    hp: maxHp,
    phase: 1,
    phases,
    playerCount,
    activeStatuses: []
  };
}

export interface BossHitInput {
  baseDamage: number;
  crit?: boolean;
  attackerElement?: string;
  defenderElement?: string;
}

const WEAKNESS_STATUS: Record<string, 'freeze' | 'burn' | 'stun' | 'silence' | 'confuse'> = {
  'Fire>Frost': 'burn',
  'Frost>Fire': 'freeze',
  'Storm>Earth': 'stun',
  'Earth>Storm': 'stun',
  'Shadow>Light': 'confuse',
  'Light>Shadow': 'silence'
};

export function resolveBossHit(encounter: BossEncounter, input: BossHitInput): { damage: number; phaseChanged: boolean; statusApplied?: string } {
  const phaseData = encounter.phases[Math.max(0, encounter.phase - 1)];
  const critMultiplier = input.crit ? 1.5 : 1;
  const resisted = (input.baseDamage * critMultiplier) * phaseData.resistanceMultiplier;
  let damage = Math.max(1, Math.floor(resisted));
  let statusApplied: string | undefined;

  if (input.attackerElement && input.defenderElement) {
    const key = `${input.attackerElement}>${input.defenderElement}`;
    const status = WEAKNESS_STATUS[key];
    if (status) {
      statusApplied = status;
      encounter.activeStatuses.push(status);
      damage = Math.floor(damage * 1.2);
    }
  }

  encounter.hp = Math.max(0, encounter.hp - damage);

  const hpRatio = encounter.maxHp === 0 ? 0 : encounter.hp / encounter.maxHp;
  let phaseChanged = false;
  if (encounter.phase < encounter.phases.length) {
    const nextPhaseThreshold = encounter.phases[encounter.phase - 1].hpThreshold;
    if (hpRatio <= nextPhaseThreshold) {
      encounter.phase += 1;
      phaseChanged = true;
    }
  }

  return { damage, phaseChanged, statusApplied };
}

export function isBossDefeated(encounter: BossEncounter): boolean {
  return encounter.hp <= 0;
}
