import Phaser from 'phaser';
import { SettingsPanel } from '../ui/SettingsPanel';

export default class MainMenu extends Phaser.Scene {
  private settingsPanel?: SettingsPanel;

  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    const stackTop = centerY - 160;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b1020, 0x111827, 0x1f2937, 0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Animated starfield
    for (let i = 0; i < 80; i++) {
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

    // Decorative crown + subtle glow accent
    const crownGlow = this.add.circle(centerX, stackTop + 6, 28, 0xfbbf24, 0.11).setDepth(1);
    this.tweens.add({
      targets: crownGlow,
      alpha: { from: 0.08, to: 0.18 },
      scale: { from: 0.95, to: 1.08 },
      duration: 1400,
      yoyo: true,
      repeat: -1
    });

    this.add.text(centerX, stackTop + 6, '♔', {
      color: '#fbbf24',
      fontSize: '48px'
    }).setOrigin(0.5).setDepth(2);

    this.add.text(centerX, stackTop + 68, 'Gather The Crown:', {
      color: '#f8e7c2',
      fontSize: '42px',
      fontStyle: 'bold',
      letterSpacing: 2,
      stroke: '#5b3c00',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(centerX, stackTop + 106, 'Creats & Foes', {
      color: '#f3f0dd',
      fontSize: '28px',
      fontStyle: 'bold',
      letterSpacing: 1,
      stroke: '#4b5563',
      strokeThickness: 1
    }).setOrigin(0.5);

    this.add.text(centerX, stackTop + 188, 'Gather supplies, face small foes, craft what you need, and begin an adventure that grows with every path you choose.', {
      color: '#94a3b8',
      fontSize: '13px',
      letterSpacing: 0.5,
      wordWrap: { width: 520 },
      align: 'center'
    }).setOrigin(0.5);

    // Single entry button
    const enterBox = this.add.rectangle(centerX, stackTop + 288, 320, 52, 0x22c55e, 0.24)
      .setStrokeStyle(2, 0x86efac, 0.9)
      .setInteractive({ useHandCursor: true });

    const enterText = this.add.text(centerX, stackTop + 288, 'Enter the Haven', {
      color: '#eafff1',
      fontSize: '24px',
      fontStyle: 'bold'
    });
    enterText.setOrigin(0.5);

    const doEnter = () => this.scene.start('HavenIntro');
    enterText.setInteractive({ useHandCursor: true });
    enterText.on('pointerdown', doEnter);
    enterBox.on('pointerdown', doEnter);
    enterBox.on('pointerover', () => enterBox.setFillStyle(0x22c55e, 0.34));
    enterBox.on('pointerout', () => enterBox.setFillStyle(0x22c55e, 0.24));

    // Settings + Guide on one row
    const buttonY = stackTop + 360;
    const settingsBox = this.add.rectangle(centerX - 88, buttonY, 164, 34, 0x1f2937, 0.5)
      .setStrokeStyle(1, 0x475569, 0.7)
      .setInteractive({ useHandCursor: true });
    const settingsText = this.add.text(centerX - 88, buttonY, '⚙ Settings', {
      color: '#94a3b8', fontSize: '15px'
    }).setOrigin(0.5);
    const doSettings = () => {
      const container = document.getElementById('game');
      if (!container) return;
      if (!this.settingsPanel) this.settingsPanel = new SettingsPanel(container);
      if (this.settingsPanel.isOpen()) { this.settingsPanel.close(); } else { this.settingsPanel.open(); }
    };
    settingsBox.on('pointerdown', doSettings);
    settingsText.setInteractive({ useHandCursor: true });
    settingsText.on('pointerdown', doSettings);
    settingsBox.on('pointerover', () => { settingsBox.setFillStyle(0x374151, 0.7); settingsText.setColor('#fbbf24'); });
    settingsBox.on('pointerout',  () => { settingsBox.setFillStyle(0x1f2937, 0.5); settingsText.setColor('#94a3b8'); });

    const guideBox = this.add.rectangle(centerX + 88, buttonY, 164, 34, 0x0f172a, 0.55)
      .setStrokeStyle(1, 0x334155, 0.75)
      .setInteractive({ useHandCursor: true });
    const guideText = this.add.text(centerX + 88, buttonY, '📘 Guide', {
      color: '#93c5fd',
      fontSize: '15px'
    }).setOrigin(0.5);
    const doGuide = () => this.scene.start('PlayerGuide');
    guideBox.on('pointerdown', doGuide);
    guideText.setInteractive({ useHandCursor: true });
    guideText.on('pointerdown', doGuide);
    guideBox.on('pointerover', () => { guideBox.setFillStyle(0x1e293b, 0.7); guideText.setColor('#dbeafe'); });
    guideBox.on('pointerout',  () => { guideBox.setFillStyle(0x0f172a, 0.55); guideText.setColor('#93c5fd'); });

    this.input.keyboard?.on('keydown-ENTER', doEnter);
    this.input.keyboard?.on('keydown-SPACE', doEnter);
    this.input.keyboard?.on('keydown-H', doGuide);

    // Creator credit
    this.add.text(centerX, height - 16, 'Game created and developed by Dea Vinci Co. · "That\'s Another Good iDeaR™!"', {
      color: '#475569',
      fontSize: '10px',
      align: 'center'
    }).setOrigin(0.5, 1);

    // Dev mode: quick route testing (press 'D')
    if (import.meta.env.DEV) {
      this.input.keyboard?.on('keydown-D', () => {
        this.scene.start('RouteTestHarness');
      });
    }
  }
}

