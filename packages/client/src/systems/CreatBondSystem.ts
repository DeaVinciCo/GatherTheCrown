/**
 * CreatBondSystem — Governs the relationship between a hero and their Creat companion.
 *
 * Core design principle:
 *   The LESS compatible the hero and creat are (diverge / mismatched element),
 *   the MORE the hero must actively care for, feed, and tend to the creat
 *   to keep it loyal, powerful, and willing to fight at full capacity.
 *
 *   A perfectly bonded pair barely needs upkeep — the creat wants to be there.
 *   A mismatched pair needs daily investment just to stay functional.
 */

// ─── BOND TIERS ─────────────────────────────────────────────────────────────

export interface BondTier {
  label: string;
  min: number; // inclusive
  max: number; // inclusive
  color: string;
  /** What the creat does in this tier */
  behavior: string;
  /** What combat capabilities are available */
  combat: string[];
  /** Passive stat modifier (0 = none, 0.4 = +40%) */
  statMod: number;
  /** Whether the creat will mount/carry the hero */
  canMount: boolean;
  /** Whether combo finishers are accessible */
  canFinisher: boolean;
  /** Bond decays this many points per real-world hour without care */
  decayPerHour: number;
}

export const BOND_TIERS: BondTier[] = [
  {
    label: 'Estranged',
    min: 0, max: 20,
    color: '#ef4444',
    behavior: 'Wary and distant. May refuse commands, hiss, or flee mid-battle.',
    combat: ['Basic attacks only (50% power)', 'High flee chance in danger (60%)', 'Will not mount hero'],
    statMod: -0.2,
    canMount: false,
    canFinisher: false,
    decayPerHour: 0 // already at floor — just stays here
  },
  {
    label: 'Uneasy',
    min: 21, max: 40,
    color: '#f97316',
    behavior: 'Follows reluctantly. Obeys simple commands but shows stress signals.',
    combat: ['Basic attacks (70% power)', '25% chance to hesitate on command', 'Will mount but may buck'],
    statMod: -0.1,
    canMount: true,
    canFinisher: false,
    decayPerHour: 0
  },
  {
    label: 'Neutral',
    min: 41, max: 60,
    color: '#eab308',
    behavior: 'Cooperative. Fights reliably, no special loyalty demonstrated.',
    combat: ['Full basic attacks', 'Commands obeyed consistently', 'Can mount and ride normally'],
    statMod: 0,
    canMount: true,
    canFinisher: false,
    decayPerHour: 0
  },
  {
    label: 'Companion',
    min: 61, max: 79,
    color: '#22c55e',
    behavior: 'Loyal. Anticipates hero\'s needs, protects without being asked.',
    combat: ['Full attacks + elemental aura', '+20% all stats', 'Unlocks: Protective Instinct (shields hero)'],
    statMod: 0.2,
    canMount: true,
    canFinisher: false,
    decayPerHour: 0
  },
  {
    label: 'Bonded',
    min: 80, max: 89,
    color: '#3b82f6',
    behavior: 'Deep trust. Creat fights at full power, reads hero\'s intent without commands.',
    combat: ['Full attacks + elemental burst', '+35% all stats', 'Unlocks: Combo Finishers (boss phase)'],
    statMod: 0.35,
    canMount: true,
    canFinisher: true,
    decayPerHour: 0
  },
  {
    label: 'Soulmate',
    min: 90, max: 95,
    color: '#a855f7',
    behavior: 'Unbreakable. The creat would rather die than leave its rider\'s side.',
    combat: ['Max power attacks', '+50% all stats', 'Unlocks: Fusion Strike (ultimate)'],
    statMod: 0.5,
    canMount: true,
    canFinisher: true,
    decayPerHour: 0
  },
  {
    label: 'Legendary Bond',
    min: 96, max: 100,
    color: '#fbbf24',
    behavior: 'One mind, one soul. The creat and hero move as a single legendary being.',
    combat: ['Mythic power', '+65% all stats', 'Unlocks: Mythic Transformation (1/day)'],
    statMod: 0.65,
    canMount: true,
    canFinisher: true,
    decayPerHour: 0
  }
];

