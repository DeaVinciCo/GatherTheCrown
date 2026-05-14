/**
 * Loot System - Drops, rewards, and treasure generation
 */

export enum LootSource {
  ENEMY = 'enemy',
  BOSS = 'boss',
  CHEST = 'chest',
  QUEST = 'quest',
  VAULT = 'vault',
  PVP = 'pvp',
  RACE = 'race',
  DAILY_REWARD = 'daily_reward',
  ACHIEVEMENT = 'achievement',
  CRAFTING = 'crafting'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  CREAT_EGG = 'creat_egg',
  CREAT_FOOD = 'creat_food',
  COSMETIC = 'cosmetic',
  CURRENCY = 'currency',
  QUEST_ITEM = 'quest_item'
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  stats?: Record<string, number>;
  effects?: string[];
  stackable: boolean;
  maxStack: number;
  sellValue: number;
  icon?: string;
}

export interface LootDrop {
  item: Item;
  quantity: number;
  dropChance: number; // 0-100
}

export interface LootTable {
  id: string;
  source: LootSource;
  level: number;
  guaranteed: LootDrop[];
  possible: LootDrop[];
  goldMin: number;
  goldMax: number;
  xpMin: number;
  xpMax: number;
}

export class LootSystem {
  private lootTables: Map<string, LootTable> = new Map();
  private items: Map<string, Item> = new Map();

  constructor() {
    this.initializeItems();
    this.initializeLootTables();
  }

  /**
   * Initialize all items
   */
  private initializeItems(): void {
    // WEAPONS
    this.addItem({
      id: 'basic_sword',
      name: 'Basic Sword',
      description: 'A simple iron sword',
      type: ItemType.WEAPON,
      rarity: ItemRarity.COMMON,
      level: 1,
      stats: { damage: 10, speed: 1.0 },
      stackable: false,
      maxStack: 1,
      sellValue: 50
    });

    this.addItem({
      id: 'rootbound_spear',
      name: 'Rootbound Spear',
      description: 'Vines entangle enemies on hit',
      type: ItemType.WEAPON,
      rarity: ItemRarity.LEGENDARY,
      level: 10,
      stats: { damage: 85, speed: 0.9, entangle: 50 },
      effects: ['Entangle: 50% chance to root enemy for 2s'],
      stackable: false,
      maxStack: 1,
      sellValue: 5000
    });

    this.addItem({
      id: 'molten_hammer',
      name: 'Molten Warhammer',
      description: 'Leaves lava trails, AOE burn',
      type: ItemType.WEAPON,
      rarity: ItemRarity.LEGENDARY,
      level: 20,
      stats: { damage: 95, speed: 0.7, aoe: 30 },
      effects: ['Lava Trail: Burns enemies in path', 'AOE Burn: 30 damage to nearby enemies'],
      stackable: false,
      maxStack: 1,
      sellValue: 7500
    });

    // ARMOR
    this.addItem({
      id: 'leather_saddle',
      name: 'Leather Saddle',
      description: 'Basic riding saddle',
      type: ItemType.ARMOR,
      rarity: ItemRarity.COMMON,
      level: 1,
      stats: { defense: 5, comfort: 10 },
      stackable: false,
      maxStack: 1,
      sellValue: 30
    });

    this.addItem({
      id: 'druids_crown',
      name: "Druid's Crown",
      description: '+15% Nature damage, +10% healing',
      type: ItemType.ARMOR,
      rarity: ItemRarity.LEGENDARY,
      level: 10,
      stats: { defense: 20, natureDamage: 15, healing: 10 },
      stackable: false,
      maxStack: 1,
      sellValue: 5000
    });

    // CONSUMABLES
    this.addItem({
      id: 'health_potion',
      name: 'Health Potion',
      description: 'Restores 50 HP',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.COMMON,
      level: 1,
      effects: ['Restore 50 HP instantly'],
      stackable: true,
      maxStack: 99,
      sellValue: 10
    });

    this.addItem({
      id: 'creat_food',
      name: 'Creat Food',
      description: 'Nutritious food for your creat',
      type: ItemType.CREAT_FOOD,
      rarity: ItemRarity.COMMON,
      level: 1,
      effects: ['Restore creat hunger', '+5 bond'],
      stackable: true,
      maxStack: 99,
      sellValue: 5
    });

    // MATERIALS
    this.addItem({
      id: 'iron_ore',
      name: 'Iron Ore',
      description: 'Raw iron for crafting',
      type: ItemType.MATERIAL,
      rarity: ItemRarity.COMMON,
      level: 1,
      stackable: true,
      maxStack: 999,
      sellValue: 2
    });

    this.addItem({
      id: 'emerald_leaf',
      name: 'Emerald Leaf',
      description: 'Royal currency from Sylvara',
      type: ItemType.CURRENCY,
      rarity: ItemRarity.RARE,
      level: 10,
      stackable: true,
      maxStack: 999,
      sellValue: 50
    });

    this.addItem({
      id: 'crown_shard',
      name: 'Crown Shard',
      description: 'Fragment of the legendary Crown',
      type: ItemType.CURRENCY,
      rarity: ItemRarity.LEGENDARY,
      level: 1,
      stackable: true,
      maxStack: 999,
      sellValue: 100
    });

    // CREAT EGGS
    this.addItem({
      id: 'forest_creat_egg',
      name: 'Forest Creat Egg',
      description: 'Egg of a nature-element creat',
      type: ItemType.CREAT_EGG,
      rarity: ItemRarity.RARE,
      level: 10,
      stackable: false,
      maxStack: 1,
      sellValue: 1000
    });

    this.addItem({
      id: 'fire_creat_egg',
      name: 'Fire Creat Egg',
      description: 'Egg of a fire-element creat',
      type: ItemType.CREAT_EGG,
      rarity: ItemRarity.RARE,
      level: 20,
      stackable: false,
      maxStack: 1,
      sellValue: 1500
    });

    // COSMETICS
    this.addItem({
      id: 'leaf_crown_cosmetic',
      name: 'Leaf Crown',
      description: 'Decorative crown made of leaves',
      type: ItemType.COSMETIC,
      rarity: ItemRarity.UNCOMMON,
      level: 1,
      stackable: false,
      maxStack: 1,
      sellValue: 500
    });
  }

