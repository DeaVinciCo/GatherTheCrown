/**
 * QUEST PREP ACTIVITIES
 * 
 * Side activities that heroes can complete before quests to earn prep XP.
 * Activities include gathering supplies, crafting, training, bonding, 
 * and other preparation that enhances readiness.
 * 
 * Used by: Quest systems, home base activities, side quests
 */

import { gainPrepXp, type RegistryLike, type PrepGainResult } from './PrepProgression';

export interface PrepActivity {
  id: string;
  name: string;
  description: string;
  category: 'gathering' | 'crafting' | 'training' | 'bonding' | 'maintenance' | 'exploration';
  prepXpReward: number;
  duration: number; // In seconds (game time or real time)
  location: string;
  requirements?: {
    itemsNeeded?: Array<{ id: string; quantity: number }>;
    skillLevel?: number;
    creatPresent?: boolean;
  };
  rewards?: {
    items?: Array<{ id: string; quantity: number }>;
    gold?: number;
    creatBondIncrease?: number;
    questProgress?: number;
  };
  difficulty: 'easy' | 'moderate' | 'challenging';
}

export interface PrepActivityProgress {
  activityId: string;
  started: number; // Timestamp
  completed: boolean;
  completedAt?: number;
  prepXpGained?: number;
  questId?: string; // If linked to specific quest
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * GATHERING ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const GATHERING_ACTIVITIES: Record<string, PrepActivity> = {
  forage_herbs: {
    id: 'forage_herbs',
    name: 'Forage Forest Herbs',
    description: 'Gather medicinal plants and herbs for potions.',
    category: 'gathering',
    prepXpReward: 5,
    duration: 300,
    location: 'Greenwood Trail',
    rewards: {
      items: [{ id: 'herb_bundle', quantity: 3 }],
      gold: 50
    },
    difficulty: 'easy'
  },
  fish_stock: {
    id: 'fish_stock',
    name: 'Stock Fish from Pier',
    description: 'Fish at the dock for fresh supplies.',
    category: 'gathering',
    prepXpReward: 4,
    duration: 240,
    location: "Fisher's Walk",
    rewards: {
      items: [{ id: 'fresh_fish', quantity: 4 }],
      gold: 40
    },
    difficulty: 'easy'
  },
  ore_prospect: {
    id: 'ore_prospect',
    name: 'Prospect for Ore Deposits',
    description: 'Search for raw ore suitable for blacksmithing.',
    category: 'gathering',
    prepXpReward: 7,
    duration: 360,
    location: 'Northern Cliffs',
    requirements: {
      skillLevel: 3
    },
    rewards: {
      items: [{ id: 'raw_ore', quantity: 2 }],
      gold: 80
    },
    difficulty: 'moderate'
  },
  potion_ingredients: {
    id: 'potion_ingredients',
    name: 'Gather Potion Catalyst',
    description: 'Collect rare flowers and mineral waters.',
    category: 'gathering',
    prepXpReward: 6,
    duration: 300,
    location: 'Herb & Brew Isle',
    rewards: {
      items: [{ id: 'catalyst', quantity: 1 }, { id: 'spring_water', quantity: 2 }],
      gold: 60
    },
    difficulty: 'moderate'
  },
  berry_picking: {
    id: 'berry_picking',
    name: 'Pick Berries for Energy',
    description: 'Gather energy berries from wild patches.',
    category: 'gathering',
    prepXpReward: 3,
    duration: 180,
    location: 'Greenwood Clearing',
    rewards: {
      items: [{ id: 'energy_berry', quantity: 6 }],
      gold: 30
    },
    difficulty: 'easy'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * CRAFTING ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const CRAFTING_ACTIVITIES: Record<string, PrepActivity> = {
  craft_potions: {
    id: 'craft_potions',
    name: 'Brew Healing Potions',
    description: 'Mix ingredients into restorative draughts.',
    category: 'crafting',
    prepXpReward: 8,
    duration: 420,
    location: 'Herb & Brew Isle',
    requirements: {
      itemsNeeded: [{ id: 'herb_bundle', quantity: 2 }, { id: 'spring_water', quantity: 1 }],
      skillLevel: 2
    },
    rewards: {
      items: [{ id: 'healing_potion', quantity: 3 }],
      gold: 90
    },
    difficulty: 'moderate'
  },
  craft_bandages: {
    id: 'craft_bandages',
    name: 'Roll Wound Bandages',
    description: 'Prepare clean bandages and medical wraps.',
    category: 'crafting',
    prepXpReward: 4,
    duration: 180,
    location: 'Sleep Inne',
    requirements: {
      itemsNeeded: [{ id: 'cloth', quantity: 3 }]
    },
    rewards: {
      items: [{ id: 'bandage_pack', quantity: 2 }],
      gold: 50
    },
    difficulty: 'easy'
  },
  forge_gear: {
    id: 'forge_gear',
    name: 'Forge Battle Gear',
    description: 'Craft or repair weapons and armor.',
    category: 'crafting',
    prepXpReward: 10,
    duration: 600,
    location: 'Isle Iron Smitty',
    requirements: {
      itemsNeeded: [{ id: 'raw_ore', quantity: 1 }, { id: 'coal', quantity: 2 }],
      skillLevel: 4
    },
    rewards: {
      items: [{ id: 'reinforced_armor', quantity: 1 }],
      gold: 150
    },
    difficulty: 'challenging'
  },
  craft_kit: {
    id: 'craft_kit',
    name: 'Assemble Travel Kit',
    description: 'Pack supplies into organized travel kit.',
    category: 'crafting',
    prepXpReward: 6,
    duration: 240,
    location: 'Ye Wandering Hearth',
    requirements: {
      itemsNeeded: [{ id: 'fresh_fish', quantity: 1 }, { id: 'healing_potion', quantity: 1 }, { id: 'rope', quantity: 1 }]
    },
    rewards: {
      items: [{ id: 'travel_kit', quantity: 1 }],
      gold: 75
    },
    difficulty: 'easy'
  },
  craft_antidotes: {
    id: 'craft_antidotes',
    name: 'Mix Poison Antidotes',
    description: 'Create remedies against toxins and venom.',
    category: 'crafting',
    prepXpReward: 9,
    duration: 480,
    location: 'Herb & Brew Isle',
    requirements: {
      itemsNeeded: [{ id: 'catalyst', quantity: 1 }, { id: 'herb_bundle', quantity: 1 }],
      skillLevel: 3
    },
    rewards: {
      items: [{ id: 'antidote', quantity: 2 }],
      gold: 110
    },
    difficulty: 'moderate'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * TRAINING ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const TRAINING_ACTIVITIES: Record<string, PrepActivity> = {
  combat_drills: {
    id: 'combat_drills',
    name: 'Combat Training Drills',
    description: 'Practice sword forms and combat techniques.',
    category: 'training',
    prepXpReward: 8,
    duration: 360,
    location: 'Ring Path',
    rewards: {
      gold: 40,
      questProgress: 10
    },
    difficulty: 'moderate'
  },
  dodge_training: {
    id: 'dodge_training',
    name: 'Dodge & Evasion Drills',
    description: 'Sharpen reflexes and defensive maneuvers.',
    category: 'training',
    prepXpReward: 7,
    duration: 300,
    location: 'Ring Path',
    rewards: {
      gold: 35,
      questProgress: 8
    },
    difficulty: 'moderate'
  },
  endurance_run: {
    id: 'endurance_run',
    name: 'Endurance Run',
    description: 'Build stamina and cardiovascular fitness.',
    category: 'training',
    prepXpReward: 6,
    duration: 480,
    location: 'Greenwood Trail',
    rewards: {
      gold: 30,
      questProgress: 12
    },
    difficulty: 'moderate'
  },
  element_study: {
    id: 'element_study',
    name: 'Elemental Theory Study',
    description: 'Study opposing elements for battle advantage.',
    category: 'training',
    prepXpReward: 7,
    duration: 300,
    location: 'Ye Wandering Hearth',
    requirements: {
      skillLevel: 2
    },
    rewards: {
      gold: 50,
      questProgress: 10
    },
    difficulty: 'moderate'
  },
  archery_practice: {
    id: 'archery_practice',
    name: 'Archery Target Practice',
    description: 'Improve ranged combat accuracy.',
    category: 'training',
    prepXpReward: 6,
    duration: 360,
    location: 'Ring Path',
    rewards: {
      gold: 40,
      questProgress: 8
    },
    difficulty: 'moderate'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * BONDING ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const BONDING_ACTIVITIES: Record<string, PrepActivity> = {
  creat_feeding: {
    id: 'creat_feeding',
    name: 'Feed Your Creat',
    description: 'Prepare and share a meal with your companion.',
    category: 'bonding',
    prepXpReward: 5,
    duration: 180,
    location: 'Greenwood Clearing',
    requirements: {
      creatPresent: true,
      itemsNeeded: [{ id: 'fresh_fish', quantity: 1 }]
    },
    rewards: {
      creatBondIncrease: 5,
      gold: 0
    },
    difficulty: 'easy'
  },
  creat_training: {
    id: 'creat_training',
    name: 'Train with Your Creat',
    description: 'Practice combo moves and team tactics.',
    category: 'bonding',
    prepXpReward: 9,
    duration: 420,
    location: 'Ring Path',
    requirements: {
      creatPresent: true
    },
    rewards: {
      creatBondIncrease: 8,
      questProgress: 15
    },
    difficulty: 'moderate'
  },
  creat_grooming: {
    id: 'creat_grooming',
    name: 'Groom Your Creat',
    description: 'Clean and care for your companion\'s needs.',
    category: 'bonding',
    prepXpReward: 4,
    duration: 240,
    location: 'Greenwood Clearing',
    requirements: {
      creatPresent: true
    },
    rewards: {
      creatBondIncrease: 3,
      gold: 0
    },
    difficulty: 'easy'
  },
  creat_storytelling: {
    id: 'creat_storytelling',
    name: 'Tell Stories to Creat',
    description: 'Build emotional connection through shared tales.',
    category: 'bonding',
    prepXpReward: 6,
    duration: 300,
    location: 'Ye Wandering Hearth',
    requirements: {
      creatPresent: true
    },
    rewards: {
      creatBondIncrease: 6,
      gold: 0
    },
    difficulty: 'easy'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * MAINTENANCE ACTIVITIES
 * ═══════════════════════════════════════════════════════════════════
 */

export const MAINTENANCE_ACTIVITIES: Record<string, PrepActivity> = {
  equipment_repair: {
    id: 'equipment_repair',
    name: 'Repair Equipment',
    description: 'Maintain weapons and armor in peak condition.',
    category: 'maintenance',
    prepXpReward: 6,
    duration: 300,
    location: 'Isle Iron Smitty',
    requirements: {
      skillLevel: 2
    },
    rewards: {
      gold: 60
    },
    difficulty: 'moderate'
  },
  inventory_organize: {
    id: 'inventory_organize',
    name: 'Organize Inventory',
    description: 'Arrange supplies for quick access in battle.',
    category: 'maintenance',
    prepXpReward: 3,
    duration: 120,
    location: 'Sleep Inne',
    rewards: {
      gold: 0,
      questProgress: 5
    },
    difficulty: 'easy'
  },
  gear_polish: {
    id: 'gear_polish',
    name: 'Polish & Inspect Gear',
    description: 'Ensure all equipment is battle-ready.',
    category: 'maintenance',
    prepXpReward: 4,
    duration: 180,
    location: 'Isle Iron Smitty',
    rewards: {
      gold: 30
    },
    difficulty: 'easy'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * ACTIVITY EXECUTION
 * ═══════════════════════════════════════════════════════════════════
 */

export const ALL_PREP_ACTIVITIES: Record<string, PrepActivity> = {
  ...GATHERING_ACTIVITIES,
  ...CRAFTING_ACTIVITIES,
  ...TRAINING_ACTIVITIES,
  ...BONDING_ACTIVITIES,
  ...MAINTENANCE_ACTIVITIES
};

/**
 * Start a prep activity
 */
export function startPrepActivity(
  registry: RegistryLike,
  activityId: string,
  questId?: string
): { success: boolean; message: string; progress?: PrepActivityProgress } {
  const activity = ALL_PREP_ACTIVITIES[activityId];
  if (!activity) {
    return { success: false, message: `Activity "${activityId}" not found.` };
  }

  const progress: PrepActivityProgress = {
    activityId,
    started: Date.now(),
    completed: false,
    questId
  };

  registry.set(`prepActivity_${activityId}`, progress);
  return {
    success: true,
    message: `Started: ${activity.name}. Duration: ${activity.duration}s. Reward: +${activity.prepXpReward} Prep XP`,
    progress
  };
}

/**
 * Complete a prep activity and grant XP
 */
export function completePrepActivity(
  registry: RegistryLike,
  activityId: string
): { success: boolean; message: string; xpResult?: PrepGainResult } {
  const activity = ALL_PREP_ACTIVITIES[activityId];
  if (!activity) {
    return { success: false, message: `Activity "${activityId}" not found.` };
  }

  const progress = registry.get(`prepActivity_${activityId}`) as PrepActivityProgress | undefined;
  if (!progress || progress.completed) {
    return { success: false, message: `Activity not in progress or already completed.` };
  }

  // Grant prep XP
  const xpResult = gainPrepXp(registry, activity.prepXpReward, `quest_prep:${activityId}`);

  progress.completed = true;
  progress.completedAt = Date.now();
  progress.prepXpGained = activity.prepXpReward;
  registry.set(`prepActivity_${activityId}`, progress);

  return {
    success: true,
    message: `✓ Completed: ${activity.name} (+${activity.prepXpReward} Prep XP${xpResult.leveledUp ? ', LEVEL UP!' : ''})`,
    xpResult
  };
}

/**
 * Get activities by category
 */
export function getActivitiesByCategory(category: string): PrepActivity[] {
  return Object.values(ALL_PREP_ACTIVITIES).filter(a => a.category === category);
}

/**
 * Get available activities (that aren't already in progress)
 */
export function getAvailableActivities(registry: RegistryLike): PrepActivity[] {
  return Object.values(ALL_PREP_ACTIVITIES).filter(activity => {
    const progress = registry.get(`prepActivity_${activity.id}`) as PrepActivityProgress | undefined;
    return !progress || progress.completed;
  });
}

/**
 * Get activities in progress
 */
export function getActivitiesInProgress(registry: RegistryLike): PrepActivity[] {
  return Object.values(ALL_PREP_ACTIVITIES).filter(activity => {
    const progress = registry.get(`prepActivity_${activity.id}`) as PrepActivityProgress | undefined;
    return progress && !progress.completed;
  });
}
