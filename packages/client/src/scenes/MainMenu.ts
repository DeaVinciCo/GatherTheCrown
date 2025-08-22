import Phaser from 'phaser';
import { STRINGS } from '@game/shared';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 40, STRINGS.title, { color: '#fff' }).setOrigin(0.5);

    const start = this.add.text(width / 2, height / 2 + 20, STRINGS.menu_start, {
      color: '#0f0'
    });
    start.setOrigin(0.5);
    start.setInteractive();
    start.on('pointerdown', () => this.scene.start('ForgeHero'));
  }
}
