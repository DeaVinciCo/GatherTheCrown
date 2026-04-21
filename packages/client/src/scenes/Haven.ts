import Phaser from 'phaser';
import { InventoryMenu, InventoryItem } from '../ui/InventoryMenu';
import { t } from '../locale/i18n';

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'sword', name: 'Rusty Sword', equipped: false },
  { id: 'shield', name: 'Wooden Shield', equipped: false }
];

export default class Haven extends Phaser.Scene {
  constructor() {
    super('Haven');
  }

  private getInventory(): InventoryItem[] {
    let items: InventoryItem[] = this.registry.get('inventory');
    if (!items) {
      items = DEFAULT_INVENTORY.map((i) => ({ ...i }));
      this.registry.set('inventory', items);
    }
    return items;
  }

  private openInventoryMenu(): void {
    const container = document.getElementById('game');
    if (!container) return;
    const items = this.getInventory();
    const menu = new InventoryMenu(items, {
      onClose: (updated) => {
        this.registry.set('inventory', updated);
      }
    });
    menu.attach(container);
  }

  create() {
    const { width, height } = this.scale;
    const name = this.registry.get('heroName') || 'Hero';
    this.add.text(20, 20, `Welcome, ${name}`, { color: '#fff' });

    const inventoryBtn = this.add.text(width - 20, 20, 'Inventory', {
      color: '#0f0'
    }).setOrigin(1, 0);
    inventoryBtn.setInteractive();
    inventoryBtn.on('pointerdown', () => this.openInventoryMenu());

    const forest = this.add.text(width / 2, height / 2 - 40, t('menu_forest'), {
      color: '#0f0'
    }).setOrigin(0.5);
    forest.setInteractive();
    forest.on('pointerdown', () => this.scene.start('ForestZone'));

    const trial = this.add.text(width / 2, height / 2, t('menu_trial'), {
      color: '#0f0'
    }).setOrigin(0.5);
    trial.setInteractive();
    trial.on('pointerdown', () => this.scene.start('CrownTrial01'));

    const arena = this.add.text(width / 2, height / 2 + 40, t('menu_arena'), {
      color: '#0f0'
    }).setOrigin(0.5);
    arena.setInteractive();
    arena.on('pointerdown', () => this.scene.start('BattleArena'));
  }
}
