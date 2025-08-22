import Phaser from 'phaser';
import { STRINGS } from '@game/shared';
import { InventoryMenu, InventoryItem } from '../ui/InventoryMenu';

export default class Haven extends Phaser.Scene {
  constructor() {
    super('Haven');
  }

  create() {
    const { width, height } = this.scale;
    const name = this.registry.get('heroName') || 'Hero';
    this.add.text(20, 20, `Welcome, ${name}`, { color: '#fff' });

    const inventoryBtn = this.add.text(width - 20, 20, 'Inventory', {
      color: '#0f0'
    }).setOrigin(1, 0);
    inventoryBtn.setInteractive();
    inventoryBtn.on('pointerdown', () => {
      const container = document.getElementById('game');
      if (!container) return;
      let items: InventoryItem[] = this.registry.get('inventory');
      if (!items) {
        items = [
          { id: 'sword', name: 'Rusty Sword', equipped: false },
          { id: 'shield', name: 'Wooden Shield', equipped: false }
        ];
        this.registry.set('inventory', items);
      }
      const menu = new InventoryMenu(items, (updated) => {
        this.registry.set('inventory', updated);
      });
      menu.attach(container);
    });

    const forest = this.add.text(width / 2, height / 2 - 40, STRINGS.menu_forest, {
      color: '#0f0'
    }).setOrigin(0.5);
    forest.setInteractive();
    forest.on('pointerdown', () => this.scene.start('ForestZone'));

    const trial = this.add.text(width / 2, height / 2, STRINGS.menu_trial, {
      color: '#0f0'
    }).setOrigin(0.5);
    trial.setInteractive();
    trial.on('pointerdown', () => this.scene.start('CrownTrial01'));

    const arena = this.add.text(width / 2, height / 2 + 40, STRINGS.menu_arena, {
      color: '#0f0'
    }).setOrigin(0.5);
    arena.setInteractive();
    arena.on('pointerdown', () => this.scene.start('BattleArena'));
  }
}
