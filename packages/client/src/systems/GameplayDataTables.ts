import type { CreatElement } from './CreatSpecies';

/**
 * Canonical terminology:
 * - CHARACTER = Hero/Rider
 * - CREAT = companion creature
 *
 * Data-only module: no runtime combat logic here.
 * Use these tables to drive future menus, unlocks, shops, crafting, and loot.
 */

export type CharacterElement = CreatElement;

export type SkillKind = 'attack' | 'power' | 'utility' | 'spell' | 'support';

export interface SkillPowerGrowth {
  basePower: number;
  growthPerLevel: number;
  boostMultiplierPerRank: number;
  maxBoostRanks: number;
  durationSeconds?: number;
  durationGrowthPerRank?: number;
  canStack: boolean;
}

export interface SkillData {
  id: string;
  name: string;
  kind: SkillKind;
  cooldownSeconds: number;
  isInherent: boolean;
  unlockLevel: number;
  unlockStoryMilestone?: string;
  power: SkillPowerGrowth;
  notes?: string;
}

export interface ElementSkillTrack {
  element: CharacterElement;
  characterSkills: SkillData[];
  creatSkills: SkillData[];
}

export interface HeroCreatComboData {
  element: CharacterElement;
  heroPower: string;
  creatPower: string;
  comboName: string;
  comboEffect: string;
}

export interface ActiveLoadoutSlot {
  slotIndex: 1 | 2 | 3 | 4 | 5;
  lockState: 'locked' | 'open';
  rule: string;
  reservedForInherent: boolean;
}

export interface SkillSlotRules {
  track: 'character' | 'creat';
  totalSlots: 5;
  slotLayout: ActiveLoadoutSlot[];
}

export interface ProgressionUnlockRule {
  id: string;
  trigger: 'level' | 'story' | 'kingdom' | 'crown';
  condition: string;
  rewardType: 'new-skill' | 'upgrade-point' | 'signature-skill' | 'ultimate-skill';
  notes?: string;
}

export const CHARACTER_SKILL_SLOT_RULES: SkillSlotRules = {
  track: 'character',
  totalSlots: 5,
  slotLayout: [
    { slotIndex: 1, lockState: 'open', rule: 'Inherent elemental staple skill auto-equipped', reservedForInherent: true },
    { slotIndex: 2, lockState: 'open', rule: 'Player-picked from unlocked character roster', reservedForInherent: false },
    { slotIndex: 3, lockState: 'open', rule: 'Player-picked from unlocked character roster', reservedForInherent: false },
    { slotIndex: 4, lockState: 'open', rule: 'Player-picked from unlocked character roster', reservedForInherent: false },
    { slotIndex: 5, lockState: 'open', rule: 'Player-picked from unlocked character roster', reservedForInherent: false }
  ]
};

export const CREAT_SKILL_SLOT_RULES: SkillSlotRules = {
  track: 'creat',
  totalSlots: 5,
  slotLayout: [
    { slotIndex: 1, lockState: 'open', rule: 'Inherent species signature skill auto-equipped', reservedForInherent: true },
    { slotIndex: 2, lockState: 'open', rule: 'Picked from unlocked creat roster', reservedForInherent: false },
    { slotIndex: 3, lockState: 'open', rule: 'Picked from unlocked creat roster', reservedForInherent: false },
    { slotIndex: 4, lockState: 'open', rule: 'Picked from unlocked creat roster', reservedForInherent: false },
    { slotIndex: 5, lockState: 'open', rule: 'Picked from unlocked creat roster', reservedForInherent: false }
  ]
};

export const CHARACTER_PROGRESS_UNLOCKS: ProgressionUnlockRule[] = [
  { id: 'lvl-10-upgrade', trigger: 'level', condition: 'Every 10 levels', rewardType: 'upgrade-point', notes: 'Minor passive or cooldown node' },
  { id: 'lvl-15-skill', trigger: 'level', condition: 'Every 15 levels', rewardType: 'new-skill', notes: 'New attack/power/utility/spell added to roster' },
  { id: 'story-signature', trigger: 'story', condition: 'Major story completion', rewardType: 'signature-skill' },
  { id: 'kingdom-blessing', trigger: 'kingdom', condition: 'Each kingdom restored', rewardType: 'new-skill', notes: 'Element blessing power' },
  { id: 'crown-ultimate', trigger: 'crown', condition: 'Crown completion milestone', rewardType: 'ultimate-skill' }
];