export function getBondTier(bond: number): BondTier {
  return BOND_TIERS.find(t => bond >= t.min && bond <= t.max) ?? BOND_TIERS[0];
}

// ─── OFFENSE TIERS (WRONGDOING) ─────────────────────────────────────────────

export interface OffenseTier {
  level: number; // 0..6
  minPoints: number; // inclusive
  maxPoints: number; // inclusive
  label: string;
  color: string;
  behavior: string;
  gameplayEffect: string;
}

export const OFFENSE_TIERS: OffenseTier[] = [
  {
    level: 0,
    minPoints: 0,
    maxPoints: 9,
    label: 'Trusting',
    color: '#22c55e',
    behavior: 'Creat feels safe and understood.',
    gameplayEffect: 'No penalties.'
  },
  {
    level: 1,
    minPoints: 10,
    maxPoints: 24,
    label: 'Annoyed',
    color: '#84cc16',
    behavior: 'Creat is irritated but still cooperative.',
    gameplayEffect: 'Minor response delay to commands.'
  },
  {
    level: 2,
    minPoints: 25,
    maxPoints: 39,
    label: 'Distrustful',
    color: '#eab308',
    behavior: 'Creat questions commands and becomes guarded.',
    gameplayEffect: 'Slight combat and travel penalties.'
  },
  {
    level: 3,
    minPoints: 40,
    maxPoints: 59,
    label: 'Defiant',
    color: '#f59e0b',
    behavior: 'Creat obeys inconsistently and may refuse risky actions.',
    gameplayEffect: 'Moderate power loss; slower story progression pace.'
  },
  {
    level: 4,
    minPoints: 60,
    maxPoints: 74,
    label: 'Fractured',
    color: '#f97316',
    behavior: 'Bond is fractured; creat may stay behind during danger.',
    gameplayEffect: 'Race readiness poor; boss support unreliable.'
  },
  {
    level: 5,
    minPoints: 75,
    maxPoints: 89,
    label: 'Hostile',
    color: '#ef4444',
    behavior: 'Creat is angry and on edge. Trust is critically low.',
    gameplayEffect: 'Severe penalties; high runaway chance.'
  },
  {
    level: 6,
    minPoints: 90,
    maxPoints: 100,
    label: 'Severed',
    color: '#7f1d1d',
    behavior: 'Relationship severed. Creat runs off.',
    gameplayEffect: 'Creat unavailable until tracked and trust rebuilt; corruption risk exists.'
  }
];

