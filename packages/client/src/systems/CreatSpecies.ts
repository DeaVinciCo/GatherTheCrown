/**
 * CreatSpecies — Complete registry of all mythical Creat creatures.
 *
 * Each element maps to one unique mythical species with its own lore,
 * abilities, stats profile, and elemental attack.
 *
 * Import { getCreatSpecies, CREAT_SPECIES } wherever creat identity is needed.
 */

export type CreatElement = 'Fire' | 'Water' | 'Earth' | 'Storm' | 'Light' | 'Shadow' | 'Arcane';

export interface CreatAbility {
  /** Short display name shown in HUD / panels. */
  name: string;
  /** What it does when activated. */
  description: string;
  /** Damage or heal value at base level. */
  basePower: number;
  /** Cooldown in seconds. */
  cooldown: number;
  /** Type of effect. */
  effectType: 'damage' | 'heal' | 'stun' | 'pull' | 'buff' | 'debuff';
}

export interface CreatPassive {
  name: string;
  description: string;
}

export interface CreatSpeciesEntry {
  /** Unique element key. */
  element: CreatElement;
  /** Official species name (displayed in Creat Codex + HUD). */
  species: string;
  /** Short mythological archetype descriptor. */
  archetype: string;
  /** One-paragraph lore blurb. */
  lore: string;
  /** Active ability — triggered by the player. */
  ability: CreatAbility;
  /** Passive bonus — always active while bonded. */
  passive: CreatPassive;
  /** Stat profile tendency. */
  statProfile: {
    attack: 'low' | 'medium' | 'high';
    defense: 'low' | 'medium' | 'high';
    speed: 'low' | 'medium' | 'high';
    magic: 'low' | 'medium' | 'high';
  };
  /** Hex colour string matching the element palette. */
  color: string;
  /** Emoji icon used in UI labels. */
  icon: string;
  /** Phaser texture key (creat-<element.toLowerCase()>). */
  textureKey: string;
  /** Auto-name pools used at hatch time. */
  autoNames: string[];
}

export interface CreatVariantEntry extends CreatSpeciesEntry {
  /** Variant tier marker used for progression gating. */
  variantTier: 'A' | 'B';
  /** Name of the core species this variant branches from. */
  coreSpecies: string;
  /** Recommended minimum bond level before this variant can be selected/evolved. */
  unlockBond: number;
  /** Narrative or gameplay unlock source. */
  unlockSource: string;
}

export interface CreatVariantUnlockContext {
  heroLevel: number;
  forestTrialsCleared: number;
  creatBond: number;
  storyModeCompleted: boolean;
}

