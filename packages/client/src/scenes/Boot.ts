import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    AudioManager.initialize();

    // Generate simple textures
    const g = this.add.graphics();
    g.fillStyle(0xff0000, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('red', 32, 32);
    g.clear();

    g.fillStyle(0x00ff00, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('green', 32, 32);
    g.destroy();
  }

  create() {
    AudioManager.playMenuTheme();
    this.scene.start('Preload');
  }
}
