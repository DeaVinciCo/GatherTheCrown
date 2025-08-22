import Phaser from 'phaser';
import { t } from '../locale/i18n';

export default class Haven extends Phaser.Scene {
  constructor() {
    super('Haven');
  }

  create() {
    const { width, height } = this.scale;
    const name = this.registry.get('heroName') || 'Hero';
    this.add.text(20, 20, `Welcome, ${name}`, { color: '#fff' });

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
