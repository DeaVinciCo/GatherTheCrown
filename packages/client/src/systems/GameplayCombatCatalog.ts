import type { CreatElement } from './CreatSpecies';

export interface ElementCombatProfile {
  heroAttackChains: string[]; // target: 3
  heroSignaturePowers: string[]; // target: 4
  heroUtilityAbilities: string[]; // target: 6
  heroSpells: string[];
  heroWeapons: string[];
  heroFightingStyle: string;
  creatCoreAttacks: string[]; // target: 3
  creatPowers: string[]; // target: 4
  creatAbilities: string[]; // target: 6
  potionNeeds: string[];
}

export interface HeroCreatComboEntry {
  element: CreatElement;
  heroPower: string;
  creatPower: string;
  comboName: string;
  comboEffect: string;
}

export interface EconomyCatalog {
  heroArmorSlots: string[];
  creatArmorSlots: string[];
  ridingGearSlots: string[];
  craftMatsField: string[];
  craftMatsEnemyDrops: string[];
  craftMatsBoss: string[];
  vendorSellCategories: string[];
  playerTradePriorities: string[];
}

export const ELEMENT_COMBAT_CATALOG: Record<CreatElement, ElementCombatProfile> = {
  Fire: {
    heroAttackChains: ['Ash Jab -> Flame Hook -> Cinder Uppercut', 'Ember Slash -> Dash Cross -> Burn Finisher', 'Vault Kick -> Flame Spin -> Ground Slam'],
    heroSignaturePowers: ['Phoenix Lunge', 'Magma Breaker', 'Burning Guard', 'Infernal Rally'],
    heroUtilityAbilities: ['Heat Vision', 'Burn Extend', 'Counter Flame', 'Rage Conversion', 'Armor Melt', 'Finisher Window'],
    heroSpells: ['Flame Wall', 'Cinder Rain', 'Phoenix Rush'],
    heroWeapons: ['Emberblade', 'Magma Spear', 'Cinder Gauntlets'],
    heroFightingStyle: 'Aggressive pressure brawler',
    creatCoreAttacks: ['Ember Claw', 'Cinder Bite', 'Flame Lash'],
    creatPowers: ['Scorch Burst', 'Molten Roar', 'Searing Flight', 'Inferno Ward'],
    creatAbilities: ['Burn Stack', 'Heat Shield', 'Lava Step', 'Threat Roar', 'Ash Veil', 'Last Ember'],
    potionNeeds: ['Healing Potion', 'Stamina Potion', 'Fireguard Elixir', 'Bond Tonic']
  },
  Water: {
    heroAttackChains: ['Flow Palm -> Tidal Sweep -> Undertow Throw', 'Spear Jab -> Spiral Cut -> Mist Break', 'Slide Kick -> Backstep Lash -> Ripple Strike'],
    heroSignaturePowers: ['Maelstrom Guard', 'Torrent Pierce', 'Healing Current', 'Mirror Wave'],
    heroUtilityAbilities: ['Status Cleanse', 'Cooldown Chill', 'Slow Field', 'Reposition Dash', 'Resource Regen', 'Ally Shield'],
    heroSpells: ['Healing Tide', 'Riptide Pull', 'Ice Mist'],
    heroWeapons: ['Tide Trident', 'Reef Sabre', 'Flow Staff'],
    heroFightingStyle: 'Control and sustain duelist',
    creatCoreAttacks: ['Tidal Fang', 'Fin Slash', 'Jet Ram'],
    creatPowers: ['Hydro Surge', 'Undertow Pull', 'Mist Screen', 'Current Shell'],
    creatAbilities: ['Soak Stack', 'Cleanse Pulse', 'Wave Dash', 'Mana Rinse', 'Healing Mist', 'Deep Focus'],
    potionNeeds: ['Healing Potion', 'Mana Potion', 'Tideskin Tonic', 'Recovery Salve']
  },
  Earth: {
    heroAttackChains: ['Hammer Bash -> Shoulder Ram -> Quake Drop', 'Shield Hook -> Tusk Thrust -> Crag Split', 'Grab Break -> Wall Pin -> Boulder Ender'],
    heroSignaturePowers: ['Stone Bastion', 'Faultline Slam', 'Rooted Guard', 'Titan Advance'],
    heroUtilityAbilities: ['Poise Gain', 'Knockback Immune', 'Taunt Field', 'Armor Spike', 'Crowd Brace', 'Last Stand'],
    heroSpells: ['Stone Skin', 'Quake Ring', 'Root Prison'],
    heroWeapons: ['Granite Hammer', 'Root Halberd', 'Obsidian Shield Axe'],
    heroFightingStyle: 'Fortress bruiser',
    creatCoreAttacks: ['Tusk Gore', 'Boulder Slam', 'Root Kick'],
    creatPowers: ['Tremor Charge', 'Quake Burst', 'Ironhide Guard', 'Briar Crush'],
    creatAbilities: ['Armor Up', 'Stagger Resist', 'Ground Anchor', 'Root Snare', 'Weight Shift', 'Bastion Call'],
    potionNeeds: ['Defense Brew', 'Earthroot Brew', 'Healing Potion', 'Stress Calm Drops']
  },
  Storm: {
    heroAttackChains: ['Dash Cut -> Volt Kick -> Sky Pierce', 'Twin Slash -> Flicker Step -> Arc Burst', 'Air Launch -> Cross Dive -> Thunder End'],
    heroSignaturePowers: ['Lightning Rush', 'Storm Cage', 'Gale Counter', 'Tempest Drive'],
    heroUtilityAbilities: ['Speed Surge', 'Cast Interrupt', 'Crit Window', 'Mobility Reset', 'Shock Spread', 'Chase Mark'],
    heroSpells: ['Chain Bolt', 'Wind Step', 'Tempest Cage'],
    heroWeapons: ['Volt Chakrams', 'Tempest Rapier', 'Thunder Pike'],
    heroFightingStyle: 'High-speed skirmisher',
    creatCoreAttacks: ['Volt Bite', 'Spark Pounce', 'Gale Swipe'],
    creatPowers: ['Chain Lightning', 'Tempest Leap', 'Cyclone Fang', 'Static Wall'],
    creatAbilities: ['Shock Stack', 'Arc Jump', 'Evasion Surge', 'Storm Trace', 'Disrupt Cast', 'Overcharge'],
    potionNeeds: ['Speed Tonic', 'Stormcharge Vial', 'Stamina Potion', 'Bond Tonic']
  },
  Light: {
    heroAttackChains: ['Halo Slash -> Radiant Palm -> Dawn Rise', 'Guard Parry -> Light Thrust -> Purge Hit', 'Beam Kick -> Cross Guard -> Mercy End'],
    heroSignaturePowers: ['Solar Aegis', 'Lumen Strike', 'Sanctuary Ring', 'Daybreak Lance'],
    heroUtilityAbilities: ['Cleanse', 'Heal Pulse', 'Resolve Buff', 'Anti-Fear', 'Team Ward', 'Revive Spark'],
    heroSpells: ['Purify Burst', 'Beacon Ward', 'Sun Lance'],
    heroWeapons: ['Dawnblade', 'Halo Mace', 'Solar Bow'],
    heroFightingStyle: 'Support paladin duelist',
    creatCoreAttacks: ['Radiant Horn', 'Dawn Kick', 'Halo Sweep'],
    creatPowers: ['Radiant Pulse', 'Sunbeam Arc', 'Blessing Circle', 'Beacon Rush'],
    creatAbilities: ['Blind Stack', 'Purify', 'Regeneration Aura', 'Ward Sigil', 'Resolve Gain', 'Grace Reprieve'],
    potionNeeds: ['Lightward Serum', 'Healing Potion', 'Mana Potion', 'Recovery Salve']
  },
  Shadow: {
    heroAttackChains: ['Veil Jab -> Backstab Slice -> Dread End', 'Dash Feint -> Low Cut -> Reaper Cross', 'Blind Kick -> Shadow Hook -> Ambush Drop'],
    heroSignaturePowers: ['Midnight Step', 'Dread Veil', 'Silence Brand', 'Execution Arc'],
    heroUtilityAbilities: ['Cloak', 'Fear Pulse', 'Damage Amp Mark', 'Escape Blink', 'Enemy Debuff Strip', 'Critical Chain'],
    heroSpells: ['Fear Shroud', 'Veil Step', 'Soul Rend'],
    heroWeapons: ['Umbral Daggers', 'Dusk Scythe', 'Night Bow'],
    heroFightingStyle: 'Assassin control',
    creatCoreAttacks: ['Shade Rake', 'Void Fang', 'Nightstep Strike'],
    creatPowers: ['Shade Pounce', 'Eclipse Claw', 'Terror Pulse', 'Umbral Gate'],
    creatAbilities: ['Fear Stack', 'Crit Ambush', 'Phase Step', 'Silence Bite', 'Veil Escape', 'Hunter Mark'],
    potionNeeds: ['Shadowveil Draught', 'Stamina Potion', 'Antidote Potion', 'Stress Calm Drops']
  },
  Arcane: {
    heroAttackChains: ['Sigil Slash -> Rune Burst -> Rift Knockback', 'Staff Jab -> Arc Spiral -> Comet Cast', 'Warp Dash -> Focus Hit -> Prism End'],
    heroSignaturePowers: ['Aether Lance', 'Chrono Lock', 'Arc Well', 'Nova Script'],
    heroUtilityAbilities: ['Mana Flux', 'Cooldown Shift', 'Teleport Step', 'Spell Mirror', 'Debuff Convert', 'Surge Channel'],
    heroSpells: ['Mana Rift', 'Prism Nova', 'Time Slip'],
    heroWeapons: ['Rune Staff', 'Star Glaive', 'Prism Wand'],
    heroFightingStyle: 'Tactical battlemage',
    creatCoreAttacks: ['Rift Swipe', 'Star Bolt', 'Comet Tail'],
    creatPowers: ['Arcane Rift', 'Prism Barrage', 'Gravity Knot', 'Ethereal Nova'],
    creatAbilities: ['Mana Siphon', 'Spell Weave', 'Cooldown Shift', 'Warp Step', 'Arc Field', 'Fate Twist'],
    potionNeeds: ['Arcanefocus Phial', 'Mana Potion', 'Healing Potion', 'Bond Tonic']
  }
};

