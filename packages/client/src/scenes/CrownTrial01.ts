import Phaser from 'phaser';
import CutscenePlayer from '../cutscenes/CutscenePlayer';

export default class CrownTrial01 extends Phaser.Scene {
  private boss!: Phaser.GameObjects.Sprite;
  private hp = 100;

  constructor() {
    super('CrownTrial01');
  }

  create() {
    const cutscene = new CutscenePlayer(this);
    cutscene
      .play([
        { type: 'text', text: 'Crown Trial I: Ember Reignlord', duration: 1500 },
        { type: 'text', text: 'The flames await a challenger...', duration: 1500 },
      ])
      .then(() => this.startCombat());
  }

  private startCombat() {
    this.add.text(10, 10, 'Crown Trial I: Ember Reignlord', { color: '#fff' });
    this.boss = this.add.sprite(400, 300, 'green').setScale(2);

    this.input.on('pointerdown', () => {
      this.hp -= 10;
      if (this.hp <= 0) {
        this.boss.destroy();
        this.scene.start('Haven');
      }
    });
  }
}