export const CREAT_PROGRESS_UNLOCKS: ProgressionUnlockRule[] = [
  { id: 'bond-15-upgrade', trigger: 'level', condition: 'Bond milestones every 15%', rewardType: 'upgrade-point' },
  { id: 'story-ability', trigger: 'story', condition: 'Story chapter clears', rewardType: 'new-skill' },
  { id: 'kingdom-trait', trigger: 'kingdom', condition: 'Kingdom restoration milestones', rewardType: 'new-skill', notes: 'Rare elemental trait unlocks' },
  { id: 'crown-soul-link', trigger: 'crown', condition: 'Crown-tier bond challenge', rewardType: 'ultimate-skill' }
];

function mkSkill(
  id: string,
  name: string,
  kind: SkillKind,
  cooldownSeconds: number,
  isInherent: boolean,
  unlockLevel: number,
  basePower: number,
  growthPerLevel: number,
  notes?: string
): SkillData {
  return {
    id,
    name,
    kind,
    cooldownSeconds,
    isInherent,
    unlockLevel,
    power: {
      basePower,
      growthPerLevel,
      boostMultiplierPerRank: 0.15,
      maxBoostRanks: 5,
      durationSeconds: kind === 'support' || kind === 'utility' ? 6 : 0,
      durationGrowthPerRank: kind === 'support' || kind === 'utility' ? 0.75 : 0,
      canStack: kind !== 'attack'
    },
    notes
  };
}

