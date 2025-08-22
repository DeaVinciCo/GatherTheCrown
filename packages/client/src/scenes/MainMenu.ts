import Phaser from 'phaser';
import { STRINGS } from '@game/shared';
import AchievementPanel, { Achievement } from '../ui/AchievementPanel';

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

    const gameContainer = document.getElementById('game');
    if (gameContainer) {
      const sample: Achievement[] = [
        { id: 'first-step', title: 'First Steps', description: 'Begin your journey', completed: true },
        { id: 'first-win', title: 'First Victory', description: 'Win a battle', completed: false }
      ];
      const panel = new AchievementPanel(sample);
      panel.attach(gameContainer);

      const achievementsBtn = this.add.text(width / 2, height / 2 + 60, 'Achievements', {
        color: '#0f0'
      });
      achievementsBtn.setOrigin(0.5);
      achievementsBtn.setInteractive();
      achievementsBtn.on('pointerdown', () => panel.show());
    }
  }
}
