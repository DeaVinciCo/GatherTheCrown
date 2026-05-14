import { gainPrepXp, type RegistryLike } from './PrepProgression';

type ActivityType = 'quest' | 'boss' | 'arena' | 'castle' | 'trial' | 'starter';
type NeedPriority = 'critical' | 'high' | 'medium' | 'casual';

interface HeroCreatSnapshot {
  heroHp: number;
  heroMaxHp: number;
  heroEnergy: number;
  heroMaxEnergy: number;
  heroHunger: number;
  creatHp: number;
  creatMaxHp: number;
  creatBond: number;
  creatHunger: number;
  potionCount: number;
  aidCount: number;
  equipmentDamage: number;
  studiedBossLore: boolean;
  knownArena: boolean;
  heroRested: boolean;
  inventoryOrganized: boolean;
}

export interface NeedCheckItem {
  id: string;
  label: string;
  priority: NeedPriority;
  met: boolean;
  rewardPrepXp: number;
  rewardGold: number;
  unmetHint: string;
}

export interface NeedsAssessment {
  activity: ActivityType;
  readinessScore: number;
  checklist: NeedCheckItem[];
  metCount: number;
  criticalMetCount: number;
  criticalTotal: number;
  missingCritical: NeedCheckItem[];
  summary: string;
}

export interface NeedsRewardResult {
  granted: boolean;
  prepXpGained: number;
  goldGained: number;
  leveledUp: boolean;
  message: string;
}

function readNumber(registry: RegistryLike, key: string, fallback: number): number {
  const raw = Number(registry.get(key));
  return Number.isFinite(raw) ? raw : fallback;
}

function readBool(registry: RegistryLike, key: string): boolean {
  return !!registry.get(key);
}

function readSnapshot(registry: RegistryLike): HeroCreatSnapshot {
  const heroMaxHp = Math.max(1, readNumber(registry, 'heroMaxHp', 100));
  const heroHp = Math.max(0, readNumber(registry, 'heroHp', heroMaxHp));
  const heroMaxEnergy = Math.max(1, readNumber(registry, 'heroMaxEnergy', 100));
  const heroEnergy = Math.max(0, readNumber(registry, 'heroEnergy', heroMaxEnergy));
  const creatMaxHp = Math.max(1, readNumber(registry, 'creatMaxHp', 100));
  const creatHp = Math.max(0, readNumber(registry, 'creatHp', creatMaxHp));

  return {
    heroHp,
    heroMaxHp,
    heroEnergy,
    heroMaxEnergy,
    heroHunger: Math.max(0, readNumber(registry, 'heroHunger', 10)),
    creatHp,
    creatMaxHp,
    creatBond: Math.max(0, Math.min(100, readNumber(registry, 'creatBond', 45))),
    creatHunger: Math.max(0, readNumber(registry, 'creatHunger', 10)),
    potionCount: Math.max(0, readNumber(registry, 'potionCount', 2)),
    aidCount: Math.max(0, readNumber(registry, 'aidCount', 1)),
    equipmentDamage: Math.max(0, readNumber(registry, 'equipmentDamage', 0)),
    studiedBossLore: readBool(registry, 'studiedBossLore'),
    knownArena: readBool(registry, 'knownArena'),
    heroRested: readBool(registry, 'heroRested'),
    inventoryOrganized: readBool(registry, 'inventoryOrganized'),
  };
}