export const ELEMENT_SKILL_TRACKS: Record<CharacterElement, ElementSkillTrack> = {
  Fire: {
    element: 'Fire',
    characterSkills: [
      mkSkill('char-fire-staple', 'Flame Slash', 'attack', 3, true, 1, 28, 1.3, 'Inherent staple slot'),
      mkSkill('char-fire-phoenix-lunge', 'Phoenix Lunge', 'power', 10, false, 15, 42, 1.6),
      mkSkill('char-fire-magma-breaker', 'Magma Breaker', 'power', 14, false, 30, 56, 1.8),
      mkSkill('char-fire-infernal-rally', 'Infernal Rally', 'support', 20, false, 45, 0, 0, 'Team buff')
    ],
    creatSkills: [
      mkSkill('creat-fire-staple', 'Scorch Burst', 'power', 9, true, 1, 38, 1.4, 'Inherent staple slot'),
      mkSkill('creat-fire-molten-roar', 'Molten Roar', 'utility', 12, false, 15, 20, 1.0),
      mkSkill('creat-fire-searing-flight', 'Searing Flight', 'attack', 10, false, 30, 35, 1.2),
      mkSkill('creat-fire-inferno-ward', 'Inferno Ward', 'support', 16, false, 45, 0, 0)
    ]
  },
  Water: {
    element: 'Water',
    characterSkills: [
      mkSkill('char-water-staple', 'Tidal Thrust', 'attack', 3, true, 1, 24, 1.2),
      mkSkill('char-water-torrent-pierce', 'Torrent Pierce', 'power', 9, false, 15, 36, 1.4),
      mkSkill('char-water-healing-current', 'Healing Current', 'support', 14, false, 30, 0, 0),
      mkSkill('char-water-mirror-wave', 'Mirror Wave', 'utility', 18, false, 45, 18, 0.9)
    ],
    creatSkills: [
      mkSkill('creat-water-staple', 'Hydro Surge', 'power', 8, true, 1, 32, 1.3),
      mkSkill('creat-water-undertow-pull', 'Undertow Pull', 'utility', 11, false, 15, 18, 0.8),
      mkSkill('creat-water-mist-screen', 'Mist Screen', 'support', 13, false, 30, 0, 0),
      mkSkill('creat-water-current-shell', 'Current Shell', 'support', 17, false, 45, 0, 0)
    ]
  },
  Earth: {
    element: 'Earth',
    characterSkills: [
      mkSkill('char-earth-staple', 'Stone Bash', 'attack', 4, true, 1, 30, 1.3),
      mkSkill('char-earth-faultline-slam', 'Faultline Slam', 'power', 12, false, 15, 46, 1.6),
      mkSkill('char-earth-rooted-guard', 'Rooted Guard', 'support', 16, false, 30, 0, 0),
      mkSkill('char-earth-titan-advance', 'Titan Advance', 'power', 20, false, 45, 58, 1.9)
    ],
    creatSkills: [
      mkSkill('creat-earth-staple', 'Tremor Charge', 'power', 12, true, 1, 44, 1.5),
      mkSkill('creat-earth-quake-burst', 'Quake Burst', 'attack', 13, false, 15, 33, 1.1),
      mkSkill('creat-earth-ironhide-guard', 'Ironhide Guard', 'support', 14, false, 30, 0, 0),
      mkSkill('creat-earth-briar-crush', 'Briar Crush', 'utility', 16, false, 45, 22, 0.9)
    ]
  },
  Storm: {
    element: 'Storm',
    characterSkills: [
      mkSkill('char-storm-staple', 'Volt Jab', 'attack', 3, true, 1, 26, 1.3),
      mkSkill('char-storm-lightning-rush', 'Lightning Rush', 'power', 8, false, 15, 38, 1.5),
      mkSkill('char-storm-gale-counter', 'Gale Counter', 'utility', 12, false, 30, 24, 1.0),
      mkSkill('char-storm-tempest-drive', 'Tempest Drive', 'power', 18, false, 45, 52, 1.8)
    ],
    creatSkills: [
      mkSkill('creat-storm-staple', 'Chain Lightning', 'power', 7, true, 1, 28, 1.3),
      mkSkill('creat-storm-tempest-leap', 'Tempest Leap', 'attack', 9, false, 15, 30, 1.2),
      mkSkill('creat-storm-cyclone-fang', 'Cyclone Fang', 'attack', 11, false, 30, 34, 1.3),
      mkSkill('creat-storm-static-wall', 'Static Wall', 'support', 15, false, 45, 0, 0)
    ]
  },
  Light: {
    element: 'Light',
    characterSkills: [
      mkSkill('char-light-staple', 'Radiant Cut', 'attack', 3, true, 1, 23, 1.1),
      mkSkill('char-light-lumen-strike', 'Lumen Strike', 'power', 9, false, 15, 34, 1.3),
      mkSkill('char-light-sanctuary-ring', 'Sanctuary Ring', 'support', 15, false, 30, 0, 0),
      mkSkill('char-light-daybreak-lance', 'Daybreak Lance', 'power', 19, false, 45, 50, 1.7)
    ],
    creatSkills: [
      mkSkill('creat-light-staple', 'Radiant Pulse', 'power', 10, true, 1, 25, 1.1),
      mkSkill('creat-light-sunbeam-arc', 'Sunbeam Arc', 'attack', 12, false, 15, 29, 1.1),
      mkSkill('creat-light-blessing-circle', 'Blessing Circle', 'support', 14, false, 30, 0, 0),
      mkSkill('creat-light-beacon-rush', 'Beacon Rush', 'utility', 16, false, 45, 18, 0.8)
    ]
  },
  Shadow: {
    element: 'Shadow',
    characterSkills: [
      mkSkill('char-shadow-staple', 'Veil Strike', 'attack', 3, true, 1, 29, 1.4),
      mkSkill('char-shadow-midnight-step', 'Midnight Step', 'utility', 8, false, 15, 20, 0.9),
      mkSkill('char-shadow-silence-brand', 'Silence Brand', 'power', 13, false, 30, 37, 1.4),
      mkSkill('char-shadow-execution-arc', 'Execution Arc', 'power', 18, false, 45, 55, 1.9)
    ],
    creatSkills: [
      mkSkill('creat-shadow-staple', 'Shade Pounce', 'power', 11, true, 1, 52, 1.6),
      mkSkill('creat-shadow-eclipse-claw', 'Eclipse Claw', 'attack', 10, false, 15, 33, 1.2),
      mkSkill('creat-shadow-terror-pulse', 'Terror Pulse', 'utility', 14, false, 30, 21, 0.8),
      mkSkill('creat-shadow-umbral-gate', 'Umbral Gate', 'support', 17, false, 45, 0, 0)
    ]
  },
  Arcane: {
    element: 'Arcane',
    characterSkills: [
      mkSkill('char-arcane-staple', 'Rune Slash', 'attack', 3, true, 1, 25, 1.2),
      mkSkill('char-arcane-aether-lance', 'Aether Lance', 'power', 10, false, 15, 39, 1.4),
      mkSkill('char-arcane-chrono-lock', 'Chrono Lock', 'utility', 14, false, 30, 19, 0.8),
      mkSkill('char-arcane-nova-script', 'Nova Script', 'power', 20, false, 45, 53, 1.8)
    ],
    creatSkills: [
      mkSkill('creat-arcane-staple', 'Arcane Rift', 'power', 13, true, 1, 36, 1.4),
      mkSkill('creat-arcane-prism-barrage', 'attack', 11, false, 15, 31, 1.2),
      mkSkill('creat-arcane-gravity-knot', 'utility', 15, false, 30, 22, 0.8),
      mkSkill('creat-arcane-ethereal-nova', 'power', 17, false, 45, 41, 1.4)
    ]
  }
};

