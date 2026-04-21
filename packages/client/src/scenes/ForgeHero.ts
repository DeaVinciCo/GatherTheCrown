import Phaser from 'phaser';

export default class ForgeHero extends Phaser.Scene {
  private nameInput!: HTMLInputElement;

  constructor() {
    super('ForgeHero');
  }

  create() {
    console.log('ForgeHero scene created');
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 80, 'Name Your Hero', { color: '#fff', fontSize: '32px' }).setOrigin(0.5);

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Hero name';
    this.nameInput.style.fontSize = '20px';
    this.nameInput.style.padding = '10px';
    this.add.dom(width / 2, height / 2, this.nameInput);

    const confirm = this.add.text(width / 2, height / 2 + 60, 'Confirm (Enter)', { 
      color: '#0f0',
      fontSize: '32px'
    }).setOrigin(0.5);
    
    confirm.setInteractive({ useHandCursor: true });
    confirm.on('pointerdown', () => this.proceedWithName());
    confirm.on('pointerover', () => confirm.setScale(1.2));
    confirm.on('pointerout', () => confirm.setScale(1));

    // Add keyboard support for Enter
    this.input.keyboard?.on('keydown-ENTER', () => {
      console.log('Enter pressed');
      this.proceedWithName();
    });

    // Focus the input
    setTimeout(() => {
      this.nameInput.focus();
    }, 100);

    console.log('ForgeHero ready - type name and press Enter or click Confirm');
  }

  private proceedWithName() {
    const name = this.nameInput.value || 'Hero';
    console.log(`Hero named: ${name}`);
    this.registry.set('heroName', name);
    this.scene.start('Haven');
  }
}
