import Phaser from 'phaser';

export default class ChooseBeginning extends Phaser.Scene {
  constructor() {
    super('ChooseBeginning');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x08101d, 0x0f172a, 0x111c2f, 0x07111d, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 70; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0x9ca3af,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.8),
        duration: Phaser.Math.Between(1200, 2600),
        yoyo: true,
        repeat: -1
      });
    }

    this.add.text(width / 2, 50, 'Choose Your Beginning', {
      color: '#f3f4f6',
      fontSize: '32px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 104, 'Pick the path that matches how you want to begin.', {
      color: '#94a3b8',
      fontSize: '13px',
      align: 'center'
    }).setOrigin(0.5);

    const cardY = 310;

    const forestCard = this.add.rectangle(width * 0.31, cardY, 260, 280, 0x14532d, 0.82)
      .setStrokeStyle(2, 0x22c55e, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(width * 0.31, cardY - 100, '🌲 Forest Trials', {
      color: '#86efac',
      fontSize: '24px',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(width * 0.31, cardY - 40, 'Guided elemental routes with stronger foes, structured progression, and greater early rewards.', {
      color: '#dcfce7',
      fontSize: '12px',
      align: 'center',
      wordWrap: { width: 220 }
    }).setOrigin(0.5);
    const forestBtn = this.add.rectangle(width * 0.31, cardY + 80, 200, 44, 0x22c55e, 0.22)
      .setStrokeStyle(2, 0x22c55e, 0.8)
      .setInteractive({ useHandCursor: true });
    this.add.text(width * 0.31, cardY + 80, 'Enter Forest Trials', {
      color: '#eafff1',
      fontSize: '15px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const sanctuaryCard = this.add.rectangle(width * 0.69, cardY, 260, 280, 0x12394a, 0.82)
      .setStrokeStyle(2, 0x67e8f9, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(width * 0.69, cardY - 100, '🏡 Sanctuary Path', {
      color: '#a5f3fc',
      fontSize: '24px',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(width * 0.69, cardY - 40, 'Safer exploration focused on gathering, crafting, survival, and discovering your Creat naturally.', {
      color: '#cffafe',
      fontSize: '12px',
      align: 'center',
      wordWrap: { width: 220 }
    }).setOrigin(0.5);
    const sanctuaryBtn = this.add.rectangle(width * 0.69, cardY + 80, 200, 44, 0x06b6d4, 0.22)
      .setStrokeStyle(2, 0x67e8f9, 0.8)
      .setInteractive({ useHandCursor: true });
    this.add.text(width * 0.69, cardY + 80, 'Travel to Sanctuary', {
      color: '#ecfeff',
      fontSize: '15px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const goForest = () => this.scene.start('ForestTrialsGate');
    forestCard.on('pointerdown', goForest);
    forestBtn.on('pointerdown', goForest);

    const goSanctuary = () => this.scene.start('SanctuaryHomeBase');
    sanctuaryCard.on('pointerdown', goSanctuary);
    sanctuaryBtn.on('pointerdown', goSanctuary);

    this.add.text(width / 2, height - 24, 'Choose one. You can return home from safe markers later.', {
      color: '#64748b',
      fontSize: '10px',
      align: 'center'
    }).setOrigin(0.5);
  }
}