const HERO_CREAT_COMBO_TABLE: Record<CharacterElement, HeroCreatComboData> = {
  Fire: {
    element: 'Fire',
    heroPower: 'Phoenix Lunge',
    creatPower: 'Scorch Burst',
    comboName: 'Phoenix Scorch Chain',
    comboEffect: 'Hero dash ignites target; creat cone consumes burn stacks for burst AoE.'
  },
  Water: {
    element: 'Water',
    heroPower: 'Torrent Pierce',
    creatPower: 'Hydro Surge',
    comboName: 'Undertow Lance',
    comboEffect: 'Hero pierce applies Soak; creat surge pulls and locks soaked targets.'
  },
  Earth: {
    element: 'Earth',
    heroPower: 'Faultline Slam',
    creatPower: 'Tremor Charge',
    comboName: 'Bastion Breaker',
    comboEffect: 'Hero fortifies then creat charge shatters staggered enemies for bonus armor break.'
  },
  Storm: {
    element: 'Storm',
    heroPower: 'Lightning Rush',
    creatPower: 'Chain Lightning',
    comboName: 'Tempest Relay',
    comboEffect: 'Hero rush tags primary target; creat chain starts from tag and gains one extra jump.'
  },
  Light: {
    element: 'Light',
    heroPower: 'Sanctuary Ring',
    creatPower: 'Radiant Pulse',
    comboName: 'Sanctified Resonance',
    comboEffect: 'Pulse from inside Sanctuary doubles cleanse output and grants short team shield.'
  },
  Shadow: {
    element: 'Shadow',
    heroPower: 'Midnight Step',
    creatPower: 'Shade Pounce',
    comboName: 'Eclipse Ambush',
    comboEffect: 'Hero marks from stealth; creat pounce consumes mark for guaranteed critical fear strike.'
  },
  Arcane: {
    element: 'Arcane',
    heroPower: 'Chrono Lock',
    creatPower: 'Arcane Rift',
    comboName: 'Paradox Well',
    comboEffect: 'Chrono lock freezes target drift while rift ticks faster and refunds partial cooldown.'
  }
};

export interface ShopItemData {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'creat-armor' | 'riding-gear' | 'potion' | 'food' | 'material';
  priceGc: number;
  sellGc: number;
  tradable: boolean;
  unlockLevel?: number;
  tags: string[];
}

export interface CraftRecipeData {
  id: string;
  outputItemId: string;
  station: 'forge' | 'loom' | 'alchemy' | 'stables';
  requiredLevel: number;
  materials: Array<{ itemId: string; amount: number }>;
}

export interface LootPoolEntry {
  itemId: string;
  weight: number;
  minQty: number;
  maxQty: number;
}

