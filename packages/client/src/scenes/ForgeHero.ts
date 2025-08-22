import Phaser from 'phaser';

export default class ForgeHero extends Phaser.Scene {
  private nameInput!: HTMLInputElement;

  constructor() {
    super('ForgeHero');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 80, 'Name Your Hero', { color: '#fff' }).setOrigin(0.5);

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Hero name';
    this.add.dom(width / 2, height / 2, this.nameInput);

    const confirm = this.add.text(width / 2, height / 2 + 40, 'Confirm', { color: '#0f0' }).setOrigin(0.5);
    confirm.setInteractive();
    confirm.on('pointerdown', () => {
      const name = this.nameInput.value || 'Hero';
      this.registry.set('heroName', name);
      this.scene.start('Haven');
    });
  }
}
