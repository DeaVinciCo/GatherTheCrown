/**
 * Kingdom System - Fallen kingdoms with vaults and restoration
 */

export enum KingdomElement {
  NATURE = 'nature',
  FIRE = 'fire',
  ICE = 'ice',
  DESERT = 'desert',
  POISON = 'poison',
  LIGHT = 'light',
  SHADOW = 'shadow',
  UNIFIED = 'unified'
}

export enum KingdomStatus {
  FALLEN = 'fallen',
  DISCOVERED = 'discovered',
  VAULT_CLEARED = 'vault_cleared',
  RESTORING = 'restoring',
  RESTORED = 'restored'
}

export interface RoyalCurrency {
  name: string;
  amount: number;
  goldValue: number;
  crownShardConversion: number;
}

export interface VaultLoot {
  guaranteed: LootItem[];
  randomPool: LootItem[];
  currency: RoyalCurrency;
}

export interface LootItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'cosmetic' | 'creat_egg';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  description: string;
  stats?: Record<string, number>;
}

export class Kingdom {
  public id: string;
  public name: string;
  public element: KingdomElement;
  public status: KingdomStatus;
  public restorationProgress: number; // 0-100
  public vaultCleared: boolean;
  public cutsceneWatched: boolean;
  public lore: {
    description: string;
    downfall: string;
    vaultLocation: string;
  };

  constructor(
    id: string,
    name: string,
    element: KingdomElement,
    lore: { description: string; downfall: string; vaultLocation: string }
  ) {
    this.id = id;
    this.name = name;
    this.element = element;
    this.status = KingdomStatus.FALLEN;
    this.restorationProgress = 0;
    this.vaultCleared = false;
    this.cutsceneWatched = false;
    this.lore = lore;
  }

  /**
   * Discover the kingdom
   */
  public discover(): void {
    if (this.status === KingdomStatus.FALLEN) {
      this.status = KingdomStatus.DISCOVERED;
      console.log(`🏰 Discovered ${this.name}!`);
    }
  }

  /**
   * Clear the vault
   */
  public clearVault(): void {
    if (!this.vaultCleared) {
      this.vaultCleared = true;
      this.status = KingdomStatus.VAULT_CLEARED;
      this.restorationProgress = 33;
      console.log(`👑 ${this.name} vault cleared!`);
    }
  }

  /**
   * Increase restoration progress
   */
  public restore(amount: number): void {
    this.restorationProgress = Math.min(100, this.restorationProgress + amount);
    
    if (this.restorationProgress >= 100 && this.status !== KingdomStatus.RESTORED) {
      this.status = KingdomStatus.RESTORED;
      console.log(`✨ ${this.name} fully restored!`);
    } else if (this.restorationProgress > 0) {
      this.status = KingdomStatus.RESTORING;
    }
  }

  /**
   * Watch the kingdom's cutscene
   */
  public watchCutscene(): void {
    this.cutsceneWatched = true;
    console.log(`🎬 Watched ${this.name} cutscene`);
  }

  /**
   * Get kingdom color based on element
   */
  public getColor(): string {
    const colors: Record<KingdomElement, string> = {
      [KingdomElement.NATURE]: '#2ecc71',
      [KingdomElement.FIRE]: '#e74c3c',
      [KingdomElement.ICE]: '#3498db',
      [KingdomElement.DESERT]: '#f39c12',
      [KingdomElement.POISON]: '#9b59b6',
      [KingdomElement.LIGHT]: '#ecf0f1',
      [KingdomElement.SHADOW]: '#34495e',
      [KingdomElement.UNIFIED]: '#ffffff'
    };
    return colors[this.element];
  }

  /**
   * Check if kingdom is accessible
   */
  public isAccessible(): boolean {
    return this.status !== KingdomStatus.FALLEN;
  }

  /**
   * Get restoration status text
   */
  public getStatusText(): string {
    switch (this.status) {
      case KingdomStatus.FALLEN:
        return 'Fallen - Not yet discovered';
      case KingdomStatus.DISCOVERED:
        return 'Discovered - Vault awaits';
      case KingdomStatus.VAULT_CLEARED:
        return `Restoring - ${this.restorationProgress}%`;
      case KingdomStatus.RESTORING:
        return `Restoring - ${this.restorationProgress}%`;
      case KingdomStatus.RESTORED:
        return 'Fully Restored';
      default:
        return 'Unknown';
    }
  }
}