export const SHOP_ITEM_TABLE: ShopItemData[] = [
  { id: 'potion-heal-standard', name: 'Standard Healing Potion', type: 'potion', priceGc: 100, sellGc: 25, tradable: true, tags: ['combat', 'healing'] },
  { id: 'food-ember-fruit', name: 'Ember Fruit', type: 'food', priceGc: 55, sellGc: 14, tradable: true, tags: ['creat-care', 'food'] },
  { id: 'armor-hero-fire-vest', name: 'Fireguard Vest', type: 'armor', priceGc: 480, sellGc: 120, tradable: true, unlockLevel: 15, tags: ['hero', 'fire'] },
  { id: 'armor-creat-barding-ash', name: 'Ash Barding', type: 'creat-armor', priceGc: 420, sellGc: 105, tradable: true, unlockLevel: 15, tags: ['creat', 'armor'] },
  { id: 'gear-saddle-storm', name: 'Storm Saddle', type: 'riding-gear', priceGc: 600, sellGc: 150, tradable: true, unlockLevel: 20, tags: ['riding', 'speed'] },
  { id: 'mat-essence-arcane', name: 'Arcane Essence', type: 'material', priceGc: 140, sellGc: 35, tradable: true, tags: ['crafting', 'arcane'] }
];

export const CRAFT_RECIPE_TABLE: CraftRecipeData[] = [
  {
    id: 'recipe-creat-barding-ash',
    outputItemId: 'armor-creat-barding-ash',
    station: 'stables',
    requiredLevel: 15,
    materials: [
      { itemId: 'mat-essence-fire', amount: 2 },
      { itemId: 'mat-fiber-bundle', amount: 4 },
      { itemId: 'mat-iron-ore', amount: 2 }
    ]
  },
  {
    id: 'recipe-storm-saddle',
    outputItemId: 'gear-saddle-storm',
    station: 'stables',
    requiredLevel: 20,
    materials: [
      { itemId: 'mat-essence-storm', amount: 3 },
      { itemId: 'mat-leather-strip', amount: 5 },
      { itemId: 'mat-shock-crystal', amount: 2 }
    ]
  },
  {
    id: 'recipe-potion-heal-standard',
    outputItemId: 'potion-heal-standard',
    station: 'alchemy',
    requiredLevel: 1,
    materials: [
      { itemId: 'mat-herb-common', amount: 2 },
      { itemId: 'mat-water-clean', amount: 1 }
    ]
  }
];

export const LOOT_POOL_TABLE: Record<'forest' | 'volcano' | 'race' | 'boss', LootPoolEntry[]> = {
  forest: [
    { itemId: 'food-ember-fruit', weight: 20, minQty: 1, maxQty: 2 },
    { itemId: 'mat-fiber-bundle', weight: 24, minQty: 1, maxQty: 3 },
    { itemId: 'mat-essence-earth', weight: 10, minQty: 1, maxQty: 1 }
  ],
  volcano: [
    { itemId: 'mat-essence-fire', weight: 18, minQty: 1, maxQty: 2 },
    { itemId: 'mat-iron-ore', weight: 16, minQty: 1, maxQty: 2 },
    { itemId: 'food-ember-fruit', weight: 12, minQty: 1, maxQty: 1 }
  ],
  race: [
    { itemId: 'gear-saddle-storm', weight: 2, minQty: 1, maxQty: 1 },
    { itemId: 'mat-shock-crystal', weight: 14, minQty: 1, maxQty: 2 },
    { itemId: 'potion-heal-standard', weight: 10, minQty: 1, maxQty: 1 }
  ],
  boss: [
    { itemId: 'mat-crown-alloy-chunk', weight: 20, minQty: 1, maxQty: 2 },
    { itemId: 'mat-mythic-scale', weight: 8, minQty: 1, maxQty: 1 },
    { itemId: 'mat-ancient-sigil-plate', weight: 6, minQty: 1, maxQty: 1 }
  ]
};

export function getElementSkillTrack(element: CharacterElement): ElementSkillTrack {
  return ELEMENT_SKILL_TRACKS[element] ?? ELEMENT_SKILL_TRACKS.Fire;
}

export function getShopItemsForLevel(level: number): ShopItemData[] {
  return SHOP_ITEM_TABLE.filter((item) => !item.unlockLevel || level >= item.unlockLevel);
}

export function getLootPool(zone: 'forest' | 'volcano' | 'race' | 'boss'): LootPoolEntry[] {
  return LOOT_POOL_TABLE[zone] ?? LOOT_POOL_TABLE.forest;
}

