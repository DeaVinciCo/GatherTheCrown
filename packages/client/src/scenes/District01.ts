import Phaser from 'phaser';

export default class District01 extends Phaser.Scene {
  constructor() {
    super('District01');
  }

  create() {
    this.add.text(10, 10, 'District 01 - Stub', { color: '#fff' });
  }
}
