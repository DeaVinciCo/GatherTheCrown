/**
 * Vault System - Treasure vaults with loot and exploration
 */

import { Kingdom, KingdomElement, VaultLoot, LootItem } from '../core/Kingdom';
import * as THREE from 'three';

export interface VaultHazard {
  type: 'trap' | 'enemy' | 'environmental';
  name: string;
  damage: number;
  description: string;
}

export class Vault {
  public kingdom: Kingdom;
  public isOpen: boolean;
  public treasureCollected: boolean;
  public hazards: VaultHazard[];
  public loot: VaultLoot;
  public coinCount: number;
  public scene: THREE.Scene | null = null;

  constructor(kingdom: Kingdom) {
    this.kingdom = kingdom;
    this.isOpen = false;
    this.treasureCollected = false;
    this.hazards = this.generateHazards();
    this.loot = this.generateLoot();
    this.coinCount = Math.floor(Math.random() * 5000) + 2000; // 2000-7000 coins
  }

  /**
   * Open the vault
   */
  public open(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      console.log(`🔓 ${this.kingdom.name} vault opened!`);
      console.log(`💰 ${this.coinCount} coins scattered inside!`);
    }
  }

  /**
   * Collect treasure
   */
  public collectTreasure(): LootItem[] {
    if (this.treasureCollected) {
      console.log('⚠️ Vault already looted!');
      return [];
    }

    this.treasureCollected = true;
    const allLoot = [...this.loot.guaranteed];

    // Roll random loot
    const randomRolls = Math.floor(Math.random() * 3) + 3; // 3-5 items
    for (let i = 0; i < randomRolls; i++) {
      const randomItem = this.loot.randomPool[Math.floor(Math.random() * this.loot.randomPool.length)];
      allLoot.push(randomItem);
    }

    console.log(`👑 Collected ${allLoot.length} items from ${this.kingdom.name} vault!`);
    allLoot.forEach(item => {
      console.log(`  - ${item.name} (${item.rarity})`);
    });

    // Mark kingdom vault as cleared
    this.kingdom.clearVault();

    return allLoot;
  }

  /**
   * Collect coins (Scrooge McDuck style)
   */
  public collectCoins(amount: number): number {
    const collected = Math.min(amount, this.coinCount);
    this.coinCount -= collected;
    return collected;
  }

  /**
   * Generate hazards based on kingdom element
   */
  private generateHazards(): VaultHazard[] {
    const hazardsByElement: Record<KingdomElement, VaultHazard[]> = {
      [KingdomElement.NATURE]: [
        { type: 'environmental', name: 'Corrupted Vines', damage: 15, description: 'Thorny vines that entangle' },
        { type: 'trap', name: 'Poison Spores', damage: 20, description: 'Toxic cloud that damages over time' }
      ],
      [KingdomElement.FIRE]: [
        { type: 'environmental', name: 'Lava Pools', damage: 30, description: 'Molten lava that burns' },
        { type: 'trap', name: 'Steam Vents', damage: 25, description: 'Explosive steam bursts' }
      ],
      [KingdomElement.ICE]: [
        { type: 'environmental', name: 'Blizzard', damage: 20, description: 'Freezing winds that slow' },
        { type: 'trap', name: 'Ice Spikes', damage: 35, description: 'Sharp ice formations' }
      ],
      [KingdomElement.DESERT]: [
        { type: 'environmental', name: 'Quicksand', damage: 25, description: 'Sinking sand traps' },
        { type: 'trap', name: 'Heat Wave', damage: 20, description: 'Intense heat that drains stamina' }
      ],
      [KingdomElement.POISON]: [
        { type: 'environmental', name: 'Toxic Water', damage: 30, description: 'Poisonous swamp water' },
        { type: 'trap', name: 'Gas Pockets', damage: 40, description: 'Explosive poison gas' }
      ],
      [KingdomElement.LIGHT]: [
        { type: 'environmental', name: 'Laser Beams', damage: 35, description: 'Concentrated light beams' },
        { type: 'trap', name: 'Blinding Flash', damage: 15, description: 'Disorienting light burst' }
      ],
      [KingdomElement.SHADOW]: [
        { type: 'environmental', name: 'Void Rifts', damage: 45, description: 'Reality-tearing portals' },
        { type: 'trap', name: 'Shadow Drain', damage: 25, description: 'Darkness that drains HP' }
      ],
      [KingdomElement.UNIFIED]: [
        { type: 'environmental', name: 'Elemental Chaos', damage: 50, description: 'All elements at once' },
        { type: 'trap', name: 'Reality Distortion', damage: 40, description: 'Space-time anomalies' }
      ]
    };

    return hazardsByElement[this.kingdom.element] || [];
  }

  /**
   * Generate loot based on kingdom
   */
  private generateLoot(): VaultLoot {
    const lootByKingdom: Record<string, VaultLoot> = {
      'sylvara': {
        guaranteed: [
          {
            id: 'druids_crown',
            name: "Druid's Crown",
            type: 'armor',
            rarity: 'legendary',
            description: '+15% Nature damage, +10% healing',
            stats: { natureDamage: 15, healing: 10 }
          },
          {
            id: 'rootbound_spear',
            name: 'Rootbound Spear',
            type: 'weapon',
            rarity: 'legendary',
            description: 'Vines entangle enemies on hit',
            stats: { damage: 85, entangle: 50 }
          }
        ],
        randomPool: [
          { id: 'healing_herb', name: 'Healing Herb', type: 'consumable', rarity: 'common', description: 'Restores 50 HP' },
          { id: 'nature_essence', name: 'Nature Essence', type: 'material', rarity: 'rare', description: 'Crafting material' }
        ],
        currency: {
          name: 'Emerald Leaves',
          amount: 3,
          goldValue: 50,
          crownShardConversion: 2
        }
      },
      'pyrrathia': {
        guaranteed: [
          {
            id: 'ember_crown',
            name: 'Pyrrathian Crown of Embers',
            type: 'armor',
            rarity: 'legendary',
            description: '+20% Fire damage, immune to burn',
            stats: { fireDamage: 20, burnImmune: 1 }
          },
          {
            id: 'molten_hammer',
            name: 'Molten Warhammer',
            type: 'weapon',
            rarity: 'legendary',
            description: 'Leaves lava trails, AOE burn',
            stats: { damage: 95, aoe: 30 }
          }
        ],
        randomPool: [
          { id: 'fire_potion', name: 'Fire Resistance Potion', type: 'consumable', rarity: 'uncommon', description: '+50% fire resistance' },
          { id: 'obsidian', name: 'Obsidian Shard', type: 'material', rarity: 'rare', description: 'Volcanic crafting material' }
        ],
        currency: {
          name: 'Flame Coins',
          amount: 4,
          goldValue: 75,
          crownShardConversion: 1.5
        }
      }
    };

    return lootByKingdom[this.kingdom.id] || this.generateDefaultLoot();
  }

  /**
   * Generate default loot for kingdoms without specific loot tables
   */
  private generateDefaultLoot(): VaultLoot {
    return {
      guaranteed: [
        {
          id: 'generic_crown',
          name: 'Royal Crown',
          type: 'armor',
          rarity: 'epic',
          description: '+10% all stats',
          stats: { allStats: 10 }
        }
      ],
      randomPool: [
        { id: 'gold_coin', name: 'Gold Coin', type: 'consumable', rarity: 'common', description: 'Currency' }
      ],
      currency: {
        name: 'Crown Shards',
        amount: 1,
        goldValue: 100,
        crownShardConversion: 1
      }
    };
  }

  /**
   * Create 3D vault scene (Scrooge McDuck style treasure room)
   */
  public create3DScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Spotlight on treasure
    const spotlight = new THREE.SpotLight(this.kingdom.getColor(), 1);
    spotlight.position.set(0, 10, 0);
    spotlight.angle = Math.PI / 4;
    spotlight.penumbra = 0.5;
    scene.add(spotlight);

    // Vault floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c3e50,
      roughness: 0.8 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Treasure pile (Scrooge McDuck style)
    this.createTreasurePile(scene);

    // Vault walls
    this.createVaultWalls(scene);

    this.scene = scene;
    return scene;
  }

  /**
   * Create treasure pile with coins
   */
  private createTreasurePile(scene: THREE.Scene): void {
    const coinGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
    const coinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2
    });

    // Create pile of coins
    for (let i = 0; i < 200; i++) {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      
      // Random position in pile
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3;
      const height = Math.random() * 2;
      
      coin.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      coin.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      scene.add(coin);
    }

    // Central treasure chest
    const chestGeometry = new THREE.BoxGeometry(1, 0.8, 0.6);
    const chestMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.7
    });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.set(0, 0.4, 0);
    scene.add(chest);

    // Glowing crown on top
    const crownGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
    const crownMaterial = new THREE.MeshStandardMaterial({ 
      color: this.kingdom.getColor(),
      emissive: this.kingdom.getColor(),
      emissiveIntensity: 0.5
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.set(0, 1.5, 0);
    crown.rotation.x = Math.PI / 2;
    scene.add(crown);
  }

  /**
   * Create vault walls with kingdom theme
   */
  private createVaultWalls(scene: THREE.Scene): void {
    const wallGeometry = new THREE.BoxGeometry(20, 8, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x34495e,
      roughness: 0.9
    });

    // Four walls
    const positions = [
      { x: 0, z: -10 },
      { x: 0, z: 10 },
      { x: -10, z: 0, rotY: Math.PI / 2 },
      { x: 10, z: 0, rotY: Math.PI / 2 }
    ];

    positions.forEach(pos => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(pos.x, 4, pos.z);
      if (pos.rotY) wall.rotation.y = pos.rotY;
      scene.add(wall);
    });
  }

  /**
   * Animate treasure (coins floating, glowing)
   */
  public animateTreasure(deltaTime: number): void {
    if (!this.scene) return;

    // Rotate crown
    this.scene.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
        child.rotation.z += deltaTime * 0.5;
        
        // Pulse glow
        const material = child.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;
      }
    });
  }
}

/**
 * Vault Manager - Manages all kingdom vaults
 */
export class VaultManager {
  private vaults: Map<string, Vault> = new Map();

  /**
   * Create vault for kingdom
   */
  public createVault(kingdom: Kingdom): Vault {
    const vault = new Vault(kingdom);
    this.vaults.set(kingdom.id, vault);
    console.log(`🏛️ Created vault for ${kingdom.name}`);
    return vault;
  }

  /**
   * Get vault by kingdom ID
   */
  public getVault(kingdomId: string): Vault | undefined {
    return this.vaults.get(kingdomId);
  }

  /**
   * Get all vaults
   */
  public getAllVaults(): Vault[] {
    return Array.from(this.vaults.values());
  }

  /**
   * Get cleared vaults count
   */
  public getClearedCount(): number {
    return Array.from(this.vaults.values()).filter(v => v.treasureCollected).length;
  }
}