export function getSkillUnlocksThroughLevel(level: number): SkillData[] {
  const out: SkillData[] = [];
  (Object.keys(ELEMENT_SKILL_TRACKS) as CharacterElement[]).forEach((element) => {
    const track = ELEMENT_SKILL_TRACKS[element];
    out.push(...track.characterSkills.filter((skill) => skill.unlockLevel <= level));
    out.push(...track.creatSkills.filter((skill) => skill.unlockLevel <= level));
  });
  return out;
}

export function getHeroCreatCombo(element: CharacterElement): HeroCreatComboData {
  return HERO_CREAT_COMBO_TABLE[element] ?? HERO_CREAT_COMBO_TABLE.Fire;
}

// ─── BOND FINISHING MOVE (CROWN BREAKER) SYSTEM ─────────────────────────────
//
// When a boss HP drops into the "last-stand threshold" (see triggerHpPercent),
// the player is offered a one-time Bond Finishing Move (called a Crown Breaker)
// that combines the Character's signature attack with the Creat's species power.
// Data-only. No gameplay execution logic here.

export type FinishingMoveCategory = 'strike' | 'burst' | 'seal' | 'chain' | 'surge';

export interface BondFinishingMove {
  id: string;
  name: string;
  flavor: string;
  category: FinishingMoveCategory;
  /** Boss HP % threshold that unlocks the prompt (e.g. 0.15 = 15%) */
  triggerHpPercent: number;
  /** Minimum bond % required between hero and creat to access this move */
  minBondPercent: number;
  /** Element pairing that produces this specific finishing move */
  characterElement: CharacterElement;
  creatElement: CharacterElement;
  /** Whether the two elements must match for this entry to apply */
  requiresMatchingElements: boolean;
  /** Power multiplier applied on top of the hero's current signature skill damage */
  damageMultiplier: number;
  /** If true, this move triggers a special cinematic/animation flag */
  cinematicFlag: boolean;
  notes?: string;
}

/**
 * Per-element-pair Bond Finishing Moves.
 * Same-element pairs get an "Awakened" variant (cinematicFlag: true).
 * Cross-element pairs get a hybrid "Clash" variant.
 * Matched elements are listed first in each group.
 */