  /**
   * Initialize loot tables
   */
  private initializeLootTables(): void {
    // COMMON ENEMY
    this.addLootTable({
      id: 'corrupted_wolf',
      source: LootSource.ENEMY,
      level: 5,
      guaranteed: [],
      possible: [
        { item: this.getItem('health_potion')!, quantity: 1, dropChance: 30 },
        { item: this.getItem('iron_ore')!, quantity: 2, dropChance: 50 },
        { item: this.getItem('creat_food')!, quantity: 1, dropChance: 20 }
      ],
      goldMin: 10,
      goldMax: 30,
      xpMin: 50,
      xpMax: 100
    });

    // BOSS - Shadow Treant (Sylvara)
    this.addLootTable({
      id: 'shadow_treant_boss',
      source: LootSource.BOSS,
      level: 10,
      guaranteed: [
        { item: this.getItem('druids_crown')!, quantity: 1, dropChance: 100 },
        { item: this.getItem('rootbound_spear')!, quantity: 1, dropChance: 100 },
        { item: this.getItem('emerald_leaf')!, quantity: 3, dropChance: 100 }
      ],
      possible: [
        { item: this.getItem('forest_creat_egg')!, quantity: 1, dropChance: 10 },
        { item: this.getItem('health_potion')!, quantity: 5, dropChance: 50 }
      ],
      goldMin: 1000,
      goldMax: 2000,
      xpMin: 5000,
      xpMax: 5000
    });

    // VAULT - Sylvara
    this.addLootTable({
      id: 'sylvara_vault',
      source: LootSource.VAULT,
      level: 10,
      guaranteed: [
        { item: this.getItem('druids_crown')!, quantity: 1, dropChance: 100 },
        { item: this.getItem('rootbound_spear')!, quantity: 1, dropChance: 100 },
        { item: this.getItem('emerald_leaf')!, quantity: 3, dropChance: 100 }
      ],
      possible: [
        { item: this.getItem('forest_creat_egg')!, quantity: 1, dropChance: 12 },
        { item: this.getItem('health_potion')!, quantity: 10, dropChance: 80 },
        { item: this.getItem('leaf_crown_cosmetic')!, quantity: 1, dropChance: 25 }
      ],
      goldMin: 2000,
      goldMax: 5000,
      xpMin: 5000,
      xpMax: 5000
    });

    // QUEST REWARD
    this.addLootTable({
      id: 'quest_main_001',
      source: LootSource.QUEST,
      level: 1,
      guaranteed: [
        { item: this.getItem('basic_sword')!, quantity: 1, dropChance: 100 },
        { item: this.getItem('leather_saddle')!, quantity: 1, dropChance: 100 }
      ],
      possible: [],
      goldMin: 100,
      goldMax: 100,
      xpMin: 500,
      xpMax: 500
    });

    // PVP VICTORY
    this.addLootTable({
      id: 'pvp_victory',
      source: LootSource.PVP,
      level: 15,
      guaranteed: [
        { item: this.getItem('crown_shard')!, quantity: 1, dropChance: 100 }
      ],
      possible: [
        { item: this.getItem('health_potion')!, quantity: 3, dropChance: 50 },
        { item: this.getItem('iron_ore')!, quantity: 5, dropChance: 30 }
      ],
      goldMin: 500,
      goldMax: 1000,
      xpMin: 1000,
      xpMax: 2000
    });

    // RACE VICTORY
    this.addLootTable({
      id: 'race_victory',
      source: LootSource.RACE,
      level: 10,
      guaranteed: [],
      possible: [
        { item: this.getItem('crown_shard')!, quantity: 1, dropChance: 25 },
        { item: this.getItem('creat_food')!, quantity: 3, dropChance: 60 }
      ],
      goldMin: 300,
      goldMax: 800,
      xpMin: 800,
      xpMax: 1500
    });

    // DAILY REWARD
    this.addLootTable({
      id: 'daily_login',
      source: LootSource.DAILY_REWARD,
      level: 1,
      guaranteed: [
        { item: this.getItem('health_potion')!, quantity: 5, dropChance: 100 },
        { item: this.getItem('creat_food')!, quantity: 10, dropChance: 100 }
      ],
      possible: [
        { item: this.getItem('crown_shard')!, quantity: 1, dropChance: 10 }
      ],
      goldMin: 100,
      goldMax: 500,
      xpMin: 0,
      xpMax: 0
    });
  }

