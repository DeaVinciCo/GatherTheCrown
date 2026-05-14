/**
 * Master Item Catalog
 * Canonical source for ALL items in the game: pickups, loot, shop, crafting, starters, keys, etc.
 * Every item reference must use an ID from this catalog.
 */

export type ItemCategory = 'weapon' | 'armor' | 'clothing' | 'creat-armor' | 'riding-gear' | 'potion' | 'food' | 'material' | 'key' | 'quest-item';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type KeyType = 'hero-quest' | 'folk-quest' | 'royal-quest';
export type KeyAccessChannel = 'door' | 'portal';

export interface MasterItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackable: boolean;
  usableBy: 'hero' | 'creat' | 'both';
  sellValue: number;
  description: string;
  tags: string[];
  keyType?: KeyType; // only for keys
  keyAccessChannel?: KeyAccessChannel; // only for keys
}

export interface InventoryEntry {
  id: string;
  name: string;
  equipped?: boolean;
}

/**
 * Complete Master Item Table
 * Organized by category for clarity, but referenced by ID in code
 */
export const MASTER_ITEM_CATALOG: MasterItem[] = [
  // ── WEAPONS (Hero) ────────────────────────────────────────
  { id: 'weapon-iron-sword', name: 'Iron Sword', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 40, description: 'A sturdy steel blade. Reliable and balanced.', tags: ['starter', 'melee', 'sword'] },
  { id: 'weapon-ash-bow', name: 'Ash Bow', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 35, description: 'A graceful bow made from ashwood. Quick and precise.', tags: ['starter', 'ranged', 'bow'] },
  { id: 'weapon-ember-staff', name: 'Ember Staff', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 38, description: 'A fire-charged staff. Crackles with potential.', tags: ['starter', 'magic', 'staff', 'fire'] },

  // ── OFFHAND / SHIELDS ────────────────────────────────────
  { id: 'offhand-tower-shield', name: 'Tower Shield', category: 'armor', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 50, description: 'A large protective shield. Absorbs impacts well.', tags: ['starter', 'shield', 'defense'] },
  { id: 'offhand-moon-spear', name: 'Moon Spear', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 45, description: 'A pale spear under moonlight. Elegant and sharp.', tags: ['starter', 'polearm'] },
  { id: 'offhand-trail-knife', name: 'Trail Knife', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 30, description: 'A quick offhand blade. Useful for finishing.', tags: ['starter', 'knife'] },
  { id: 'offhand-focus-orb', name: 'Focus Orb', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 32, description: 'An arcane focus. Channels spell power.', tags: ['starter', 'focus', 'magic'] },
  { id: 'offhand-twin-chakrams', name: 'Twin Chakrams', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 42, description: 'Twin spinning blades. High skill, high reward.', tags: ['starter', 'dual'] },
  { id: 'offhand-warhammer', name: 'Warhammer', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 55, description: 'A heavy two-handed hammer. Crushes barriers.', tags: ['starter', 'heavy', 'hammer'] },
  { id: 'offhand-rune-tome', name: 'Rune Tome', category: 'weapon', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 38, description: 'An ancient tome of runes. Glows faintly.', tags: ['starter', 'tome', 'magic'] },

  // ── ARMOR (Hero) ──────────────────────────────────────────
  { id: 'armor-fireguard-vest', name: 'Fireguard Vest', category: 'armor', rarity: 'uncommon', stackable: false, usableBy: 'hero', sellValue: 120, description: 'Fireproof leather armor. Grants fire resistance.', tags: ['armor', 'fire', 'defense'] },

  // ── CREAT ARMOR ───────────────────────────────────────────
  { id: 'creat-armor-ash-barding', name: 'Ash Barding', category: 'creat-armor', rarity: 'uncommon', stackable: false, usableBy: 'creat', sellValue: 105, description: 'Protective barding for a creat companion. Resilient.', tags: ['creat-armor', 'defense'] },

  // ── RIDING GEAR ───────────────────────────────────────────
  { id: 'gear-storm-saddle', name: 'Storm Saddle', category: 'riding-gear', rarity: 'uncommon', stackable: false, usableBy: 'creat', sellValue: 150, description: 'A swift saddle charged with storm energy. Grants speed.', tags: ['riding-gear', 'speed', 'storm'] },

  // ── POTIONS ───────────────────────────────────────────────
  { id: 'potion-heal-standard', name: 'Standard Healing Potion', category: 'potion', rarity: 'common', stackable: true, usableBy: 'hero', sellValue: 25, description: 'Restores moderate health. Warm and bitter.', tags: ['consumable', 'healing', 'potion'] },

  // ── FOOD & PROVISIONS ─────────────────────────────────────
  { id: 'food-ember-fruit', name: 'Ember Fruit', category: 'food', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 14, description: 'A warm golden fruit. Restores vitality and creat hunger.', tags: ['consumable', 'food', 'creat-food'] },
  { id: 'food-haven-ration', name: 'Haven Ration', category: 'food', rarity: 'common', stackable: true, usableBy: 'hero', sellValue: 12, description: 'A packed meal from Haven. Sustaining and quick.', tags: ['consumable', 'food', 'quest-start'] },
  { id: 'food-healing-ration', name: 'Healing Ration', category: 'food', rarity: 'common', stackable: true, usableBy: 'hero', sellValue: 10, description: 'Dried food with mild restorative herbs. Basic and effective.', tags: ['consumable', 'food'] },
  { id: 'food-river-fish', name: 'River Fish', category: 'food', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 9, description: 'Fresh catch from Haven waters. Useful for food and simple prep.', tags: ['consumable', 'food', 'fishing'] },

  // ── CRAFTING MATERIALS ────────────────────────────────────
  { id: 'mat-fiber-bundle', name: 'Fiber Bundle', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 8, description: 'Bundled plant fibers. Used in many recipes.', tags: ['material', 'crafting', 'forest'] },
  { id: 'mat-essence-earth', name: 'Earth Essence', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 20, description: 'Concentrated earth element. Grounds spells and defenses.', tags: ['material', 'essence', 'earth', 'crafting'] },
  { id: 'mat-essence-fire', name: 'Fire Essence', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 22, description: 'Concentrated fire element. Burns bright and hot.', tags: ['material', 'essence', 'fire', 'crafting', 'volcano'] },
  { id: 'mat-essence-storm', name: 'Storm Essence', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 25, description: 'Concentrated storm element. Crackles with energy.', tags: ['material', 'essence', 'storm', 'crafting'] },
  { id: 'mat-essence-arcane', name: 'Arcane Essence', category: 'material', rarity: 'rare', stackable: true, usableBy: 'both', sellValue: 35, description: 'Pure arcane power. Rare and valuable.', tags: ['material', 'essence', 'arcane', 'crafting', 'shop'] },
  { id: 'mat-iron-ore', name: 'Iron Ore', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 12, description: 'Raw iron ore. Smeltable into bars.', tags: ['material', 'ore', 'crafting', 'volcano'] },
  { id: 'mat-leather-strip', name: 'Leather Strip', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 10, description: 'Treated leather strips. Useful for binding and armor.', tags: ['material', 'leather', 'crafting'] },
  { id: 'mat-shock-crystal', name: 'Shock Crystal', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 18, description: 'A crystalline shard that hums with electricity.', tags: ['material', 'crystal', 'storm', 'crafting', 'race'] },
  { id: 'mat-herb-common', name: 'Common Herb', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 6, description: 'A simple medicinal herb. Used in basic potions.', tags: ['material', 'herb', 'crafting', 'alchemy'] },
  { id: 'mat-water-clean', name: 'Clean Water', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 4, description: 'Pure fresh water. Essential for many recipes.', tags: ['material', 'water', 'crafting', 'alchemy'] },
  { id: 'mat-reed-root', name: 'Reed Root', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 7, description: 'A marsh root used in light binding and starter tonics.', tags: ['material', 'fishing', 'crafting'] },
  { id: 'mat-drift-scale', name: 'Drift Scale', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 12, description: 'A smooth scale carried by river currents. Flexible and strong.', tags: ['material', 'fishing', 'crafting'] },
  { id: 'mat-hide-fiber', name: 'Hide Fiber', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 8, description: 'Fine shed fibers gathered from lure stations.', tags: ['material', 'trap', 'creat-care', 'crafting'] },
  { id: 'mat-fur-tuft', name: 'Fur Tuft', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 8, description: 'Soft fur left behind by roaming wildlife.', tags: ['material', 'trap', 'crafting'] },
  { id: 'mat-scale-flake', name: 'Scale Flake', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 9, description: 'A small shed scale suitable for light reinforcement.', tags: ['material', 'trap', 'crafting'] },
  { id: 'mat-feather-tuft', name: 'Feather Tuft', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 7, description: 'A collected feather tuft used in padding and fletching.', tags: ['material', 'trap', 'crafting'] },
  { id: 'mat-timber', name: 'Timber', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 6, description: 'Solid wood harvested from intentional forestry nodes.', tags: ['material', 'forestry', 'crafting'] },
  { id: 'mat-tree-bark', name: 'Tree Bark', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 5, description: 'Harvested bark useful for wraps, fuel, and early crafting.', tags: ['material', 'forestry', 'crafting'] },
  { id: 'mat-tree-resin', name: 'Tree Resin', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 11, description: 'Sticky resin for binders, sealants, and alchemy bases.', tags: ['material', 'forestry', 'alchemy', 'crafting'] },
  { id: 'mat-sap', name: 'Sap', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 6, description: 'Fresh sap gathered from living trees. Basic craft reagent.', tags: ['material', 'forestry', 'crafting'] },
  { id: 'mat-crown-alloy-chunk', name: 'Crown Alloy Chunk', category: 'material', rarity: 'epic', stackable: true, usableBy: 'both', sellValue: 150, description: 'A chunk of the legendary crown metal. Incredibly valuable.', tags: ['material', 'crown', 'boss', 'rare', 'crafting'] },
  { id: 'mat-mythic-scale', name: 'Mythic Scale', category: 'material', rarity: 'epic', stackable: true, usableBy: 'both', sellValue: 120, description: 'A scale from a legendary beast. Shimmers with power.', tags: ['material', 'scale', 'boss', 'rare', 'crafting'] },
  { id: 'mat-ancient-sigil-plate', name: 'Ancient Sigil Plate', category: 'material', rarity: 'epic', stackable: true, usableBy: 'both', sellValue: 130, description: 'An inscribed plate from ancient ruins. Radiates mystery.', tags: ['material', 'sigil', 'boss', 'rare', 'crafting'] },

  // ── CURRENCY & GEMS ───────────────────────────────────────
  // Note: These are tracked separately in registry, not as inventory items
  // Included here for reference and documentation
  { id: 'currency-green-gem', name: 'Green Gem', category: 'material', rarity: 'common', stackable: true, usableBy: 'both', sellValue: 5, description: 'A small green gemstone. Worth gold at any merchant.', tags: ['currency', 'gem', 'quest-reward'] },
  { id: 'currency-red-gem', name: 'Red Gem', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 12, description: 'A fiery red gemstone. Valuable for trades.', tags: ['currency', 'gem', 'volcano', 'fire'] },
  { id: 'currency-soulshard', name: 'Soulshard', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 15, description: 'A crystallized fragment of spirit. Used at the Crown Forge.', tags: ['currency', 'shard', 'crafting', 'crown'] },
  { id: 'currency-fire-shard', name: 'Fire Shard', category: 'material', rarity: 'uncommon', stackable: true, usableBy: 'both', sellValue: 14, description: 'A shard of pure fire essence. Useful at crafting stations.', tags: ['currency', 'shard', 'fire', 'volcano'] },

  // ── CLOTHING & OUTERWEAR ───────────────────────────────────
  { id: 'clothing-travelers-coat', name: 'Traveler\'s Coat', category: 'clothing', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 35, description: 'A weathered coat perfect for long journeys. Practical and warm.', tags: ['clothing', 'coat', 'weather-gear'] },
  { id: 'clothing-forest-hood', name: 'Forest Hood', category: 'clothing', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 28, description: 'A green hood for forest exploration. Blends into foliage.', tags: ['clothing', 'hood', 'forest'] },
  { id: 'clothing-silk-scarf', name: 'Silk Scarf', category: 'clothing', rarity: 'uncommon', stackable: false, usableBy: 'hero', sellValue: 42, description: 'A fine silk scarf with flowing edges. Elegant and functional.', tags: ['clothing', 'scarf', 'cosmetic'] },
  { id: 'clothing-royal-vestments', name: 'Royal Vestments', category: 'clothing', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 180, description: 'Ornate royal garments fit for a crowned champion. Marks your legacy.', tags: ['clothing', 'cosmetic-outfit', 'crown', 'royal'] },

  // ── KEYS (Quest Progression) ──────────────────────────────
  { id: 'key-hero-quest', name: 'Bronze Hero Key', category: 'key', rarity: 'common', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Unlocks the Hero\'s personal quests and story progression. Bronze-colored and warm to touch.', tags: ['key', 'hero-quest', 'starter', 'quest-item'], keyType: 'hero-quest', keyAccessChannel: 'door' },
  { id: 'key-folk-quest', name: 'Silver Folk Key', category: 'key', rarity: 'uncommon', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Unlocks quests for kingdom folk and NPCs. Silver-colored with intricate designs.', tags: ['key', 'folk-quest', 'quest-item'], keyType: 'folk-quest', keyAccessChannel: 'door' },
  { id: 'key-royal-quest', name: 'Gold Royal Key', category: 'key', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Unlocks royal vaults, castle secrets, and major kingdom quests. Gleams with noble power.', tags: ['key', 'royal-quest', 'quest-item'], keyType: 'royal-quest', keyAccessChannel: 'portal' },
  { id: 'key-folk-aldermarch', name: 'Aldermarch Folk Key', category: 'key', rarity: 'uncommon', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Issued by recovered district owners in Aldermarch. Opens local homes and trade floors.', tags: ['key', 'folk-quest', 'aldermarch', 'quest-item'], keyType: 'folk-quest', keyAccessChannel: 'door' },
  { id: 'key-folk-stormrage', name: 'Stormrage Folk Key', category: 'key', rarity: 'uncommon', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Recovered from reclaimed holdings in Stormrage. Opens local trade and service structures.', tags: ['key', 'folk-quest', 'stormrage', 'quest-item'], keyType: 'folk-quest', keyAccessChannel: 'door' },
  { id: 'key-folk-vastmalaise', name: 'Vastmalaise Folk Key', category: 'key', rarity: 'uncommon', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Granted by structure owners in Vastmalaise to reopen sealed civic sites.', tags: ['key', 'folk-quest', 'vastmalaise', 'quest-item'], keyType: 'folk-quest', keyAccessChannel: 'door' },
  { id: 'key-folk-sunward', name: 'Sunward Folk Key', category: 'key', rarity: 'uncommon', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Sunward district key used to unlock trade lanes and support houses.', tags: ['key', 'folk-quest', 'sunward', 'quest-item'], keyType: 'folk-quest', keyAccessChannel: 'door' },
  { id: 'key-royal-root-crown', name: 'Root-Crown Key', category: 'key', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Royal key of Aldermarch, entrusted by Warden-Matriarch Elsin Thorne.', tags: ['key', 'royal-quest', 'aldermarch', 'quest-item'], keyType: 'royal-quest', keyAccessChannel: 'portal' },
  { id: 'key-royal-skybolt-crown', name: 'Skybolt Crown Key', category: 'key', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Royal key of Stormrage, entrusted by Castellan Roarke Flint.', tags: ['key', 'royal-quest', 'stormrage', 'quest-item'], keyType: 'royal-quest', keyAccessChannel: 'portal' },
  { id: 'key-royal-mireglass-crown', name: 'Mireglass Crown Key', category: 'key', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Royal key of Vastmalaise, entrusted by Archivist-Marshal Ithra Vonn.', tags: ['key', 'royal-quest', 'vastmalaise', 'quest-item'], keyType: 'royal-quest', keyAccessChannel: 'portal' },
  { id: 'key-royal-dawnfire-crown', name: 'Dawnfire Crown Key', category: 'key', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'Royal key of Sunward, co-granted by Captain-Keys Ammon Rheel and Princess Nadira Solthane.', tags: ['key', 'royal-quest', 'sunward', 'quest-item'], keyType: 'royal-quest', keyAccessChannel: 'portal' },

  // ── QUEST ITEMS ───────────────────────────────────────────
  { id: 'quest-sigil-greenbell', name: 'Gate Sigil of Greenbell', category: 'quest-item', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'District sigil proving Aldermarch gate clearance.', tags: ['quest-item', 'sigil', 'aldermarch', 'gate-unlock'] },
  { id: 'quest-sigil-raincut', name: 'Gate Sigil of Raincut', category: 'quest-item', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'District sigil proving Stormrage gate clearance.', tags: ['quest-item', 'sigil', 'stormrage', 'gate-unlock'] },
  { id: 'quest-sigil-duskgate', name: 'Gate Sigil of Duskgate', category: 'quest-item', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'District sigil proving Vastmalaise gate clearance.', tags: ['quest-item', 'sigil', 'vastmalaise', 'gate-unlock'] },
  { id: 'quest-sigil-duneward', name: 'Gate Sigil of Duneward', category: 'quest-item', rarity: 'rare', stackable: false, usableBy: 'hero', sellValue: 0, description: 'District sigil proving Sunward gate clearance.', tags: ['quest-item', 'sigil', 'sunward', 'gate-unlock'] }
];

/**
 * Lookup helper: find item by ID
 */
export function getItemById(id: string): MasterItem | undefined {
  return MASTER_ITEM_CATALOG.find(item => item.id === id);
}

export function getCatalogBaseId(itemId: string): string {
  const direct = getItemById(itemId);
  if (direct) return itemId;

  const match = MASTER_ITEM_CATALOG.find((entry) => itemId === entry.id || itemId.startsWith(`${entry.id}-`));
  return match?.id ?? itemId;
}

/**
 * Lookup helper: find items by tag
 */
export function getItemsByTag(tag: string): MasterItem[] {
  return MASTER_ITEM_CATALOG.filter(item => item.tags.includes(tag));
}

export function createInventoryEntry(itemId: string, suffix?: string): InventoryEntry {
  const item = getItemById(itemId);
  const safeName = item?.name ?? itemId;
  const unique = suffix ?? `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return {
    id: `${itemId}-${unique}`,
    name: safeName,
    equipped: false
  };
}

export function createInventoryEntries(itemId: string, quantity: number): InventoryEntry[] {
  return Array.from({ length: Math.max(0, quantity) }, (_, index) => createInventoryEntry(itemId, `${Date.now()}-${index}`));
}

/**
 * Unified Starter Loadout for all heroes (Option C)
 * All heroes get the same base items; element affects boosts later, not inventory
 */
export const UNIVERSAL_STARTER_LOADOUT: string[] = [
  'weapon-iron-sword',
  'offhand-tower-shield',
  'potion-heal-standard',
  'food-haven-ration',
  'key-hero-quest'
];

/**
 * Early game drop pool for Forest Trials and Haven
 * Food, water, herbs, fiber, leather, basic shards/gems, light gold
 */
export const EARLY_GAME_DROPS: string[] = [
  'food-ember-fruit',
  'food-haven-ration',
  'mat-water-clean',
  'mat-herb-common',
  'mat-fiber-bundle',
  'mat-leather-strip',
  'currency-green-gem',
  'currency-soulshard'
];