export interface CreatSpeciesSelectionOption {
  entry: CreatSpeciesEntry;
  unlocked: boolean;
  lockReason?: string;
  source: 'core' | 'variant-a';
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIES DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const CREAT_SPECIES: Record<CreatElement, CreatSpeciesEntry> = {

  // ── FIRE ──────────────────────────────────────────────────────────────────
  Fire: {
    element: 'Fire',
    species: 'Emberdrake',
    archetype: 'Volcanic Wyvern',
    lore: 'Born from the smouldering hearts of dormant volcanoes, the Emberdrake is a compact yet ferocious wyvern whose scales glow like cooling magma. Ancient texts describe them as the "living breath of the mountain" — guardians of sacred forge-sites who bond only with riders who carry flame in their soul. They are aggressive, loyal to the point of recklessness, and will scorch anything that threatens their bonded hero.',
    ability: {
      name: 'Scorch Burst',
      description: 'Rears back and unleashes a short-range cone of superheated flame, burning all enemies in the arc for 3 seconds. Burning enemies deal 15% reduced damage for the duration.',
      basePower: 38,
      cooldown: 9,
      effectType: 'damage'
    },
    passive: {
      name: 'Flame Aura',
      description: 'The Emberdrake\'s constant heat field causes nearby enemies to take 8% extra fire damage from all sources while the creat is at 60%+ bond.'
    },
    statProfile: { attack: 'high', defense: 'medium', speed: 'medium', magic: 'low' },
    color: '#ef4444',
    icon: '🔥',
    textureKey: 'creat-fire',
    autoNames: ['Emberveil', 'Scorchfang', 'Cindra', 'Pyrix', 'Ashwing']
  },

  // ── WATER ─────────────────────────────────────────────────────────────────
  Water: {
    element: 'Water',
    species: 'Tidewyrm',
    archetype: 'Abyssal Sea Serpent',
    lore: 'The Tidewyrm haunts the deep channels between the coastal kingdoms — a serpentine leviathan that measures over six metres from crown to tail-fin, yet moves with eerie silence. Sailors in the Gather the Crown lore call them "tide-whisperers" and believe seeing one surface predicts a great turning of fortune. They bond with calm, patient riders and punish haste in their companions with withering looks alone.',
    ability: {
      name: 'Hydro Surge',
      description: 'Launches a spiralling torrent of high-pressure water at a single target. Deals damage and applies a Soaked stack — Soaked enemies move 30% slower for 4 seconds.',
      basePower: 32,
      cooldown: 8,
      effectType: 'debuff'
    },
    passive: {
      name: 'Aqua Veil',
      description: 'Wraps the hero in a thin current of protective water, reducing all incoming fire and lightning damage by 12% as long as the creat\'s hunger is above 40%.'
    },
    statProfile: { attack: 'medium', defense: 'high', speed: 'medium', magic: 'medium' },
    color: '#3b82f6',
    icon: '🌊',
    textureKey: 'creat-water',
    autoNames: ['Tidemaw', 'Coralisk', 'Briniath', 'Deepsong', 'Murrath']
  },

  // ── EARTH ─────────────────────────────────────────────────────────────────
  Earth: {
    element: 'Earth',
    species: 'Stoneboar',
    archetype: 'Ironhide Behemoth',
    lore: 'The Stoneboar is an ancient warden of the deep forest, a massive boar whose hide has fossilised into living stone over centuries of exposure to ley-line energies. The creature\'s tusks are pure petrified crystal — capable of shattering siege walls. Though slow to anger, a Stoneboar that charges is an unstoppable geological event. They bond with steadfast, grounded heroes who honour the land.',
    ability: {
      name: 'Tremor Charge',
      description: 'The Stoneboar lowers its head and charges forward in a straight line, slamming every enemy in its path. Each enemy hit is stunned for 1.5 seconds and takes earth-type damage.',
      basePower: 44,
      cooldown: 12,
      effectType: 'stun'
    },
    passive: {
      name: 'Stone Hide',
      description: 'The creat\'s proximity radiates earthen resilience — the bonded hero gains +10 flat armour rating while the creat is hatched and not running away.'
    },
    statProfile: { attack: 'medium', defense: 'high', speed: 'low', magic: 'low' },
    color: '#22c55e',
    icon: '🪨',
    textureKey: 'creat-earth',
    autoNames: ['Rootmoss', 'Gravel', 'Stonehide', 'Ferntusk', 'Mudrim']
  },

  // ── STORM ─────────────────────────────────────────────────────────────────
  Storm: {
    element: 'Storm',
    species: 'Voltfang',
    archetype: 'Thunder Wolf',
    lore: 'The Voltfang is a sleek, silver-pelted wolf whose fur crackles with perpetual static electricity. Nomadic packs were once said to travel alongside thunderstorms, feeding on the energy of lightning strikes. A bonded Voltfang can redirect ambient electrical charge into coordinated pack-strike patterns — even alone, its chain-lightning ability mimics the behaviour of a full pack hunting in unison. Fast, vicious, and cunning.',
    ability: {
      name: 'Chain Lightning',
      description: 'Releases a bolt of lightning that arcs between up to 4 enemies within range, dealing decreasing damage with each jump (100% → 70% → 50% → 35%). Enemies hit have a 25% chance to be briefly paralysed.',
      basePower: 28,
      cooldown: 7,
      effectType: 'damage'
    },
    passive: {
      name: 'Static Field',
      description: 'Enemies that melee attack the hero while the Voltfang is bonded have a 20% chance to receive a static shock, dealing minor lightning damage and interrupting their next attack.'
    },
    statProfile: { attack: 'high', defense: 'low', speed: 'high', magic: 'medium' },
    color: '#eab308',
    icon: '⚡',
    textureKey: 'creat-storm',
    autoNames: ['Zappol', 'Voltmane', 'Crackler', 'Galehorn', 'Strikis']
  },

  // ── LIGHT ─────────────────────────────────────────────────────────────────
  Light: {
    element: 'Light',
    species: 'Solstag',
    archetype: 'Radiant Celestial Stag',
    lore: 'The Solstag appears only in sacred groves where sunlight has touched the soil for a thousand consecutive years. Its antlers are living channels of solar energy, forming halos of pure radiance that ancient priests once mistook for divine messengers. In battle, a Solstag releases cleansing pulses that heal allies and scour shadow-touched corruption. They bond exclusively with heroes who carry the element of Light — or those whose deeds have been selfless.',
    ability: {
      name: 'Radiant Pulse',
      description: 'Releases an outward ring of healing light. The hero recovers 25 HP immediately, and all enemies caught in the radius are blinded for 2 seconds (50% miss chance on their next 3 attacks).',
      basePower: 25,
      cooldown: 10,
      effectType: 'heal'
    },
    passive: {
      name: 'Blessed Aura',
      description: 'While outdoors in sunlit zones with the Solstag at 50%+ bond, the hero passively regenerates 2 HP every 3 seconds. The aura also halves the duration of any Curse debuffs.'
    },
    statProfile: { attack: 'low', defense: 'medium', speed: 'high', magic: 'high' },
    color: '#fef9c3',
    icon: '✨',
    textureKey: 'creat-light',
    autoNames: ['Lumis', 'Dawnpelt', 'Glinthorn', 'Radial', 'Solbright']
  },

  // ── SHADOW ────────────────────────────────────────────────────────────────
  Shadow: {
    element: 'Shadow',
    species: 'Voidpanther',
    archetype: 'Phantom Stalker',
    lore: 'The Voidpanther exists partially outside normal space — its form flickers between the visible world and a shadow dimension only it can navigate. Hunters who have tracked one report that the animal leaves no footprints, makes no sound, and appears only when it chooses to be seen. A bonded Voidpanther extends a fragment of its phase-stepping ability to its hero, granting brief invisibility after severe injury. They are fiercely protective and utterly merciless toward threats.',
    ability: {
      name: 'Shade Pounce',
      description: 'Phases through shadow-space and reappears directly behind the targeted enemy, delivering a single devastating critical strike. The pounce always counts as a back-attack (guaranteed crit if within 4m of target).',
      basePower: 52,
      cooldown: 11,
      effectType: 'damage'
    },
    passive: {
      name: 'Shadow Cloak',
      description: 'When the hero takes damage that reduces them below 40% HP, the Voidpanther cloaks them in shadow for 1.8 seconds, making them untargetable. 45-second internal cooldown.'
    },
    statProfile: { attack: 'high', defense: 'low', speed: 'high', magic: 'medium' },
    color: '#a855f7',
    icon: '🌑',
    textureKey: 'creat-shadow',
    autoNames: ['Vexmoor', 'Duskfang', 'Shadewhisper', 'Umbriv', 'Gloomclaw']
  },

  // ── ARCANE ────────────────────────────────────────────────────────────────
  Arcane: {
    element: 'Arcane',
    species: 'Starveilvox',
    archetype: 'Cosmic Rift Fox',
    lore: 'The Starveilvox is a creature of pure arcane origin — a nine-tailed fox whose tails are streams of living stardust. It does not breathe air; it breathes ambient mana. Sages theorise that the Starveilvox predates the kingdoms themselves, drifting between ley-lines for aeons before choosing the company of mortal riders. Its eyes contain miniature galaxies, and gazing into them too long can cause visions of possible futures. They bond with intellectually curious heroes who trust in the unseen.',
    ability: {
      name: 'Arcane Rift',
      description: 'Opens a crackling dimensional vortex at the target location. The rift pulls all enemies within 3m toward its centre for 2 seconds while dealing continuous arcane damage. Enemies inside the rift deal 20% less damage.',
      basePower: 36,
      cooldown: 13,
      effectType: 'pull'
    },
    passive: {
      name: 'Mana Surge',
      description: 'Every 5 consecutive kills while the Starveilvox is bonded at 55%+ triggers a Mana Surge, restoring 10 mana to the hero and briefly boosting the creat\'s next ability power by 25%.'
    },
    statProfile: { attack: 'medium', defense: 'low', speed: 'medium', magic: 'high' },
    color: '#a5f3fc',
    icon: '🌌',
    textureKey: 'creat-arcane',
    autoNames: ['Cozmik', 'Runex', 'Phantica', 'Voidwist', 'Arcaneth']
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2: VARIANT A SPECIES (SCAFFOLD)
// ─────────────────────────────────────────────────────────────────────────────

export const CREAT_VARIANT_A_SPECIES: Record<CreatElement, CreatVariantEntry> = {
  Fire: {
    element: 'Fire',
    species: 'Pyrogryph',
    archetype: 'Ember Gryphon',
    lore: 'The Pyrogryph is a high-altitude fire beast that hunts along volcanic updrafts. It is swifter than the Emberdrake and favors dive assaults over sustained brawling.',
    ability: {
      name: 'Meteor Talon',
      description: 'A flaming dive strike that slams the target area, applying Burn and brief knockdown to nearby foes.',
      basePower: 42,
      cooldown: 10,
      effectType: 'damage'
    },
    passive: {
      name: 'Kindled Wings',
      description: 'After a critical hit, movement speed rises by 12% for 4 seconds.'
    },
    statProfile: { attack: 'high', defense: 'low', speed: 'high', magic: 'medium' },
    color: '#f97316',
    icon: '🔥',
    textureKey: 'creat-fire',
    autoNames: ['Pyraxis', 'Cindercrest', 'Flareclaw', 'Embergale', 'Scoria'],
    variantTier: 'A',
    coreSpecies: 'Emberdrake',
    unlockBond: 45,
    unlockSource: 'Volcanic Trial completion'
  },
  Water: {
    element: 'Water',
    species: 'Coralstag',
    archetype: 'Reef Antler Stag',
    lore: 'Coralstag herds appear where deep reefs meet moonlit shores. Their antlers channel restorative tides and ward off corrosion and poison.',
    ability: {
      name: 'Reef Cascade',
      description: 'Summons a spiraling wave that damages enemies and restores a portion of hero health.',
      basePower: 30,
      cooldown: 9,
      effectType: 'heal'
    },
    passive: {
      name: 'Tidal Grace',
      description: 'Incoming debuff duration reduced by 18% while bond is above 50%.'
    },
    statProfile: { attack: 'medium', defense: 'medium', speed: 'high', magic: 'high' },
    color: '#0ea5e9',
    icon: '🌊',
    textureKey: 'creat-water',
    autoNames: ['Brinehart', 'Coralyn', 'Tideroot', 'Maren', 'Pearlwake'],
    variantTier: 'A',
    coreSpecies: 'Tidewyrm',
    unlockBond: 45,
    unlockSource: 'Sunken Shrine rescue quest'
  },
  Earth: {
    element: 'Earth',
    species: 'Terragolem',
    archetype: 'Living Bastion',
    lore: 'Terragolems are forged by mountain spirits from compacted ore, roots, and memory-stone. They are less agile than Stoneboars but excel at battlefield control.',
    ability: {
      name: 'Bastion Quake',
      description: 'Slams the ground to generate a shockwave that stuns and weakens enemy armor.',
      basePower: 40,
      cooldown: 11,
      effectType: 'stun'
    },
    passive: {
      name: 'Granite Core',
      description: 'Grants flat damage reduction while stationary or guarding.'
    },
    statProfile: { attack: 'medium', defense: 'high', speed: 'low', magic: 'medium' },
    color: '#65a30d',
    icon: '🪨',
    textureKey: 'creat-earth',
    autoNames: ['Cragor', 'Mossguard', 'Stonewake', 'Basalt', 'Verdiron'],
    variantTier: 'A',
    coreSpecies: 'Stoneboar',
    unlockBond: 45,
    unlockSource: 'Ancient Quarry boss drop'
  },
  Storm: {
    element: 'Storm',
    species: 'Stormroc',
    archetype: 'Tempest Apex Bird',
    lore: 'Stormrocs nest above thunder belts where static fog blankets the cliffs. Their hunting dives trigger controlled lightning forks.',
    ability: {
      name: 'Skybreaker Dive',
      description: 'An aerial plunge that chains lightning to nearby enemies after impact.',
      basePower: 34,
      cooldown: 8,
      effectType: 'damage'
    },
    passive: {
      name: 'Tailwind Surge',
      description: 'Dash cooldown recovers 20% faster while moving continuously.'
    },
    statProfile: { attack: 'high', defense: 'low', speed: 'high', magic: 'medium' },
    color: '#facc15',
    icon: '⚡',
    textureKey: 'creat-storm',
    autoNames: ['Zephros', 'Boltcrest', 'Galeshard', 'Voltwing', 'Rimstorm'],
    variantTier: 'A',
    coreSpecies: 'Voltfang',
    unlockBond: 45,
    unlockSource: 'Sky Circuit rank reward'
  },
  Light: {
    element: 'Light',
    species: 'Dawnlion',
    archetype: 'Solar Guardian Lion',
    lore: 'Dawnlions roam temple plateaus before sunrise, carrying radiant manes that shield pilgrims from blight and fear.',
    ability: {
      name: 'Sunflare Roar',
      description: 'A radiant roar that blinds enemies and grants temporary bonus resolve to allies.',
      basePower: 27,
      cooldown: 10,
      effectType: 'buff'
    },
    passive: {
      name: 'Radiant Guard',
      description: 'When hero HP drops below 35%, grants a small absorb shield once every 45 seconds.'
    },
    statProfile: { attack: 'medium', defense: 'medium', speed: 'medium', magic: 'high' },
    color: '#fde047',
    icon: '✨',
    textureKey: 'creat-light',
    autoNames: ['Solmane', 'Aurion', 'Dawnguard', 'Heliar', 'Liora'],
    variantTier: 'A',
    coreSpecies: 'Solstag',
    unlockBond: 45,
    unlockSource: 'Sanctum purification chain'
  },
  Shadow: {
    element: 'Shadow',
    species: 'Umbraven',
    archetype: 'Void Raven Stalker',
    lore: 'Umbravens are omen birds that ride fracture-lines between worlds. They harry targets from blind angles and vanish into thin dusk.',
    ability: {
      name: 'Nightfall Spiral',
      description: 'A spiraling shadow rush that damages, silences, and marks a primary target.',
      basePower: 39,
      cooldown: 9,
      effectType: 'debuff'
    },
    passive: {
      name: 'Ebon Feathers',
      description: 'Critical hits extend stealth/invisibility effects by 0.6 seconds.'
    },
    statProfile: { attack: 'high', defense: 'low', speed: 'high', magic: 'medium' },
    color: '#7e22ce',
    icon: '🌑',
    textureKey: 'creat-shadow',
    autoNames: ['Noctis', 'Shadebeak', 'Vesper', 'Gloam', 'Morrow'],
    variantTier: 'A',
    coreSpecies: 'Voidpanther',
    unlockBond: 45,
    unlockSource: 'Night Hunt contract chain'
  },
  Arcane: {
    element: 'Arcane',
    species: 'Runeelk',
    archetype: 'Leyline Antler Sage',
    lore: 'Runeelk antlers naturally engrave and rewrite active runes as they travel ley currents, making them prized companions of scholar-riders.',
    ability: {
      name: 'Sigil Stampede',
      description: 'Charges through a rune path, dealing arcane damage and reducing enemy ability power.',
      basePower: 35,
      cooldown: 12,
      effectType: 'debuff'
    },
    passive: {
      name: 'Leyline Channel',
      description: 'Mana regeneration and cooldown recovery are improved while inside arcane zones.'
    },
    statProfile: { attack: 'medium', defense: 'medium', speed: 'medium', magic: 'high' },
    color: '#67e8f9',
    icon: '🌌',
    textureKey: 'creat-arcane',
    autoNames: ['Runebloom', 'Astrix', 'Glyphorn', 'Veilstar', 'Quillion'],
    variantTier: 'A',
    coreSpecies: 'Starveilvox',
    unlockBond: 45,
    unlockSource: 'Grand Archive trial'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the full species entry for an element string (case-insensitive).
 * Falls back to Fire if the element is unknown.
 */
export function getCreatSpecies(element: string): CreatSpeciesEntry {
  const key = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() as CreatElement;
  return CREAT_SPECIES[key] ?? CREAT_SPECIES.Fire;
}

/**
 * Returns a random auto-generated name for a given element.
 */
export function getAutoCreatName(element: string): string {
  const species = getCreatSpecies(element);
  const pool = species.autoNames;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns a random auto-name from the selected species pool.
 */
export function getAutoCreatNameForSpecies(element: string, speciesName: string): string {
  const species = getCreatSpeciesByName(element, speciesName);
  const pool = species.autoNames;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns the display label used in all UI panels.
 * Format: "Species (Element)" e.g. "Emberdrake (Fire)"
 */
export function getCreatDisplayLabel(element: string): string {
  const s = getCreatSpecies(element);
  return `${s.species} (${s.element})`;
}

/**
 * Returns a compact codex-style summary string for use in tooltips.
 */
export function getCreatCodexSummary(element: string): string {
  const s = getCreatSpecies(element);
  return `${s.icon} ${s.species} · ${s.archetype}\n⚔ ${s.ability.name}: ${s.ability.description}\n✦ ${s.passive.name}: ${s.passive.description}`;
}

/**
 * Returns the Phase 2 Variant A species for an element.
 * Fallback is Fire Variant A when unknown.
 */
export function getCreatVariantASpecies(element: string): CreatVariantEntry {
  const key = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() as CreatElement;
  return CREAT_VARIANT_A_SPECIES[key] ?? CREAT_VARIANT_A_SPECIES.Fire;
}

/**
 * Returns core + variant A species in one ordered pool for selection UIs.
 */
export function getCreatSpeciesPool(element: string): CreatSpeciesEntry[] {
  return [getCreatSpecies(element), getCreatVariantASpecies(element)];
}

/**
 * Resolve selected species by name for an element (core + variant A supported).
 */
export function getCreatSpeciesByName(element: string, speciesName: string): CreatSpeciesEntry {
  const pool = getCreatSpeciesPool(element);
  const found = pool.find((entry) => entry.species.toLowerCase() === speciesName.toLowerCase());
  return found ?? getCreatSpecies(element);
}

/**
 * Unlock logic for Variant A (works for hatch and future evolution screens).
 */
export function isCreatVariantAUnlocked(variant: CreatVariantEntry, context: CreatVariantUnlockContext): boolean {
  return (
    context.storyModeCompleted ||
    context.heroLevel >= 20 ||
    context.forestTrialsCleared >= 3 ||
    context.creatBond >= variant.unlockBond
  );
}

/**
 * Returns UI-ready species options with lock state and reason.
 */
export function getCreatSpeciesSelectionOptions(
  element: string,
  context: CreatVariantUnlockContext
): CreatSpeciesSelectionOption[] {
  const core = getCreatSpecies(element);
  const variantA = getCreatVariantASpecies(element);
  const unlocked = isCreatVariantAUnlocked(variantA, context);

  return [
    { entry: core, unlocked: true, source: 'core' },
    {
      entry: variantA,
      unlocked,
      source: 'variant-a',
      lockReason: unlocked
        ? undefined
        : `Unlock requirements: Story complete, Lv.20+, Forest Trials x3, or Bond ${variantA.unlockBond}%`
    }
  ];
}

/** All elements in display order. */
export const ALL_CREAT_ELEMENTS: CreatElement[] = [
  'Fire', 'Water', 'Earth', 'Storm', 'Light', 'Shadow', 'Arcane'
];