// Hero and Creat attacks that merge/complement in combat.
export const HERO_CREAT_COMBO_CATALOG: HeroCreatComboEntry[] = [
  {
    element: 'Fire',
    heroPower: 'Phoenix Lunge',
    creatPower: 'Scorch Burst',
    comboName: 'Phoenix Scorch Chain',
    comboEffect: 'Hero dash ignites target; creat cone consumes burn stacks for burst AoE.'
  },
  {
    element: 'Water',
    heroPower: 'Torrent Pierce',
    creatPower: 'Hydro Surge',
    comboName: 'Undertow Lance',
    comboEffect: 'Hero pierce applies Soak; creat surge pulls and locks soaked targets.'
  },
  {
    element: 'Earth',
    heroPower: 'Stone Bastion',
    creatPower: 'Tremor Charge',
    comboName: 'Bastion Breaker',
    comboEffect: 'Hero fortifies then creat charge shatters staggered enemies for bonus armor break.'
  },
  {
    element: 'Storm',
    heroPower: 'Lightning Rush',
    creatPower: 'Chain Lightning',
    comboName: 'Tempest Relay',
    comboEffect: 'Hero rush tags primary target; creat chain starts from tag and gains one extra jump.'
  },
  {
    element: 'Light',
    heroPower: 'Sanctuary Ring',
    creatPower: 'Radiant Pulse',
    comboName: 'Sanctified Resonance',
    comboEffect: 'Pulse from inside Sanctuary doubles cleanse output and grants short team shield.'
  },
  {
    element: 'Shadow',
    heroPower: 'Midnight Step',
    creatPower: 'Shade Pounce',
    comboName: 'Eclipse Ambush',
    comboEffect: 'Hero marks from stealth; creat pounce consumes mark for guaranteed critical fear strike.'
  },
  {
    element: 'Arcane',
    heroPower: 'Chrono Lock',
    creatPower: 'Arcane Rift',
    comboName: 'Paradox Well',
    comboEffect: 'Chrono lock freezes target drift while rift ticks faster and refunds partial cooldown.'
  }
];

