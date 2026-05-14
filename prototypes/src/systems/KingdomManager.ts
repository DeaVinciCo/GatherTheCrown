/**
 * Kingdom Manager - Manages all 8 kingdoms and their restoration
 */

import { Kingdom, KingdomElement } from '../core/Kingdom';
import { Vault, VaultManager } from './VaultSystem';

export class KingdomManager {
  private kingdoms: Map<string, Kingdom> = new Map();
  private vaultManager: VaultManager;
  private totalRestorationProgress: number = 0;

  constructor() {
    this.vaultManager = new VaultManager();
    this.initializeKingdoms();
  }

  /**
   * Initialize all 8 kingdoms
   */
  private initializeKingdoms(): void {
    const kingdomsData = [
      {
        id: 'sylvara',
        name: 'Sylvara',
        element: KingdomElement.NATURE,
        lore: {
          description: 'A thriving woodland empire where druids lived in harmony with nature',
          downfall: 'Corrupted by Shadow cultists who poisoned the Great Rootspire',
          vaultLocation: 'Beneath the Rootspire ancient tree palace'
        }
      },
      {
        id: 'pyrrathia',
        name: 'Pyrrathia',
        element: KingdomElement.FIRE,
        lore: {
          description: 'A volcanic empire built inside an active supervolcano',
          downfall: 'Destroyed by catastrophic Water flood from neighboring kingdom',
          vaultLocation: 'Deep within the dormant volcano magma chamber'
        }
      },
      {
        id: 'frostvale',
        name: 'Frostvale',
        element: KingdomElement.ICE,
        lore: {
          description: 'A crystalline ice kingdom built on eternal glaciers',
          downfall: 'Frozen in time by Eternal Winter spell during dragon attack',
          vaultLocation: 'Top of the frozen palace, inside queen throne room'
        }
      },
      {
        id: 'zerath_dunes',
        name: 'Zerath Dunes',
        element: KingdomElement.DESERT,
        lore: {
          description: 'A golden desert empire powered by sun magic',
          downfall: 'Buried by massive sandstorms after water drought',
          vaultLocation: 'Deep beneath the buried Pyramid of the Sun King'
        }
      },
      {
        id: 'morgahl_fen',
        name: "Mor'gahl Fen",
        element: KingdomElement.POISON,
        lore: {
          description: 'A mysterious swamp civilization that mastered poison alchemy',
          downfall: 'Poison disaster followed by Light Kingdom purge',
          vaultLocation: 'Sunken Palace beneath the toxic swamp'
        }
      },
      {
        id: 'luminaris',
        name: 'Luminaris',
        element: KingdomElement.LIGHT,
        lore: {
          description: 'A radiant kingdom built from enchanted crystals',
          downfall: 'Shattered by massive light explosion during Shadow invasion',
          vaultLocation: 'Highest fragment of the floating Shardspire'
        }
      },
      {
        id: 'umbral_reach',
        name: 'Umbral Reach',
        element: KingdomElement.SHADOW,
        lore: {
          description: 'A dark kingdom built in eternal twilight',
          downfall: 'Pulled into void dimension during Light Kingdom holy war',
          vaultLocation: 'Deep in underground abyss, phasing between dimensions'
        }
      },
      {
        id: 'crown_convergence',
        name: 'Crown Convergence',
        element: KingdomElement.UNIFIED,
        lore: {
          description: 'The original kingdom where the Crown was forged',
          downfall: 'Torn apart when all seven kingdoms attacked simultaneously',
          vaultLocation: 'Scattered across floating sky islands'
        }
      }
    ];

    kingdomsData.forEach(data => {
      const kingdom = new Kingdom(data.id, data.name, data.element, data.lore);
      this.kingdoms.set(data.id, kingdom);
      
      // Create vault for each kingdom
      this.vaultManager.createVault(kingdom);
    });

    console.log('🏰 Initialized 8 kingdoms');
  }

  /**
   * Get kingdom by ID
   */
  public getKingdom(kingdomId: string): Kingdom | undefined {
    return this.kingdoms.get(kingdomId);
  }

  /**
   * Get all kingdoms
   */
  public getAllKingdoms(): Kingdom[] {
    return Array.from(this.kingdoms.values());
  }

  /**
   * Get kingdoms by status
   */
  public getKingdomsByStatus(status: string): Kingdom[] {
    return this.getAllKingdoms().filter(k => k.status === status);
  }

