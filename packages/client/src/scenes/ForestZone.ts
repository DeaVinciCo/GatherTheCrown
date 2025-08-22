import Phaser from 'phaser';
import HeroSprite from '../actors/HeroSprite';

export default class ForestZone extends Phaser.Scene {
  private seed!: number;
  private enemy!: Phaser.GameObjects.Sprite;
  private hero!: HeroSprite;

  constructor() {
    super('ForestZone');
  }

  create() {
    this.seed = Math.floor(Math.random() * 1000);
    this.add.text(10, 10, `Seed ${this.seed}`, { color: '#fff' });

    // Simple randomized enemy position
    const x = 100 + (this.seed % 600);
    const y = 100 + ((this.seed * 2) % 400);
    this.enemy = this.add.sprite(x, y, 'red');

    this.input.on('pointerdown', (p) => {
      if (Phaser.Math.Distance.Between(p.x, p.y, this.enemy.x, this.enemy.y) < 32) {
        this.enemy.destroy();
        this.scene.start('Haven');
      }
    });
    this.hero = new HeroSprite(this, 50, 50);
  }
  update(time: number, delta: number) {
    this.hero.update(time, delta);
  }
}