export const GAMEPLAY_ECONOMY_CATALOG: EconomyCatalog = {
  heroArmorSlots: ['Head', 'Chest', 'Arms', 'Legs', 'Feet', 'Cloak'],
  creatArmorSlots: ['Headguard', 'Chest Barding', 'Leg Plates', 'Tail Guard', 'Collar Focus'],
  ridingGearSlots: ['Element Saddle', 'Rein Harness', 'Saddle Bags', 'Trail Bedroll Kit', 'Crest Banner', 'Shock Absorber Stirrups'],
  craftMatsField: ['Fiber Bundle', 'Iron Ore', 'Ember Resin', 'Tide Pearl Dust', 'Root Sap', 'Storm Crystal Shard', 'Lumen Pollen', 'Night Veil Thread', 'Arcane Ink'],
  craftMatsEnemyDrops: ['Fang Fragment', 'Hide Scraps', 'Bone Splinter', 'Corrupted Core', 'Element Essence'],
  craftMatsBoss: ['Crown Alloy Chunk', 'Mythic Scale', 'Ancient Sigil Plate'],
  vendorSellCategories: ['Common mats', 'Unused weapons', 'Duplicate armor', 'Extra consumables'],
  playerTradePriorities: ['Rare element essences', 'Saddle and barding upgrades', 'High-rarity potions', 'Crafting catalysts']
};

export function getElementCombatProfile(element: string): ElementCombatProfile {
  const key = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() as CreatElement;
  return ELEMENT_COMBAT_CATALOG[key] ?? ELEMENT_COMBAT_CATALOG.Fire;
}

export function getHeroCreatCombo(element: string): HeroCreatComboEntry {
  const key = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() as CreatElement;
  return HERO_CREAT_COMBO_CATALOG.find((entry) => entry.element === key) ?? HERO_CREAT_COMBO_CATALOG[0];
}