export function clampOffense(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function getOffenseTier(offensePoints: number): OffenseTier {
  const p = clampOffense(offensePoints);
  return OFFENSE_TIERS.find((t) => p >= t.minPoints && p <= t.maxPoints) ?? OFFENSE_TIERS[0];
}

export interface RelationshipEffects {
  offenseTier: OffenseTier;
  combatPowerMultiplier: number;
  travelSpeedMultiplier: number;
  questEfficiencyMultiplier: number;
  raceAllowed: boolean;
  bossAssistAllowed: boolean;
  commandDisobeyChance: number;
  runawayRisk: number;
}

export function getRelationshipEffects(offensePoints: number, isRunaway = false): RelationshipEffects {
  const tier = getOffenseTier(offensePoints);
  if (isRunaway || tier.level >= 6) {
    return {
      offenseTier: tier,
      combatPowerMultiplier: 0,
      travelSpeedMultiplier: 0.55,
      questEfficiencyMultiplier: 0.65,
      raceAllowed: false,
      bossAssistAllowed: false,
      commandDisobeyChance: 1,
      runawayRisk: 1
    };
  }

  const table: Record<number, Omit<RelationshipEffects, 'offenseTier'>> = {
    0: { combatPowerMultiplier: 1, travelSpeedMultiplier: 1, questEfficiencyMultiplier: 1, raceAllowed: true, bossAssistAllowed: true, commandDisobeyChance: 0, runawayRisk: 0 },
    1: { combatPowerMultiplier: 0.97, travelSpeedMultiplier: 0.98, questEfficiencyMultiplier: 0.98, raceAllowed: true, bossAssistAllowed: true, commandDisobeyChance: 0.05, runawayRisk: 0.01 },
    2: { combatPowerMultiplier: 0.92, travelSpeedMultiplier: 0.95, questEfficiencyMultiplier: 0.93, raceAllowed: true, bossAssistAllowed: true, commandDisobeyChance: 0.1, runawayRisk: 0.03 },
    3: { combatPowerMultiplier: 0.84, travelSpeedMultiplier: 0.9, questEfficiencyMultiplier: 0.88, raceAllowed: true, bossAssistAllowed: true, commandDisobeyChance: 0.18, runawayRisk: 0.08 },
    4: { combatPowerMultiplier: 0.75, travelSpeedMultiplier: 0.8, questEfficiencyMultiplier: 0.8, raceAllowed: false, bossAssistAllowed: true, commandDisobeyChance: 0.28, runawayRisk: 0.18 },
    5: { combatPowerMultiplier: 0.6, travelSpeedMultiplier: 0.72, questEfficiencyMultiplier: 0.72, raceAllowed: false, bossAssistAllowed: false, commandDisobeyChance: 0.4, runawayRisk: 0.32 },
    6: { combatPowerMultiplier: 0, travelSpeedMultiplier: 0.55, questEfficiencyMultiplier: 0.65, raceAllowed: false, bossAssistAllowed: false, commandDisobeyChance: 1, runawayRisk: 1 }
  };

  return { offenseTier: tier, ...table[tier.level] };
}

// ─── COMPATIBILITY ───────────────────────────────────────────────────────────

export type BondCompatibility = 'match' | 'diverge';

export interface CompatibilityProfile {
  /** Starting bond % when hero is created */
  startingBond: number;
  /** Points of bond lost per real-world hour without any care */
  passiveDecayPerHour: number;
  /** How many feedings per day to maintain current bond (0 = free) */
  feedingsRequired: number;
  /** Whether feeding with wrong food type loses bond instead of gaining */
  wrongFoodPenalty: boolean;
  /** Bond gain per correct feeding */
  bondPerFeeding: number;
  /** Bond gain per grooming session */
  bondPerGroom: number;
  /** Bond gain per play/training session */
  bondPerPlay: number;
  /** Label shown in UI */
  label: string;
  /** Flavor text */
  note: string;
}

export const COMPATIBILITY: Record<BondCompatibility, CompatibilityProfile> = {
  match: {
    startingBond: 85,
    passiveDecayPerHour: 0.1, // barely decays — creat naturally wants to be here
    feedingsRequired: 1,       // one meal a day keeps the creat happy
    wrongFoodPenalty: false,   // matched creat is forgiving
    bondPerFeeding: 3,
    bondPerGroom: 2,
    bondPerPlay: 5,
    label: '⭐ Matched Element',
    note: 'Your creat feels at home with you. Minimal upkeep needed — it stays because it wants to.'
  },
  diverge: {
    startingBond: 75,
    passiveDecayPerHour: 0.5, // decays ~12 pts/day if ignored
    feedingsRequired: 3,       // three meals a day to stay stable
    wrongFoodPenalty: true,    // wrong food = -3 bond
    bondPerFeeding: 5,         // rewards are higher if you put in the work
    bondPerGroom: 4,
    bondPerPlay: 8,
    label: '⚡ Divergent Path',
    note: 'Your creat is loyal but uncertain. Feed it properly, groom it daily, and it will grow into something extraordinary.'
  }
};

// ─── FOOD SYSTEM ─────────────────────────────────────────────────────────────

export interface CreatFood {
  id: string;
  name: string;
  emoji: string;
  /** Which creat element this food is preferred by */
  preferredBy: string[];
  /** Bond gain when fed to preferred creat */
  bondGain: number;
  /** Bond change when fed to a creat that doesn't prefer it (can be negative) */
  bondGainOther: number;
  /** How much hunger it restores (0–100) */
  hungerRestore: number;
  /** Flavor description */
  desc: string;
  /** Where to find / buy it */
  source: string;
}

export const CREAT_FOODS: CreatFood[] = [
  // ── FIRE ──────────────────────────────────────────────────────────────────
  {
    id: 'ember-fruit',
    name: 'Ember Fruit',
    emoji: '🍊',
    preferredBy: ['Fire'],
    bondGain: 6,
    bondGainOther: 1,
    hungerRestore: 30,
    desc: 'A hot, glowing citrus that burns pleasantly on the tongue. Fire creats go wild for it.',
    source: 'Found in VolcanoZone, sold at Haven market'
  },
  {
    id: 'char-meat',
    name: 'Charred Ember Meat',
    emoji: '🥩',
    preferredBy: ['Fire'],
    bondGain: 8,
    bondGainOther: -1,
    hungerRestore: 50,
    desc: 'Thick meat scorched over volcanic rock. Only a Fire creat\'s stomach can handle the heat.',
    source: 'Crafted from Lava Hound drops at campfire'
  },
  {
    id: 'magma-salt',
    name: 'Magma Salt Block',
    emoji: '🧂',
    preferredBy: ['Fire'],
    bondGain: 4,
    bondGainOther: 0,
    hungerRestore: 15,
    desc: 'A mineral lick from deep volcanic veins. Keeps a Fire creat\'s flame bright.',
    source: 'Mined in VolcanoZone'
  },

  // ── WATER ─────────────────────────────────────────────────────────────────
  {
    id: 'river-fish',
    name: 'Silver River Fish',
    emoji: '🐟',
    preferredBy: ['Water'],
    bondGain: 6,
    bondGainOther: 1,
    hungerRestore: 35,
    desc: 'Fresh, cool-fleshed fish from deep forest streams. Water creats are drawn to its scent.',
    source: 'Fished from ForestZone rivers'
  },
  {
    id: 'aqua-lotus',
    name: 'Aqua Lotus Bloom',
    emoji: '🪷',
    preferredBy: ['Water'],
    bondGain: 7,
    bondGainOther: 0,
    hungerRestore: 20,
    desc: 'A rare water flower with healing properties. Calms and nourishes Water creats deeply.',
    source: 'Harvested from Haven pond, rare drop in ForestZone'
  },
  {
    id: 'tide-kelp',
    name: 'Deep Tide Kelp',
    emoji: '🌿',
    preferredBy: ['Water'],
    bondGain: 5,
    bondGainOther: 1,
    hungerRestore: 25,
    desc: 'Briny deep-sea vegetation. Nutritious for water-type creatures.',
    source: 'Sold at Haven market'
  },

  // ── EARTH ─────────────────────────────────────────────────────────────────
  {
    id: 'bark-root',
    name: 'Ancient Bark Root',
    emoji: '🪵',
    preferredBy: ['Earth'],
    bondGain: 6,
    bondGainOther: 1,
    hungerRestore: 30,
    desc: 'Dense, nutrient-packed root torn from old-growth trees. Earth creats gnaw on these for hours.',
    source: 'Harvested from trees in ForestZone'
  },
  {
    id: 'forest-mushroom',
    name: 'Ironbark Mushroom',
    emoji: '🍄',
    preferredBy: ['Earth'],
    bondGain: 7,
    bondGainOther: -1,
    hungerRestore: 25,
    desc: 'A dense fungus that grows on ancient stones. Gives Earth creats a glow of vitality.',
    source: 'Foraged in ForestZone caves'
  },
  {
    id: 'stone-berry',
    name: 'Granite Stone Berry',
    emoji: '🍇',
    preferredBy: ['Earth'],
    bondGain: 5,
    bondGainOther: 1,
    hungerRestore: 20,
    desc: 'Rock-hard berries filled with mineral juice. Earth creats crunch them like candy.',
    source: 'Found near cave entrances, sold at Haven'
  },

  // ── SHADOW ────────────────────────────────────────────────────────────────
  {
    id: 'night-berry',
    name: 'Night Shade Berry',
    emoji: '🍇',
    preferredBy: ['Shadow'],
    bondGain: 7,
    bondGainOther: -2, // toxic to non-shadow creats
    hungerRestore: 25,
    desc: 'Dark berries that only ripen under moonlight. Mildly toxic to most — irresistible to Shadow creats.',
    source: 'Foraged at night in ForestZone'
  },
  {
    id: 'moonshade-moss',
    name: 'Moonshade Moss',
    emoji: '🌑',
    preferredBy: ['Shadow'],
    bondGain: 6,
    bondGainOther: -1,
    hungerRestore: 20,
    desc: 'A phosphorescent moss that absorbs moonlight. Nourishes Shadow creats\' void energy.',
    source: 'Collected from shaded ruins at night'
  },
  {
    id: 'void-jerky',
    name: 'Shadowmeat Jerky',
    emoji: '🥩',
    preferredBy: ['Shadow'],
    bondGain: 9,
    bondGainOther: -3, // strongly bad for others
    hungerRestore: 45,
    desc: 'Cured meat from nocturnal cave predators. Shadow creats find it intoxicatingly satisfying.',
    source: 'Crafted from cave creature drops, rare from Shadeborn Hounds'
  },

  // ── UNIVERSAL (works for all, but less effective) ─────────────────────────
  {
    id: 'basic-feed',
    name: 'Field Grain',
    emoji: '🌾',
    preferredBy: [], // no preference — works for all
    bondGain: 2,
    bondGainOther: 2,
    hungerRestore: 15,
    desc: 'Plain dried grain. Not exciting, but keeps the creat from going hungry in a pinch.',
    source: 'Bought cheaply at Haven market'
  },
  {
    id: 'haven-ration',
    name: 'Haven Ration',
    emoji: '🥫',
    preferredBy: [],
    bondGain: 3,
    bondGainOther: 3,
    hungerRestore: 25,
    desc: 'A balanced blend made by Haven staff. Safe for all creat types, just not a favourite.',
    source: 'Stocked at Haven market'
  }
];

/** Returns foods this creat element prefers, sorted by bond gain (desc) */
export function getPreferredFoods(creatElement: string): CreatFood[] {
  return CREAT_FOODS.filter(f => f.preferredBy.includes(creatElement))
    .sort((a, b) => b.bondGain - a.bondGain);
}

/** Returns universal fallback foods */
export function getUniversalFoods(): CreatFood[] {
  return CREAT_FOODS.filter(f => f.preferredBy.length === 0);
}

// ─── CARE ACTIVITIES ─────────────────────────────────────────────────────────

export interface CareActivity {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  bondGainMatch: number;    // bond gained in match mode
  bondGainDiverge: number;  // bond gained in diverge mode (more rewarding to push through)
  cooldownHours: number;    // real-world hours before can do again
  hungerCost: number;       // uses up some creat hunger (physical activities)
}

export const CARE_ACTIVITIES: CareActivity[] = [
  {
    id: 'feed',
    name: 'Feed',
    emoji: '🍖',
    desc: 'Give your creat food. Use element-specific foods for best results.',
    bondGainMatch: 3,
    bondGainDiverge: 5,
    cooldownHours: 0, // feeding can happen multiple times per day
    hungerCost: 0     // restores hunger, doesn't cost it
  },
  {
    id: 'groom',
    name: 'Groom',
    emoji: '✨',
    desc: 'Brush, clean, and care for your creat\'s coat, scales, or feathers.',
    bondGainMatch: 2,
    bondGainDiverge: 4,
    cooldownHours: 8, // once per 8 hours
    hungerCost: 0
  },
  {
    id: 'play',
    name: 'Play',
    emoji: '🎯',
    desc: 'Chase, fetch, or rough-house. Builds trust through fun.',
    bondGainMatch: 5,
    bondGainDiverge: 8,
    cooldownHours: 4,
    hungerCost: 15
  },
  {
    id: 'train',
    name: 'Combat Train',
    emoji: '⚔️',
    desc: 'Run practice drills together. Deepens battle sync.',
    bondGainMatch: 8,
    bondGainDiverge: 10,
    cooldownHours: 12,
    hungerCost: 25
  },
  {
    id: 'rest',
    name: 'Rest Together',
    emoji: '🌙',
    desc: 'Sleep near your creat. Creat feels safe — bond grows quietly overnight.',
    bondGainMatch: 10,
    bondGainDiverge: 8,
    cooldownHours: 20, // once per day
    hungerCost: 0
  },
  {
    id: 'explore',
    name: 'Explore Together',
    emoji: '🗺️',
    desc: 'Discover new territory side-by-side. Shared experience deepens the bond.',
    bondGainMatch: 12,
    bondGainDiverge: 15,
    cooldownHours: 6,
    hungerCost: 20
  }
];

// ─── NEGLECT / DECAY ─────────────────────────────────────────────────────────

/**
 * What happens when the creat is neglected (hunger → 0, no care).
 * Each tier describes the creat's reaction as things get worse.
 */
export const NEGLECT_STAGES = [
  {
    hungerThreshold: 75, // hunger above 75 → happy
    label: 'Well Fed',
    emoji: '😊',
    bondDecayModifier: 0,   // no extra decay
    behaviorNote: 'Creat is content and energetic.'
  },
  {
    hungerThreshold: 50, // hunger 50–74 → a bit peckish
    label: 'Hungry',
    emoji: '😐',
    bondDecayModifier: 0.5, // 50% extra passive decay
    behaviorNote: 'Creat is restless. Performance starts to dip.'
  },
  {
    hungerThreshold: 25, // hunger 25–49 → noticeably hungry
    label: 'Starving',
    emoji: '😟',
    bondDecayModifier: 1.5, // 150% extra passive decay
    behaviorNote: 'Creat is irritable. May disobey simple commands.'
  },
  {
    hungerThreshold: 0, // hunger 0–24 → critical
    label: 'Malnourished',
    emoji: '😡',
    bondDecayModifier: 3.0, // 300% extra passive decay — bond collapses fast
    behaviorNote: 'Creat is hostile. Will not mount. Bond drops rapidly.'
  }
];

export function getNeglectStage(hunger: number) {
  if (hunger >= 75) return NEGLECT_STAGES[0];
  if (hunger >= 50) return NEGLECT_STAGES[1];
  if (hunger >= 25) return NEGLECT_STAGES[2];
  return NEGLECT_STAGES[3];
}

// ─── BOND CALCULATION HELPERS ────────────────────────────────────────────────

/** Clamps a bond value to valid range */
export function clampBond(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v * 10) / 10));
}