function buildThresholds(activity: ActivityType) {
  if (activity === 'starter') {
    return {
      heroHpPct: 0.35,
      heroEnergyPct: 0.35,
      heroHungerMax: 45,
      creatHpPct: 0.3,
      creatBondMin: 20,
      creatHungerMax: 35,
      minPotions: 0,
      minAid: 0,
    };
  }
  if (activity === 'boss') {
    return {
      heroHpPct: 0.7,
      heroEnergyPct: 0.7,
      heroHungerMax: 20,
      creatHpPct: 0.6,
      creatBondMin: 60,
      creatHungerMax: 15,
      minPotions: 3,
      minAid: 1,
    };
  }
  if (activity === 'castle') {
    return {
      heroHpPct: 1,
      heroEnergyPct: 0.9,
      heroHungerMax: 10,
      creatHpPct: 0.7,
      creatBondMin: 70,
      creatHungerMax: 10,
      minPotions: 4,
      minAid: 2,
    };
  }
  if (activity === 'arena') {
    return {
      heroHpPct: 0.55,
      heroEnergyPct: 0.6,
      heroHungerMax: 30,
      creatHpPct: 0.4,
      creatBondMin: 40,
      creatHungerMax: 25,
      minPotions: 1,
      minAid: 0,
    };
  }
  if (activity === 'trial') {
    return {
      heroHpPct: 0.45,
      heroEnergyPct: 0.45,
      heroHungerMax: 40,
      creatHpPct: 0.35,
      creatBondMin: 30,
      creatHungerMax: 30,
      minPotions: 1,
      minAid: 0,
    };
  }
  return {
    heroHpPct: 0.5,
    heroEnergyPct: 0.6,
    heroHungerMax: 30,
    creatHpPct: 0.4,
    creatBondMin: 40,
    creatHungerMax: 20,
    minPotions: 2,
    minAid: 1,
  };
}

export function assessHeroCreatNeeds(registry: RegistryLike, activity: ActivityType): NeedsAssessment {
  const s = readSnapshot(registry);
  const t = buildThresholds(activity);

  const checks: NeedCheckItem[] = activity === 'starter'
    ? [
      {
        id: 'hero_hp',
        label: `Hero HP >= ${Math.round(t.heroHpPct * 100)}%`,
        priority: 'critical',
        met: s.heroHp >= s.heroMaxHp * t.heroHpPct,
        rewardPrepXp: 3,
        rewardGold: 0,
        unmetHint: 'Recover HP before heading out.',
      },
      {
        id: 'hero_energy',
        label: `Hero Energy >= ${Math.round(t.heroEnergyPct * 100)}%`,
        priority: 'critical',
        met: s.heroEnergy >= s.heroMaxEnergy * t.heroEnergyPct,
        rewardPrepXp: 3,
        rewardGold: 0,
        unmetHint: 'Rest or eat to restore energy.',
      },
      {
        id: 'hero_hunger',
        label: `Hero Hunger <= ${t.heroHungerMax}%`,
        priority: 'critical',
        met: s.heroHunger <= t.heroHungerMax,
        rewardPrepXp: 2,
        rewardGold: 0,
        unmetHint: 'Eat before the route starts.',
      },
      {
        id: 'creat_hp',
        label: `Creat HP >= ${Math.round(t.creatHpPct * 100)}%`,
        priority: 'critical',
        met: s.creatHp >= s.creatMaxHp * t.creatHpPct,
        rewardPrepXp: 4,
        rewardGold: 0,
        unmetHint: 'Give your creat a quick heal first.',
      },
    ]
    : [
    {
      id: 'hero_hp',
      label: `Hero HP >= ${Math.round(t.heroHpPct * 100)}%`,
      priority: 'critical',
      met: s.heroHp >= s.heroMaxHp * t.heroHpPct,
      rewardPrepXp: 6,
      rewardGold: 0,
      unmetHint: 'Recover HP before entering.',
    },
    {
      id: 'hero_energy',
      label: `Hero Energy >= ${Math.round(t.heroEnergyPct * 100)}%`,
      priority: 'critical',
      met: s.heroEnergy >= s.heroMaxEnergy * t.heroEnergyPct,
      rewardPrepXp: 5,
      rewardGold: 0,
      unmetHint: 'Rest or eat to restore energy.',
    },
    {
      id: 'hero_hunger',
      label: `Hero Hunger <= ${t.heroHungerMax}%`,
      priority: 'critical',
      met: s.heroHunger <= t.heroHungerMax,
      rewardPrepXp: 4,
      rewardGold: 0,
      unmetHint: 'Eat before departure.',
    },
    {
      id: 'creat_hp',
      label: `Creat HP >= ${Math.round(t.creatHpPct * 100)}%`,
      priority: 'critical',
      met: s.creatHp >= s.creatMaxHp * t.creatHpPct,
      rewardPrepXp: 7,
      rewardGold: 0,
      unmetHint: 'Heal or feed your creat.',
    },
    {
      id: 'creat_bond',
      label: `Creat Bond >= ${t.creatBondMin}%`,
      priority: 'critical',
      met: s.creatBond >= t.creatBondMin,
      rewardPrepXp: 8,
      rewardGold: 0,
      unmetHint: 'Do a bonding activity first.',
    },
    {
      id: 'creat_hunger',
      label: `Creat Hunger <= ${t.creatHungerMax}%`,
      priority: 'critical',
      met: s.creatHunger <= t.creatHungerMax,
      rewardPrepXp: 5,
      rewardGold: 0,
      unmetHint: 'Feed your creat before battle.',
    },
    {
      id: 'supplies',
      label: `Potions >= ${t.minPotions}${t.minAid > 0 ? ` and Aid >= ${t.minAid}` : ''}`,
      priority: 'high',
      met: s.potionCount >= t.minPotions && s.aidCount >= t.minAid,
      rewardPrepXp: 5,
      rewardGold: 0,
      unmetHint: 'Pack more battle supplies.',
    },
    {
      id: 'equipment',
      label: 'Equipment Damage < 25%',
      priority: 'high',
      met: s.equipmentDamage < 25,
      rewardPrepXp: 6,
      rewardGold: 0,
      unmetHint: 'Repair gear before combat.',
    },
    {
      id: 'intel',
      label: activity === 'boss' ? 'Boss lore studied' : 'Arena route known',
      priority: 'medium',
      met: activity === 'boss' ? s.studiedBossLore : s.knownArena,
      rewardPrepXp: 6,
      rewardGold: 0,
      unmetHint: activity === 'boss' ? 'Study boss lore.' : 'Scout arena layout.',
    },
    {
      id: 'rest_state',
      label: 'Recent rest completed',
      priority: 'medium',
      met: s.heroRested,
      rewardPrepXp: 5,
      rewardGold: 0,
      unmetHint: 'Take a short rest.',
    },
    {
      id: 'inventory_order',
      label: 'Inventory organized',
      priority: 'casual',
      met: s.inventoryOrganized,
      rewardPrepXp: 3,
      rewardGold: 0,
      unmetHint: 'Organize inventory for fast access.',
    },
  ];

  const metCount = checks.filter((c) => c.met).length;
  const critical = checks.filter((c) => c.priority === 'critical');
  const criticalMetCount = critical.filter((c) => c.met).length;
  const readinessScore = Math.round((metCount / checks.length) * 100);
  const missingCritical = critical.filter((c) => !c.met);

  const summary = missingCritical.length === 0
    ? `Readiness ${readinessScore}%: all critical needs met.`
    : `Readiness ${readinessScore}%: ${missingCritical.length} critical need(s) missing.`;

  return {
    activity,
    readinessScore,
    checklist: checks,
    metCount,
    criticalMetCount,
    criticalTotal: critical.length,
    missingCritical,
    summary,
  };
}