  /**
   * Get vault for kingdom
   */
  public getVault(kingdomId: string): Vault | undefined {
    return this.vaultManager.getVault(kingdomId);
  }

  /**
   * Discover kingdom
   */
  public discoverKingdom(kingdomId: string): void {
    const kingdom = this.getKingdom(kingdomId);
    if (kingdom) {
      kingdom.discover();
      this.updateTotalProgress();
    }
  }

  /**
   * Clear kingdom vault
   */
  public clearVault(kingdomId: string): void {
    const kingdom = this.getKingdom(kingdomId);
    const vault = this.getVault(kingdomId);
    
    if (kingdom && vault) {
      vault.open();
      const loot = vault.collectTreasure();
      kingdom.clearVault();
      this.updateTotalProgress();
      
      console.log(`👑 ${kingdom.name} vault cleared! Collected ${loot.length} items`);
    }
  }

  /**
   * Restore kingdom
   */
  public restoreKingdom(kingdomId: string, amount: number): void {
    const kingdom = this.getKingdom(kingdomId);
    if (kingdom) {
      kingdom.restore(amount);
      this.updateTotalProgress();
    }
  }

  /**
   * Update total restoration progress
   */
  private updateTotalProgress(): void {
    const kingdoms = this.getAllKingdoms();
    const totalProgress = kingdoms.reduce((sum, k) => sum + k.restorationProgress, 0);
    this.totalRestorationProgress = totalProgress / kingdoms.length;
    
    console.log(`🌍 Total restoration progress: ${this.totalRestorationProgress.toFixed(1)}%`);
  }

  /**
   * Get total restoration progress
   */
  public getTotalProgress(): number {
    return this.totalRestorationProgress;
  }

  /**
   * Get discovered kingdoms count
   */
  public getDiscoveredCount(): number {
    return this.getAllKingdoms().filter(k => k.isAccessible()).length;
  }

  /**
   * Get cleared vaults count
   */
  public getClearedVaultsCount(): number {
    return this.vaultManager.getClearedCount();
  }

  /**
   * Get restored kingdoms count
   */
  public getRestoredCount(): number {
    return this.getKingdomsByStatus('restored').length;
  }

  /**
   * Check if all kingdoms are restored
   */
  public isAllRestored(): boolean {
    return this.getRestoredCount() === 8;
  }

  /**
   * Get next kingdom to discover (based on difficulty)
   */
  public getNextKingdom(): Kingdom | undefined {
    const order = [
      'sylvara',
      'pyrrathia',
      'frostvale',
      'zerath_dunes',
      'morgahl_fen',
      'luminaris',
      'umbral_reach',
      'crown_convergence'
    ];

    for (const id of order) {
      const kingdom = this.getKingdom(id);
      if (kingdom && !kingdom.isAccessible()) {
        return kingdom;
      }
    }

    return undefined;
  }

  /**
   * Get kingdom statistics
   */
  public getStats(): {
    total: number;
    discovered: number;
    vaultsCleared: number;
    restored: number;
    progress: number;
  } {
    return {
      total: 8,
      discovered: this.getDiscoveredCount(),
      vaultsCleared: this.getClearedVaultsCount(),
      restored: this.getRestoredCount(),
      progress: this.totalRestorationProgress
    };
  }

  /**
   * Play kingdom cutscene
   */
  public playCutscene(kingdomId: string): void {
    const kingdom = this.getKingdom(kingdomId);
    if (kingdom && !kingdom.cutsceneWatched) {
      console.log(`🎬 Playing ${kingdom.name} cutscene...`);
      console.log(`📖 ${kingdom.lore.description}`);
      console.log(`💔 Downfall: ${kingdom.lore.downfall}`);
      console.log(`🏛️ Vault: ${kingdom.lore.vaultLocation}`);
      
      kingdom.watchCutscene();
      
      // Bonus for watching cutscene
      console.log('🎁 Cutscene bonus: +500 XP, +100g');
    }
  }

  /**
   * Get kingdom by element
   */
  public getKingdomByElement(element: KingdomElement): Kingdom | undefined {
    return this.getAllKingdoms().find(k => k.element === element);
  }

  /**
   * Check if Crown Convergence is unlocked
   */
  public isCrownConvergenceUnlocked(): boolean {
    // Crown Convergence unlocks after clearing all 7 other kingdoms
    return this.getClearedVaultsCount() >= 7;
  }
}

// Singleton instance
export const kingdomManager = new KingdomManager();