export const BOND_FINISHING_MOVES: BondFinishingMove[] = [
  // ── Same-element (Awakened) ──────────────────────────────────────────────
  {
    id: 'fin-fire-fire',
    name: 'Inferno Crown Break',
    flavor: 'Hero and creat ignite as one — a pillar of fire swallows the boss whole.',
    category: 'burst',
    triggerHpPercent: 0.15,
    minBondPercent: 50,
    characterElement: 'Fire',
    creatElement: 'Fire',
    requiresMatchingElements: true,
    damageMultiplier: 3.2,
    cinematicFlag: true
  },
  {
    id: 'fin-water-water',
    name: 'Tidal Sovereign Crash',
    flavor: 'A crushing wave conjured from twin wills — the boss drowns in the surge.',
    category: 'surge',
    triggerHpPercent: 0.15,
    minBondPercent: 50,
    characterElement: 'Water',
    creatElement: 'Water',
    requiresMatchingElements: true,
    damageMultiplier: 3.0,
    cinematicFlag: true
  },
  {
    id: 'fin-earth-earth',
    name: 'Titan\'s Verdict',
    flavor: 'The ground itself rises — sealed beneath stone by hero and creat together.',
    category: 'seal',
    triggerHpPercent: 0.15,
    minBondPercent: 50,
    characterElement: 'Earth',
    creatElement: 'Earth',
    requiresMatchingElements: true,
    damageMultiplier: 3.1,
    cinematicFlag: true
  },
  {
    id: 'fin-storm-storm',
    name: 'Tempest Throne Shatter',
    flavor: 'A bolt born of two lightning wills — cracks the boss\'s crown in half.',
    category: 'strike',
    triggerHpPercent: 0.15,
    minBondPercent: 50,
    characterElement: 'Storm',
    creatElement: 'Storm',
    requiresMatchingElements: true,
    damageMultiplier: 3.3,
    cinematicFlag: true
  },
  {
    id: 'fin-light-light',
    name: 'Radiant Judgement',
    flavor: 'Hero and creat shine as a single beacon — searing through the boss\'s last shadow.',
    category: 'burst',
    triggerHpPercent: 0.15,
    minBondPercent: 50,
    characterElement: 'Light',
    creatElement: 'Light',
    requiresMatchingElements: true,
    damageMultiplier: 3.0,
    cinematicFlag: true
  },
  {
    id: 'fin-shadow-shadow',
    name: 'Eclipse Final Strike',
    flavor: 'Darkness pours from both — the boss is consumed before it sees the blow land.',
    category: 'chain',
    triggerHpPercent: 0.15,
    minBondPercent: 50,
    characterElement: 'Shadow',
    creatElement: 'Shadow',
    requiresMatchingElements: true,
    damageMultiplier: 3.4,
    cinematicFlag: true
  },
  {
    id: 'fin-arcane-arcane',
    name: 'Convergence Seal',
    flavor: 'Ancient runes inscribed by two hands at once — the boss is locked and shattered.',
    category: 'seal',
    triggerHpPercent: 0.15,
    minBondPercent: 50,
    characterElement: 'Arcane',
    creatElement: 'Arcane',
    requiresMatchingElements: true,
    damageMultiplier: 3.2,
    cinematicFlag: true
  },

  // ── Cross-element (Clash) ────────────────────────────────────────────────
  {
    id: 'fin-fire-water',
    name: 'Steam Breaker',
    flavor: 'Flame meets tide — scalding steam blasts the boss from both sides.',
    category: 'burst',
    triggerHpPercent: 0.15,
    minBondPercent: 40,
    characterElement: 'Fire',
    creatElement: 'Water',
    requiresMatchingElements: false,
    damageMultiplier: 2.6,
    cinematicFlag: false
  },
  {
    id: 'fin-storm-earth',
    name: 'Fault Surge',
    flavor: 'Lightning splits open the ground while stone rises — the boss crumbles in both.',
    category: 'surge',
    triggerHpPercent: 0.15,
    minBondPercent: 40,
    characterElement: 'Storm',
    creatElement: 'Earth',
    requiresMatchingElements: false,
    damageMultiplier: 2.7,
    cinematicFlag: false
  },
  {
    id: 'fin-light-shadow',
    name: 'Dusk Crown Break',
    flavor: 'Light and shadow collide into a grey lance — the only strike that can end a cursed boss.',
    category: 'strike',
    triggerHpPercent: 0.15,
    minBondPercent: 40,
    characterElement: 'Light',
    creatElement: 'Shadow',
    requiresMatchingElements: false,
    damageMultiplier: 2.8,
    cinematicFlag: false,
    notes: 'Unique to Light/Shadow cross-bond. May trigger special boss dialogue before impact.'
  },
  {
    id: 'fin-arcane-any',
    name: 'Void Anchor',
    flavor: 'Arcane energy channels whatever the creat holds — and bends it into a final seal.',
    category: 'seal',
    triggerHpPercent: 0.15,
    minBondPercent: 35,
    characterElement: 'Arcane',
    creatElement: 'Fire', // placeholder; Arcane pairs with any element in practice
    requiresMatchingElements: false,
    damageMultiplier: 2.5,
    cinematicFlag: false,
    notes: 'Arcane hero may bond-finish with any creat element. Runtime should match this entry for any Arcane hero regardless of creat element.'
  }
];

/** Returns the best-matching finishing move for a given hero+creat element pair. */
export function getBondFinishingMove(
  characterElement: CharacterElement,
  creatElement: CharacterElement,
  bondPercent: number
): BondFinishingMove | null {
  // Prefer same-element (cinematic) first
  const exact = BOND_FINISHING_MOVES.find(
    (m) =>
      m.characterElement === characterElement &&
      m.creatElement === creatElement &&
      m.requiresMatchingElements &&
      bondPercent >= m.minBondPercent
  );
  if (exact) return exact;

  // Fall back to cross-element match
  const cross = BOND_FINISHING_MOVES.find(
    (m) =>
      m.characterElement === characterElement &&
      !m.requiresMatchingElements &&
      bondPercent >= m.minBondPercent
  );
  if (cross) return cross;

  // Arcane wildcard is only valid for Arcane hero pairings.
  if (characterElement !== 'Arcane') {
    return null;
  }

  const arcaneWild = BOND_FINISHING_MOVES.find(
    (m) => m.id === 'fin-arcane-any' && bondPercent >= m.minBondPercent
  );
  return arcaneWild ?? null;
}
