/**
 * COMPLETE PREP SYSTEM CHECKLIST
 * 
 * Comprehensive guide for hero and creat preparation before all activities.
 * Ordered from CRITICAL NEEDS → CASUAL PREP with exact XP/gold/HP rewards.
 * 
 * Last Updated: May 13, 2026
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRITICAL HERO NEEDS CHECKLIST
 * (Must complete for any quest/boss)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * These are SURVIVAL checks. Failing any means death or severe penalties.
 */

export const CRITICAL_HERO_NEEDS = [
  {
    priority: 'CRITICAL',
    need: 'Hero HP > 50%',
    reason: 'Below 50% = high death risk in combat',
    currentCheck: 'registry.get("heroHp") >= (registry.get("heroMaxHp") * 0.5)',
    action: 'Use Healing Potion or Rest',
    restoreAction: {
      method: 'Healing Potion',
      amount: '+50 HP',
      goldCost: 0,
      duration: '30s',
      reward: { xp: 0, gold: 0, hp: 50 }
    },
    restoreAction2: {
      method: 'Full Rest at Inn',
      amount: '+100 HP (full)',
      goldCost: 25,
      duration: '8 in-game hours',
      reward: { xp: 0, gold: 0, hp: 100, energy: 100 }
    },
    failPenalty: '-50% damage in battle, 60% death risk',
    checkboxReward: { prepXp: 6, gold: 0, achievement: 'Vitality Check' }
  },

  {
    priority: 'CRITICAL',
    need: 'Hero Energy > 60%',
    reason: 'Low energy = reduced action speed, dodge chance, combo damage',
    currentCheck: 'registry.get("heroEnergy") >= (registry.get("heroMaxEnergy") * 0.6)',
    action: 'Eat or Rest',
    restoreAction: {
      method: 'Eat Food (bread/meat/stew)',
      amount: '+30 to +50 Energy',
      foodReq: 'Must have food in inventory',
      duration: '2 minutes',
      reward: { xp: 0, gold: 0, energy: '30-50' }
    },
    restoreAction2: {
      method: 'Rest at Sanctuary (2 hours)',
      amount: '+100 Energy (full)',
      goldCost: 0,
      duration: '2 in-game hours',
      reward: { xp: 5, gold: 0, energy: 100 }
    },
    failPenalty: 'Action speed -30%, dodge chance -20%, fatigue damage accumulation',
    checkboxReward: { prepXp: 5, gold: 0, achievement: 'Endurance Check' }
  },

  {
    priority: 'CRITICAL',
    need: 'Hero Hunger < 30%',
    reason: 'Hunger > 30% = passive HP loss (0.5 HP/min), weakness in combat',
    currentCheck: 'registry.get("heroHunger") < 30',
    action: 'Eat Food',
    restoreAction: {
      method: 'Eat Bread',
      amount: '+20 hunger satiation',
      foodReq: 'Requires 1x Bread in inventory',
      duration: '1 minute',
      reward: { xp: 0, gold: 0, hunger: '-20' }
    },
    restoreAction2: {
      method: 'Eat Cooked Meat',
      amount: '+40 hunger satiation',
      foodReq: 'Requires 1x Cooked Meat in inventory',
      duration: '2 minutes',
      reward: { xp: 0, gold: 0, hunger: '-40' }
    },
    restoreAction3: {
      method: 'Eat Hearty Stew',
      amount: '+50 hunger, +20 HP',
      foodReq: 'Requires 1x Stew in inventory',
      duration: '3 minutes',
      reward: { xp: 0, gold: 0, hunger: '-50', hp: 20 }
    },
    failPenalty: 'Hunger > 30% = -0.5 HP/min ongoing damage, -15% all stats',
    checkboxReward: { prepXp: 4, gold: 0, achievement: 'Nourishment Check' }
  }
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRITICAL CREAT NEEDS CHECKLIST
 * (Must complete for creat-based combat)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Creat survival and effectiveness in battles.
 */

export const CRITICAL_CREAT_NEEDS = [
  {
    priority: 'CRITICAL',
    need: 'Creat HP > 40%',
    reason: 'Below 40% = creat panic, flee attempts, combat ineffectiveness',
    currentCheck: 'registry.get("creatHp") >= (registry.get("creatMaxHp") * 0.4)',
    action: 'Feed Creat Food or Use Creat Potion',
    restoreAction: {
      method: 'Feed Creat Food',
      amount: '+25 Creat HP, +8 bond',
      foodReq: 'Requires 1x Creat Food in inventory',
      duration: '3 minutes',
      reward: { xp: 0, gold: 0, creatHp: 25, creatBond: 8 }
    },
    restoreAction2: {
      method: 'Creat Healing Potion',
      amount: '+50 Creat HP',
      goldCost: 0,
      duration: '30s',
      reward: { xp: 0, gold: 0, creatHp: 50 }
    },
    restoreAction3: {
      method: 'Full Heal at Creat Care Grove',
      amount: '+100 Creat HP (full), +10 bond',
      goldCost: 50,
      duration: '1 hour',
      reward: { xp: 10, gold: 0, creatHp: 100, creatBond: 10 }
    },
    failPenalty: 'Creat panic/flee (60% chance), -50% combat effectiveness, broken combos',
    checkboxReward: { prepXp: 7, gold: 0, achievement: 'Companion Vitality Check' }
  },

  {
    priority: 'CRITICAL',
    need: 'Creat Bond > 40%',
    reason: 'Bond < 40% = reduced stats, hesitation in battle, unreliable combos',
    currentCheck: 'registry.get("creatBond") > 40',
    action: 'Bond Activities: Feed, Pet, Play, Train',
    restoreAction: {
      method: 'Feed + Pet Creat',
      amount: '+8 bond',
      duration: '5 minutes',
      reward: { xp: 0, gold: 0, bond: 8 }
    },
    restoreAction2: {
      method: 'Play with Creat',
      amount: '+10 bond, +20 creat happiness',
      duration: '10 minutes',
      reward: { xp: 5, gold: 0, bond: 10 }
    },
    restoreAction3: {
      method: 'Combat Training with Creat',
      amount: '+12 bond, unlock combo finishers',
      duration: '20 minutes',
      reward: { xp: 8, gold: 0, bond: 12, prepXp: 9 }
    },
    restoreAction4: {
      method: 'Ride Creat Around Town',
      amount: '+5 bond, hero energizes',
      duration: '15 minutes',
      reward: { xp: 0, gold: 0, bond: 5, heroEnergy: 20 }
    },
    failPenalty: 'Bond 0-20: -20% stats, 60% flee; Bond 21-40: -10% stats, 25% hesitate',
    checkboxReward: { prepXp: 8, gold: 0, achievement: 'Companionship Verified' }
  },

  {
    priority: 'CRITICAL',
    need: 'Creat Hunger < 20%',
    reason: 'Creat hunger > 20% = -0.3 HP/min loss, -1 happiness/min, wilting',
    currentCheck: 'registry.get("creatHunger") < 20',
    action: 'Feed Creat',
    restoreAction: {
      method: 'Feed Creat Food (1x)',
      amount: 'Fills hunger, +8 bond',
      duration: '3 minutes',
      reward: { xp: 0, gold: 0, creatHunger: '-30', creatBond: 8 }
    },
    restoreAction2: {
      method: 'Feed Creat Premium Food (1x)',
      amount: 'Fills hunger, +15 bond, +5 happiness',
      goldCost: 30,
      duration: '3 minutes',
      reward: { xp: 0, gold: 0, creatHunger: '-50', creatBond: 15, creatHappiness: 5 }
    },
    failPenalty: 'Hunger > 20% = -0.3 HP/min loss, -1 happiness/min, low morale',
    checkboxReward: { prepXp: 5, gold: 0, achievement: 'Companion Nourishment Check' }
  }
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STANDARD PREP CHECKLIST
 * (Recommended before quests/boss battles)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Not critical, but significantly improves odds of success.
 */

export const STANDARD_PREP_NEEDS = [
  {
    priority: 'HIGH',
    need: 'Equipment Inspected & Repaired',
    reason: 'Worn/broken gear fails in critical moments, -20% damage/defense',
    currentCheck: 'registry.get("equipmentDamage") < 25',
    action: 'Visit Isle Iron Smitty, speak to blacksmith',
    prepActivity: {
      id: 'equipment_check',
      name: 'Inspect Equipment',
      prepXp: 6,
      duration: '10 minutes',
      location: 'Isle Iron Smitty'
    },
    bonusAction: {
      id: 'equipment_repair',
      name: 'Repair Equipment (if damaged)',
      prepXp: 6,
      duration: '30 minutes',
      goldCost: 0,
      reward: { prepXp: 6, gold: 0 }
    },
    failPenalty: 'Weapon/armor breaks mid-battle (25% chance per combat turn)',
    checkboxReward: { prepXp: 6, gold: 0, achievement: 'Gear Ready' }
  },

  {
    priority: 'HIGH',
    need: 'Battle Supplies Packed',
    reason: 'Potions/antidotes/aids give in-battle options, +25% survival odds',
    currentCheck: 'registry.get("potionCount") >= 2 && registry.get("aidCount") >= 1',
    action: 'Gather or Craft Potions, Pack into Travel Kit',
    prepActivity: {
      id: 'supplies_pack',
      name: 'Pack Battle Supplies',
      prepXp: 5,
      duration: '15 minutes',
      location: 'Ye Wandering Hearth'
    },
    craftingOption: {
      id: 'craft_potions',
      name: 'Brew Healing Potions',
      prepXp: 8,
      duration: '7 minutes',
      itemsNeeded: '2x herb_bundle, 1x spring_water',
      result: '3x Healing Potion',
      location: 'Herb & Brew Isle',
      reward: { prepXp: 8, gold: 90 }
    },
    failPenalty: 'No potions = can\'t recover mid-battle, forced retreat or death',
    checkboxReward: { prepXp: 5, gold: 0, achievement: 'Battle Supplies Ready' }
  },

  {
    priority: 'HIGH',
    need: 'Study Enemy / Battle Map',
    reason: 'Knowing what you\'re facing = +15% damage vs prepared enemies',
    currentCheck: 'registry.get("studiedBossLore") == true || registry.get("knownArena") == true',
    action: 'Talk to NPC veterans, read about the location',
    prepActivity: {
      id: 'study_boss',
      name: 'Research Boss Lore (Boss fights)',
      prepXp: 8,
      duration: '20 minutes',
      location: 'Ye Wandering Hearth or Library'
    },
    prepActivity2: {
      id: 'route_plan',
      name: 'Study Battle Map',
      prepXp: 6,
      duration: '10 minutes',
      location: 'Any Quest Hub',
      reward: { prepXp: 6, gold: 0 }
    },
    failPenalty: 'Unknown terrain/boss = -20% accuracy, missed opportunity attacks',
    checkboxReward: { prepXp: 6, gold: 0, achievement: 'Informed Fighter' }
  },

  {
    priority: 'MEDIUM',
    need: 'Rest (6+ hours before major quest)',
    reason: 'Fresh hero = +10% all stats, clearer decision-making',
    currentCheck: 'registry.get("heroRested") == true && timeSinceRest < 30min',
    action: 'Sleep at Inn or Home for 6+ in-game hours',
    restAction: {
      method: 'Sleep at Sleep Inne Sanctuary',
      amount: '+100 energy, +30 HP, +mental clarity',
      goldCost: 25,
      duration: '8 in-game hours',
      reward: { prepXp: 5, gold: 0, energy: 100, hp: 30 }
    },
    restAction2: {
      method: 'Quick Nap at Home (4 hours)',
      amount: '+60 energy, +20 HP',
      goldCost: 0,
      duration: '4 in-game hours',
      reward: { prepXp: 3, gold: 0, energy: 60, hp: 20 }
    },
    failPenalty: 'Fatigue (-15% reaction speed, -20% dodge, mistakes increase)',
    checkboxReward: { prepXp: 5, gold: 0, achievement: 'Well Rested' }
  },

  {
    priority: 'MEDIUM',
    need: 'Inventory Organized',
    reason: 'Quick item access mid-battle, +5 seconds on potion use',
    currentCheck: 'registry.get("inventoryOrganized") == true',
    action: 'Open inventory, arrange items in hotbar order',
    prepActivity: {
      id: 'inventory_organize',
      name: 'Organize Inventory',
      prepXp: 3,
      duration: '5 minutes',
      location: 'Sleep Inne',
      reward: { prepXp: 3, gold: 0 }
    },
    failPenalty: 'Slow potion access, fumbling costs turns mid-combat',
    checkboxReward: { prepXp: 3, gold: 0, achievement: 'Organized Fighter' }
  }
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIFFICULTY-BASED CHECKLIST SCALING
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CHECKLIST_BY_DIFFICULTY = {
  gentle: {
    name: 'Gentle (Training Quest)',
    requiredChecks: [
      'Hero HP > 50%',
      'Hero Energy > 60%',
      'Hero Hunger < 30%'
    ],
    recommendedChecks: [
      'Creat Bond > 40%',
      'Equipment Inspected',
      'Battle Supplies Packed (1x Potion)'
    ],
    minPrepXp: 0,
    expectedPrepXp: 15,
    baseGoldReward: 50,
    baseXpReward: 100,
    estimatedDuration: '15 minutes'
  },

  moderate: {
    name: 'Moderate (Standard Quest/Boss)',
    requiredChecks: [
      'Hero HP > 50%',
      'Hero Energy > 60%',
      'Hero Hunger < 30%',
      'Creat HP > 40%',
      'Creat Bond > 40%',
      'Creat Hunger < 20%'
    ],
    recommendedChecks: [
      'Equipment Inspected & Repaired',
      'Battle Supplies Packed (2+ Potions)',
      'Study Enemy (Boss) or Map',
      'Rest (6 hours)',
      'Inventory Organized'
    ],
    minPrepXp: 30,
    expectedPrepXp: 50,
    baseGoldReward: 150,
    baseXpReward: 300,
    estimatedDuration: '45 minutes'
  },

  challenging: {
    name: 'Challenging (Raid Boss/Hard Quest)',
    requiredChecks: [
      'Hero HP > 70%',
      'Hero Energy > 70%',
      'Hero Hunger < 15%',
      'Creat HP > 60%',
      'Creat Bond > 60%',
      'Creat Hunger < 10%',
      'Equipment Repaired',
      'Battle Supplies Packed (3+ Potions, antidotes)'
    ],
    recommendedChecks: [
      'Study Enemy Lore',
      'Combat Training with Creat',
      'Elemental Attunement',
      'Full Rest (8 hours)',
      'Craft Advanced Gear',
      'Mental Preparation (Meditation)'
    ],
    minPrepXp: 60,
    expectedPrepXp: 100,
    baseGoldReward: 400,
    baseXpReward: 800,
    estimatedDuration: '2-3 hours',
    bonusReward: '+Crown Fragment (if boss defeated)'
  },

  legendary: {
    name: 'Legendary (Ultimate Boss/Raid)',
    requiredChecks: [
      'Hero HP = 100%',
      'Hero Energy = 100%',
      'Hero Hunger < 5%',
      'Creat HP > 80%',
      'Creat Bond > 80%',
      'Creat Hunger = 0%',
      'Mythic Equipment',
      'Full Arsenal (5+ Potions, antidotes, revives)',
      'Boss Strategy Known',
      'Legacy Skills Unlocked'
    ],
    recommendedChecks: [
      'Master Level Combat Training',
      'Fusion Attunement',
      'Legendary Weapon Blessing',
      'Divine Ritual Performed',
      'Sacrifice Made at Shrine',
      'Team Coordination (multiplayer)'
    ],
    minPrepXp: 150,
    expectedPrepXp: 200+,
    baseGoldReward: 1000,
    baseXpReward: 2500,
    estimatedDuration: '4-6 hours',
    bonusReward: '+2 Crown Fragments, Legendary Equipment, Title',
    failureConsquence: 'Likely death/restart from checkpoint'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CASUAL / OPTIONAL PREP
 * (Nice-to-have, not required, but provide flavor/roleplaying bonuses)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CASUAL_PREP_OPTIONS = [
  {
    priority: 'CASUAL',
    activity: 'Visit Tavern for Rumors',
    description: 'Chat with travelers, get quest tips, hear stories',
    prepXp: 2,
    duration: '10 minutes',
    location: 'Ye Wandering Hearth',
    reward: { prepXp: 2, gold: 0, rumors: '+3', morale: '+5' },
    achievement: 'Informed Wanderer'
  },

  {
    priority: 'CASUAL',
    activity: 'Get Blessing at Shrine',
    description: 'Priest blesses you for +3% luck in the upcoming quest',
    prepXp: 5,
    duration: '5 minutes',
    location: 'Hallow Bend',
    reward: { prepXp: 5, gold: 0, luck: '+3%' },
    achievement: 'Divinely Favored'
  },

  {
    priority: 'CASUAL',
    activity: 'Tell Creat a Story',
    description: 'Build emotional connection, calm nerves before battle',
    prepXp: 6,
    duration: '15 minutes',
    location: 'Any quiet spot',
    requirement: 'Creat present',
    reward: { prepXp: 6, gold: 0, creatBond: 6, morale: '+10' },
    achievement: 'Tale Spinner'
  },

  {
    priority: 'CASUAL',
    activity: 'Practice Archery',
    description: 'Loosen up, improve aim, build confidence',
    prepXp: 6,
    duration: '20 minutes',
    location: 'Ring Path',
    reward: { prepXp: 6, gold: 0, accuracy: '+5%', morale: '+8' },
    achievement: 'Sharpshooter'
  },

  {
    priority: 'CASUAL',
    activity: 'Meditate at Overlook',
    description: 'Center yourself, calm mind, find inner peace',
    prepXp: 5,
    duration: '15 minutes',
    location: 'Northwatch Cliffs',
    reward: { prepXp: 5, gold: 0, focusBonus: '+10%', stress: '-20' },
    achievement: 'Zen Master'
  },

  {
    priority: 'CASUAL',
    activity: 'Fish for Relaxation',
    description: 'Enjoy peaceful activity, collect fresh fish, calm nerves',
    prepXp: 4,
    duration: '30 minutes',
    location: "Fisher's Walk",
    reward: { prepXp: 4, gold: 0, fishObtained: '2-4', relaxation: '+15' },
    achievement: 'Peaceful Angler'
  },

  {
    priority: 'CASUAL',
    activity: 'Explore Hidden Areas',
    description: 'Find secrets, shortcuts, easter eggs, build world knowledge',
    prepXp: 8,
    duration: '20 minutes',
    location: 'Various',
    reward: { prepXp: 8, gold: '20-50', items: 'varies', knowledge: '+1' },
    achievement: 'Explorer'
  },

  {
    priority: 'CASUAL',
    activity: 'Compose Victory Song',
    description: 'Build confidence by imagining success',
    prepXp: 3,
    duration: '5 minutes',
    location: 'Any',
    reward: { prepXp: 3, gold: 0, confidence: '+15%', morale: '+10' },
    achievement: 'Bard'
  }
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHECKPOINT & STOP POINTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * When to save and where to rest during long campaigns.
 */

export const CHECKPOINT_STRATEGY = {
  'before_major_boss': {
    name: 'Pre-Boss Checkpoint',
    location: 'Sanctuary Home Base or Shrine before dungeon entrance',
    saveWhat: 'Full hero/creat state, inventory, all progress',
    registerKey: 'checkpointBeforeBoss',
    when: 'After all prep activities complete, before entering boss arena',
    canRevert: true,
    limitation: 'Only 1 checkpoint per boss (load replaces previous)'
  },

  'mid_dungeon_checkpoint': {
    name: 'Mid-Dungeon Save Point',
    location: 'Safe rooms in dungeons, checkered tile rooms',
    saveWhat: 'Position, HP, inventory, enemies cleared so far',
    registerKey: 'dungeonCheckpoint_[dungeonId]',
    when: 'After clearing each room, before entering next',
    canRevert: true,
    limitation: 'Max 5 checkpoints per dungeon run, 30-second cooldown between saves',
    autoDelete: 'Oldest checkpoint removed when max reached'
  },

  'quest_stop_point': {
    name: 'Quest Stop Point',
    location: 'Quest Hub, home base, tavern',
    saveWhat: 'Quest progress, objectives completed',
    registerKey: 'questCheckpoint_[questId]',
    when: 'After completing quest objectives, can resume later',
    canRevert: true,
    limitation: 'Can pause for up to 7 in-game days before reset'
  },

  'overnight_rest': {
    name: 'Overnight Rest Point',
    location: 'Sleep Inne Sanctuary or Home',
    saveWhat: 'All progress, full heal to 100%',
    registerKey: 'overnightRest_[date]',
    when: 'End of day, before major quest/boss day',
    canRevert: false,
    limitation: 'Time advances 8 hours, NPCs daily routines reset',
    reward: { prepXp: 5, hp: 100, energy: 100, bond: 5 }
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLETE ORDERED PREP CHECKLIST FOR DIFFERENT SCENARIOS
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const COMPLETE_CHECKLIST_SCENARIOS = {
  'side_quest_moderate': {
    scenario: 'Moderate Side Quest (Kill 5 enemies, collect 100 mushrooms)',
    recommendedDifficulty: 'moderate',
    estimatedDuration: '45 minutes (including 30 min quest)',
    prepTime: '15 minutes',
    checklist: [
      { order: 1, check: 'Hero Hunger < 30%', prepXp: 4, action: 'Eat food' },
      { order: 2, check: 'Hero Energy > 60%', prepXp: 5, action: 'Rest 2 hrs' },
      { order: 3, check: 'Hero HP > 50%', prepXp: 6, action: 'Use potion' },
      { order: 4, check: 'Creat Bond > 40%', prepXp: 8, action: 'Play/train' },
      { order: 5, check: 'Creat Hunger < 20%', prepXp: 5, action: 'Feed creat' },
      { order: 6, check: 'Battle Supplies Packed', prepXp: 5, action: '2x potions' },
      { order: 7, check: 'Equipment Inspected', prepXp: 6, action: 'Quick check' },
      { order: 8, check: 'Organize Inventory', prepXp: 3, action: '5 minutes' }
    ],
    totalPrepXp: 42,
    goldReward: 150,
    xpReward: 300,
    itemReward: 'Varies by quest'
  },

  'boss_trial_challenging': {
    scenario: 'Crown Trial II: Solflare Aevan (Challenging Boss)',
    recommendedDifficulty: 'challenging',
    estimatedDuration: '2 hours (including 20 min boss fight)',
    prepTime: '90 minutes',
    checklist: [
      { order: 1, check: 'Hero HP > 70%', prepXp: 8, action: 'Full heal potion + 1hr rest' },
      { order: 2, check: 'Hero Energy > 70%', prepXp: 7, action: 'Rest + eat' },
      { order: 3, check: 'Hero Hunger < 15%', prepXp: 6, action: 'Hearty meal' },
      { order: 4, check: 'Creat HP > 60%', prepXp: 10, action: 'Heal + premium food' },
      { order: 5, check: 'Creat Bond > 60%', prepXp: 12, action: 'Combat training 20min' },
      { order: 6, check: 'Creat Hunger < 10%', prepXp: 8, action: 'Premium food' },
      { order: 7, check: 'Research Boss Lore', prepXp: 8, action: '15 min study' },
      { order: 8, check: 'Elemental Attunement', prepXp: 8, action: '15 min practice' },
      { order: 9, check: 'Equipment Fully Repaired', prepXp: 8, action: '30 min blacksmith' },
      { order: 10, check: 'Battle Arsenal Packed', prepXp: 8, action: '3x potion, antidote' },
      { order: 11, check: 'Full Rest', prepXp: 6, action: '8 hr sleep' },
      { order: 12, check: 'Meditation', prepXp: 5, action: '10 min center' }
    ],
    totalPrepXp: 94,
    goldReward: 400,
    xpReward: 800,
    itemReward: '+1 Crown Fragment'
  },

  'castle_sweep_hard': {
    scenario: 'Castle Sweep Challenge: 3 Floors, Final Boss',
    recommendedDifficulty: 'challenging',
    estimatedDuration: '3 hours (including 1.5 hr castle)'
    prepTime: '90 minutes',
    checklist: [
      { order: 1, check: 'Hero HP = 100%', prepXp: 10, action: 'Full rest + potions' },
      { order: 2, check: 'Hero Energy = 100%', prepXp: 8, action: 'Full rest' },
      { order: 3, check: 'Hero Hunger = 0%', prepXp: 6, action: 'Hearty meal' },
      { order: 4, check: 'Creat HP > 70%', prepXp: 12, action: 'Full heal' },
      { order: 5, check: 'Creat Bond > 70%', prepXp: 15, action: 'Extended training' },
      { order: 6, check: 'Scout Castle Layout', prepXp: 7, action: '15 min study' },
      { order: 7, check: 'Trap Training Refresher', prepXp: 8, action: '20 min practice' },
      { order: 8, check: 'Plan Escape Route', prepXp: 6, action: '10 min mapping' },
      { order: 9, check: 'Supply Cache Prepared', prepXp: 6, action: '5x potions, torches' },
      { order: 10, check: 'Light Sources Packed', prepXp: 5, action: 'Torches/lanterns' },
      { order: 11, check: 'Advanced Gear Equipped', prepXp: 10, action: 'Forge/craft' },
      { order: 12, check: 'Divine Blessing', prepXp: 5, action: 'Shrine prayer' }
    ],
    totalPrepXp: 98,
    goldReward: 500,
    xpReward: 1200,
    itemReward: 'Rare chest + 200 gold',
    checkpointFeature: 'Enabled - save at safe rooms'
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REWARDS SUMMARY TABLE
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const REWARD_TABLE = {
  'by_checklist_item': [
    { item: 'Hero Vitality Check', prepXp: 6, gold: 0, others: 'Achievement unlock' },
    { item: 'Hero Endurance Check', prepXp: 5, gold: 0, others: 'Fatigue resistance' },
    { item: 'Hero Nourishment Check', prepXp: 4, gold: 0, others: 'Hunger immunity 15min' },
    { item: 'Companion Vitality Check', prepXp: 7, gold: 0, others: 'Creat panic immunity' },
    { item: 'Companion Nourishment Check', prepXp: 5, gold: 0, others: 'Creat HP regen' },
    { item: 'Companionship Verified', prepXp: 8, gold: 0, others: '+10% combo damage' },
    { item: 'Gear Ready', prepXp: 6, gold: 0, others: '+10% durability' },
    { item: 'Battle Supplies Ready', prepXp: 5, gold: 0, others: '+10% potion effectiveness' },
    { item: 'Informed Fighter', prepXp: 6, gold: 0, others: '+15% accuracy' },
    { item: 'Well Rested', prepXp: 5, gold: 0, others: '+10% all stats for 1 hour' },
    { item: 'Organized Fighter', prepXp: 3, gold: 0, others: '-5 seconds potion use' }
  ],

  'completion_bonuses': [
    { completion: 'All Critical Needs Met', prepXp: 20, gold: 50, title: 'Prepared Hero' },
    { completion: 'All Standard Prep Done', prepXp: 30, gold: 100, title: 'Veteran Fighter' },
    { completion: 'Max Prep (All Casual)', prepXp: 50, gold: 200, title: 'Master Preparer' }
  ],

  'after_quest_completion': [
    { difficulty: 'Gentle', basePrepXp: 15, gold: 50, baseXp: 100 },
    { difficulty: 'Moderate', basePrepXp: 50, gold: 150, baseXp: 300 },
    { difficulty: 'Challenging', basePrepXp: 100, gold: 400, baseXp: 800 },
    { difficulty: 'Legendary', basePrepXp: 200, gold: 1000, baseXp: 2500, items: 'Rare/Mythic' }
  ]
};

/**
 * NOTES:
 * - Prep XP accumulates toward Prep Levels (separate from combat XP)
 * - Each prep level requires: 20 + (level - 1) * 10 XP
 * - Level 1 → 2: 20 XP
 * - Level 2 → 3: 30 XP
 * - Level 3 → 4: 40 XP, etc.
 * - Higher prep levels unlock advanced prep activities and better bonuses
 * - Checkpoints auto-save after each completed checklist item
 * - Failed checklist items trigger "Use your discernment" warning message
 * - Casual activities add cosmetic/morale benefits, not survival
 */