  /**
   * Add item to system
   */
  private addItem(item: Item): void {
    this.items.set(item.id, item);
  }

  /**
   * Add loot table
   */
  private addLootTable(table: LootTable): void {
    this.lootTables.set(table.id, table);
  }

  /**
   * Get item by ID
   */
  public getItem(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get loot table by ID
   */
  public getLootTable(tableId: string): LootTable | undefined {
    return this.lootTables.get(tableId);
  }

  /**
   * Generate loot from table
   */
  public generateLoot(tableId: string): {
    items: { item: Item; quantity: number }[];
    gold: number;
    xp: number;
  } {
    const table = this.getLootTable(tableId);
    if (!table) {
      console.error(`Loot table not found: ${tableId}`);
      return { items: [], gold: 0, xp: 0 };
    }

    const items: { item: Item; quantity: number }[] = [];

    // Add guaranteed drops
    table.guaranteed.forEach(drop => {
      items.push({ item: drop.item, quantity: drop.quantity });
    });

    // Roll for possible drops
    table.possible.forEach(drop => {
      const roll = Math.random() * 100;
      if (roll <= drop.dropChance) {
        items.push({ item: drop.item, quantity: drop.quantity });
      }
    });

    // Generate gold and XP
    const gold = Math.floor(Math.random() * (table.goldMax - table.goldMin + 1)) + table.goldMin;
    const xp = Math.floor(Math.random() * (table.xpMax - table.xpMin + 1)) + table.xpMin;

    console.log(`💰 Loot Generated from ${tableId}:`);
    console.log(`  Gold: ${gold}g`);
    console.log(`  XP: ${xp}`);
    items.forEach(({ item, quantity }) => {
      console.log(`  ${item.name} x${quantity} (${item.rarity})`);
    });

    return { items, gold, xp };
  }

  /**
   * Get rarity color
   */
  public getRarityColor(rarity: ItemRarity): string {
    const colors: Record<ItemRarity, string> = {
      [ItemRarity.COMMON]: '#9e9e9e',
      [ItemRarity.UNCOMMON]: '#4caf50',
      [ItemRarity.RARE]: '#2196f3',
      [ItemRarity.EPIC]: '#9c27b0',
      [ItemRarity.LEGENDARY]: '#ff9800',
      [ItemRarity.MYTHIC]: '#f44336'
    };
    return colors[rarity];
  }

  /**
   * Get rarity multiplier for sell value
   */
  public getRarityMultiplier(rarity: ItemRarity): number {
    const multipliers: Record<ItemRarity, number> = {
      [ItemRarity.COMMON]: 1,
      [ItemRarity.UNCOMMON]: 2,
      [ItemRarity.RARE]: 5,
      [ItemRarity.EPIC]: 10,
      [ItemRarity.LEGENDARY]: 25,
      [ItemRarity.MYTHIC]: 50
    };
    return multipliers[rarity];
  }

  /**
   * Calculate item value with rarity
   */
  public calculateItemValue(item: Item): number {
    return item.sellValue * this.getRarityMultiplier(item.rarity);
  }

  /**
   * Get all items by type
   */
  public getItemsByType(type: ItemType): Item[] {
    return Array.from(this.items.values()).filter(item => item.type === type);
  }

  /**
   * Get all items by rarity
   */
  public getItemsByRarity(rarity: ItemRarity): Item[] {
    return Array.from(this.items.values()).filter(item => item.rarity === rarity);
  }

  /**
   * Get loot statistics
   */
  public getStats(): {
    totalItems: number;
    totalLootTables: number;
    itemsByType: Record<ItemType, number>;
    itemsByRarity: Record<ItemRarity, number>;
  } {
    const itemsByType: Record<ItemType, number> = {} as any;
    const itemsByRarity: Record<ItemRarity, number> = {} as any;

    Array.from(this.items.values()).forEach(item => {
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1;
      itemsByRarity[item.rarity] = (itemsByRarity[item.rarity] || 0) + 1;
    });

    return {
      totalItems: this.items.size,
      totalLootTables: this.lootTables.size,
      itemsByType,
      itemsByRarity
    };
  }
}

// Singleton instance
export const lootSystem = new LootSystem();
