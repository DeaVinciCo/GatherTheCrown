/**
 * PRE-BATTLE READINESS SYSTEM
 * 
 * Interactive checklist for preparing before boss battles, castle sweeps, 
 * and major quest encounters. Tracks prep activities and grants XP.
 * 
 * Used by: BattleArena, CrownTrial scenes, boss encounters
 */

import { gainPrepXp, type RegistryLike, type PrepGainResult } from './PrepProgression';

export interface PreBattleActivity {
  id: string;
  name: string;
  description: string;
  prepXpReward: number;
  requiresItem?: string;
  requiresCreatBond?: number;
  hint: string;
}

export interface PreBattleReadinessState {
  battleId: string;
  activitiesCompleted: string[];
  totalPrepXpEarned: number;
  readinessScore: number; // 0-100
  recommendedMinLevel?: number;
  difficulty: 'gentle' | 'moderate' | 'challenging' | 'legendary';
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * UNIVERSAL PREP ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const UNIVERSAL_PREP_ACTIVITIES: Record<string, PreBattleActivity> = {
  rest: {
    id: 'rest',
    name: 'Get Full Rest',
    description: 'Sleep before battle to restore HP and clarity.',
    prepXpReward: 5,
    hint: 'A well-rested hero fights with better focus.'
  },
  meal: {
    id: 'meal',
    name: 'Eat Proper Meal',
    description: 'Stock up with fresh food for energy and stamina.',
    prepXpReward: 4,
    requiresItem: 'food',
    hint: 'Hunger reduces combat effectiveness.'
  },
  equipment_check: {
    id: 'equipment_check',
    name: 'Inspect Equipment',
    description: 'Check weapons, armor, and gear for battle readiness.',
    prepXpReward: 6,
    hint: 'Worn or broken gear fails at critical moments.'
  },
  supplies_pack: {
    id: 'supplies_pack',
    name: 'Pack Battle Supplies',
    description: 'Gather potions, antidotes, and emergency items.',
    prepXpReward: 5,
    requiresItem: 'potion',
    hint: 'Mid-battle supply access can turn the tide.'
  },
  creat_care: {
    id: 'creat_care',
    name: 'Bond with Creat',
    description: 'Spend time with your creat companion to strengthen bond.',
    prepXpReward: 7,
    requiresCreatBond: 1,
    hint: 'Strong bond = better team synergy in battle.'
  },
  meditation: {
    id: 'meditation',
    name: 'Meditate & Center',
    description: 'Clear your mind and focus on the battle ahead.',
    prepXpReward: 5,
    hint: 'Mental clarity prevents panic in critical moments.'
  },
  route_plan: {
    id: 'route_plan',
    name: 'Study Battle Map',
    description: 'Review the arena or castle layout to plan strategy.',
    prepXpReward: 6,
    hint: 'Know the terrain before you step into it.'
  },
  divine_blessing: {
    id: 'divine_blessing',
    name: 'Seek Divine Favor',
    description: 'Prayer or ritual for luck and protection.',
    prepXpReward: 5,
    hint: 'A little faith goes a long way.'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * BOSS-SPECIFIC PREP ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const BOSS_PREP_ACTIVITIES: Record<string, PreBattleActivity> = {
  study_boss: {
    id: 'study_boss',
    name: 'Research Boss Lore',
    description: 'Learn about the boss\'s powers, weaknesses, and history.',
    prepXpReward: 8,
    hint: 'Knowledge of your enemy is half the battle.'
  },
  element_attune: {
    id: 'element_attune',
    name: 'Attune to Battle Element',
    description: 'Practice channeling the opposing or counter element.',
    prepXpReward: 8,
    hint: 'Elemental advantage shifts the balance of power.'
  },
  companion_training: {
    id: 'companion_training',
    name: 'Combat Drill with Creat',
    description: 'Practice combo attacks and battle formations.',
    prepXpReward: 10,
    requiresCreatBond: 2,
    hint: 'Synchronized moves hit harder than solo attacks.'
  },
  legacy_ritual: {
    id: 'legacy_ritual',
    name: 'Invoke Legacy Skills',
    description: 'Access special techniques passed down by past riders.',
    prepXpReward: 10,
    hint: 'Ancestral power awakens when most needed.'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * CASTLE SWEEP PREP ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const CASTLE_SWEEP_PREP_ACTIVITIES: Record<string, PreBattleActivity> = {
  map_scout: {
    id: 'map_scout',
    name: 'Scout Castle Layout',
    description: 'Gather intel on room layouts, traps, and patrol routes.',
    prepXpReward: 7,
    hint: 'Knowing the castle floor plan prevents dead ends.'
  },
  trap_training: {
    id: 'trap_training',
    name: 'Trap Disarming Practice',
    description: 'Refresh skills for disarming and avoiding traps.',
    prepXpReward: 8,
    hint: 'One missed trap can end the run.'
  },
  supply_cache: {
    id: 'supply_cache',
    name: 'Prepare Supply Cache',
    description: 'Stage emergency supplies at checkpoint locations.',
    prepXpReward: 6,
    hint: 'Mid-run resupply extends your reach deeper.'
  },
  escape_route: {
    id: 'escape_route',
    name: 'Plan Escape Route',
    description: 'Know your exit paths and fallback positions.',
    prepXpReward: 6,
    hint: 'A good escape plan lets you live to fight another day.'
  },
  creat_summon: {
    id: 'creat_summon',
    name: 'Attune Creat Recall',
    description: 'Ensure your creat can reach you at any checkpoint.',
    prepXpReward: 8,
    requiresCreatBond: 2,
    hint: 'Your creat can fetch supplies or provide combat support.'
  },
  light_source: {
    id: 'light_source',
    name: 'Prepare Light Sources',
    description: 'Stock torches, lanterns, and magical lights.',
    prepXpReward: 5,
    requiresItem: 'torch',
    hint: 'Darkness hides both threats and opportunities.'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * READINESS STATE MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════
 */

export function initializeReadinessState(
  battleId: string,
  difficulty: 'gentle' | 'moderate' | 'challenging' | 'legendary' = 'moderate',
  recommendedLevel?: number
): PreBattleReadinessState {
  return {
    battleId,
    activitiesCompleted: [],
    totalPrepXpEarned: 0,
    readinessScore: 0,
    difficulty,
    recommendedMinLevel
  };
}

/**
 * Complete a prep activity and grant XP
 */
export function completePrepActivity(
  state: PreBattleReadinessState,
  activityId: string,
  registry: RegistryLike,
  activityLibrary: Record<string, PreBattleActivity>
): { success: boolean; message: string; xpResult?: PrepGainResult } {
  if (state.activitiesCompleted.includes(activityId)) {
    return { success: false, message: `Activity "${activityId}" already completed.` };
  }

  const activity = activityLibrary[activityId];
  if (!activity) {
    return { success: false, message: `Activity "${activityId}" not found.` };
  }

  // Grant prep XP
  const xpResult = gainPrepXp(registry, activity.prepXpReward, `battle_prep:${activityId}`);

  state.activitiesCompleted.push(activityId);
  state.totalPrepXpEarned += activity.prepXpReward;

  // Update readiness score (each activity = 10% + bonus for prep level)
  state.readinessScore = Math.min(
    100,
    (state.activitiesCompleted.length / Object.keys(activityLibrary).length) * 100
  );

  return {
    success: true,
    message: `✓ Completed: ${activity.name} (+${activity.prepXpReward} Prep XP)`,
    xpResult
  };
}

/**
 * Get recommended prep activities for a specific battle difficulty
 */
export function getRecommendedActivitiesForDifficulty(
  difficulty: 'gentle' | 'moderate' | 'challenging' | 'legendary',
  battleType: 'boss' | 'castle_sweep' | 'trial' = 'boss'
): string[] {
  const baseActivities = ['rest', 'meal', 'equipment_check', 'supplies_pack', 'route_plan'];

  const byDifficulty: Record<string, string[]> = {
    gentle: baseActivities,
    moderate: [...baseActivities, 'meditation', 'creat_care'],
    challenging: [...baseActivities, 'meditation', 'creat_care', 'study_boss', 'element_attune'],
    legendary: [
      ...baseActivities,
      'meditation',
      'creat_care',
      'study_boss',
      'element_attune',
      'companion_training',
      'legacy_ritual'
    ]
  };

  let activities = byDifficulty[difficulty] || baseActivities;

  if (battleType === 'boss') {
    activities = [...activities, ...Object.keys(BOSS_PREP_ACTIVITIES)];
  } else if (battleType === 'castle_sweep') {
    activities = [...activities, ...Object.keys(CASTLE_SWEEP_PREP_ACTIVITIES)];
  }

  return [...new Set(activities)]; // Remove duplicates
}

/**
 * Calculate readiness bonus to apply in battle
 */
export function calculateReadinessBonus(readinessScore: number): {
  damageMultiplier: number;
  defenseBonus: number;
  speedBonus: number;
  accuracyBonus: number;
} {
  // Every 20% readiness = +5% damage, +3% defense, +2% speed, +1% accuracy
  const scorePercentage = readinessScore / 100;

  return {
    damageMultiplier: 1 + scorePercentage * 0.25, // Max +25% damage at 100%
    defenseBonus: scorePercentage * 0.15, // Max +15% defense
    speedBonus: scorePercentage * 0.1, // Max +10% speed
    accuracyBonus: scorePercentage * 0.05 // Max +5% accuracy
  };
}

/**
 * Get readiness report for display
 */
export function getReadinessReport(state: PreBattleReadinessState): string {
  const bonus = calculateReadinessBonus(state.readinessScore);
  return `Readiness: ${state.readinessScore}% | +${(bonus.damageMultiplier - 1) * 100}% DMG | +${bonus.defenseBonus * 100}% DEF | Prep XP: +${state.totalPrepXpEarned}`;
}

/**
 * Save readiness state to registry
 */
export function saveReadinessState(registry: RegistryLike, state: PreBattleReadinessState): void {
  registry.set(`readiness_${state.battleId}`, state);
}

/**
 * Load readiness state from registry
 */
export function loadReadinessState(
  registry: RegistryLike,
  battleId: string
): PreBattleReadinessState | null {
  const state = registry.get(`readiness_${battleId}`);
  return (state as PreBattleReadinessState) || null;
}
