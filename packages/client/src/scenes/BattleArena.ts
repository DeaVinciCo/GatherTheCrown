import Phaser from 'phaser';

export default class BattleArena extends Phaser.Scene {
  constructor() {
    super('BattleArena');
  }

  create() {
    this.add.text(10, 10, 'Battle Arena - 1v1', { color: '#fff' });
  }
}