/** Clamps hunger to 0–100 */
export function clampHunger(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Calculate how much bond decays over a real-world time period.
 * Called on scene load or when returning from background.
 */
export function calculatePassiveDecay(
  currentBond: number,
  currentHunger: number,
  compatibility: BondCompatibility,
  elapsedHours: number
): number {
  const profile = COMPATIBILITY[compatibility];
  const neglect = getNeglectStage(currentHunger);
  const baseDecay = profile.passiveDecayPerHour * elapsedHours;
  const neglectBonus = neglect.bondDecayModifier * profile.passiveDecayPerHour * elapsedHours;
  const total = baseDecay + neglectBonus;
  return clampBond(currentBond - total);
}

/**
 * Calculate how much hunger decays over a time period.
 * Hunger drops ~10 points per hour for diverge, ~6 for match.
 */
export function calculateHungerDecay(
  currentHunger: number,
  compatibility: BondCompatibility,
  elapsedHours: number
): number {
  const rate = compatibility === 'match' ? 6 : 10;
  return clampHunger(currentHunger - rate * elapsedHours);
}

/**
 * Apply feeding a specific food to the creat.
 * Returns updated bond (delta) and message for UI.
 */
export function applyFeeding(
  currentBond: number,
  currentOffensePoints: number,
  food: CreatFood,
  creatElement: string,
  compatibility: BondCompatibility
): {
  newBond: number;
  newOffensePoints: number;
  delta: number;
  message: string;
  runawayTriggered: boolean;
  corruptionTriggered: boolean;
  offenseTier: OffenseTier;
} {
  const isPreferred = food.preferredBy.includes(creatElement);
  const profile = COMPATIBILITY[compatibility];
  let offense = clampOffense(currentOffensePoints);
  let gain: number;
  let message: string;

  if (isPreferred) {
    gain = food.bondGain * (compatibility === 'diverge' ? 1.2 : 1); // diverge gets 20% bonus for correct food
    offense = clampOffense(offense - (compatibility === 'diverge' ? 10 : 7));
    message = `🍖 ${creatElement} creat loved the ${food.name}! +${gain.toFixed(1)} bond`;
  } else if (food.preferredBy.length === 0) {
    gain = food.bondGainOther;
    offense = clampOffense(offense - 3);
    message = `🌾 ${creatElement} creat ate the ${food.name}. It'll do. +${gain} bond`;
  } else if (profile.wrongFoodPenalty) {
    gain = food.bondGainOther; // may be negative
    const offenseSpike = gain < 0 ? 10 + Math.abs(gain) * 2 : 6;
    offense = clampOffense(offense + offenseSpike);
    message = gain < 0
      ? `⚠️ ${creatElement} creat didn't like the ${food.name}. ${gain} bond`
      : `🌾 ${creatElement} creat tolerates the ${food.name}. +${gain} bond`;
  } else {
    gain = Math.max(1, food.bondGainOther);
    offense = clampOffense(offense + 3);
    message = `🌿 ${creatElement} creat ate it. Not its favourite. +${gain} bond`;
  }

  const newBond = clampBond(currentBond + gain);
  const offenseTier = getOffenseTier(offense);

  let runawayTriggered = false;
  let corruptionTriggered = false;
  if (offenseTier.level >= 6) {
    runawayTriggered = true;
    // Shadow/Fire are more vulnerable to corruption if trust fully breaks.
    const corruptionBase = creatElement === 'Shadow' ? 0.45 : creatElement === 'Fire' ? 0.3 : 0.18;
    corruptionTriggered = Math.random() < corruptionBase;
    message = corruptionTriggered
      ? `💀 Trust is severed. Your ${creatElement} creat has run off and fallen into corruption.`
      : `🏃 Trust is severed. Your ${creatElement} creat has run off. You can track it and rebuild trust.`;
  }

  if (!runawayTriggered && offenseTier.level >= 4) {
    message += ` · Offense Tier: ${offenseTier.label}`;
  }

  return {
    newBond,
    newOffensePoints: offense,
    delta: gain,
    message,
    runawayTriggered,
    corruptionTriggered,
    offenseTier
  };
}

// ─── UI HELPERS ──────────────────────────────────────────────────────────────

/** Short summary line shown in HUD / Haven */
export function getBondSummary(bond: number, hunger: number, compatibility: BondCompatibility): string {
  const tier = getBondTier(bond);
  const neglect = getNeglectStage(hunger);
  const compLabel = COMPATIBILITY[compatibility].label;
  return `${tier.emoji ?? '◈'} ${bond}% Bond · ${tier.label} · ${neglect.emoji} ${neglect.label} · ${compLabel}`;
}

/** Full status block for Haven creat panel */
export function getCreatStatusBlock(
  creatElement: string,
  bond: number,
  hunger: number,
  compatibility: BondCompatibility
): {
  tier: BondTier;
  neglect: typeof NEGLECT_STAGES[0];
  preferredFoods: CreatFood[];
  profile: CompatibilityProfile;
  warningMessage: string | null;
} {
  const tier = getBondTier(bond);
  const neglect = getNeglectStage(hunger);
  const preferredFoods = getPreferredFoods(creatElement);
  const profile = COMPATIBILITY[compatibility];

  let warningMessage: string | null = null;
  if (hunger < 25 && compatibility === 'diverge') {
    warningMessage = `⚠️ Use your discernment: your ${creatElement} creat is malnourished and pulling away. Feed it ${preferredFoods[0]?.name ?? 'preferred food'} to restore trust.`;
  } else if (bond < 40 && compatibility === 'diverge') {
    warningMessage = `⚠️ Your discernment is needed. Bond is fragile — your creat may resist your will in battle. Tend to it with care.`;
  } else if (hunger < 50) {
    warningMessage = `Your discernment notices: ${creatElement} creat needs nourishment soon.`;
  }

  return { tier, neglect, preferredFoods, profile, warningMessage };
}