export function applyNeedsRewards(
  registry: RegistryLike,
  assessment: NeedsAssessment,
  rewardKey: string
): NeedsRewardResult {
  const key = `needsRewardClaimed_${rewardKey}`;
  if (registry.get(key)) {
    return {
      granted: false,
      prepXpGained: 0,
      goldGained: 0,
      leveledUp: false,
      message: 'Checklist rewards already claimed for this run.',
    };
  }

  const metChecks = assessment.checklist.filter((c) => c.met);
  let prepXp = 0;
  let gold = 0;

  for (const check of metChecks) {
    prepXp += check.rewardPrepXp;
    gold += check.rewardGold;
  }

  if (assessment.missingCritical.length === 0) {
    if (assessment.activity === 'starter') {
      prepXp += 4;
      gold += 8;
    } else if (assessment.activity === 'trial') {
      prepXp += 8;
      gold += 15;
    } else {
      prepXp += 20;
      gold += 50;
    }
  }

  const xpResult = gainPrepXp(registry, prepXp, `needs_check:${assessment.activity}`);
  const currentGold = Math.max(0, readNumber(registry, 'gold', 0));
  registry.set('gold', currentGold + gold);
  registry.set(key, true);

  return {
    granted: true,
    prepXpGained: prepXp,
    goldGained: gold,
    leveledUp: xpResult.leveledUp,
    message: `Checklist rewards granted: +${prepXp} Prep XP, +${gold} Gold.`,
  };
}
