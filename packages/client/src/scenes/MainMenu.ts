import Phaser from 'phaser';
import AchievementPanel, { Achievement } from '../ui/AchievementPanel';
import { t } from '../locale/i18n';

export default class MainMenu extends Phaser.Scene {
  private achievementPanel?: AchievementPanel;

  constructor() {
    super('MainMenu');
  }

  create() {
    console.log('MainMenu scene created');
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 40, t('title'), { color: '#fff' }).setOrigin(0.5);

    const start = this.add.text(width / 2, height / 2 + 20, t('menu_start'), {
      color: '#0f0',
      fontSize: '32px'
    });
    start.setOrigin(0.5);
    start.setInteractive({ useHandCursor: true });
    
    start.on('pointerdown', () => {
      console.log('Start Game clicked!');
      this.scene.start('ForgeHero');
    });
    
    start.on('pointerover', () => {
      start.setScale(1.2);
    });
    
    start.on('pointerout', () => {
      start.setScale(1);
    });

    const gameContainer = document.getElementById('game');
    if (gameContainer) {
      const sample: Achievement[] = [
        { id: 'first-step', title: 'First Steps', description: 'Begin your journey', completed: true },
        { id: 'first-win', title: 'First Victory', description: 'Win a battle', completed: false }
      ];
      this.achievementPanel = new AchievementPanel(sample);
      this.achievementPanel.attach(gameContainer);

      const achievementsBtn = this.add.text(width / 2, height / 2 + 60, 'Achievements', {
        color: '#0f0',
        fontSize: '32px'
      });
      achievementsBtn.setOrigin(0.5);
      achievementsBtn.setInteractive({ useHandCursor: true });
      achievementsBtn.on('pointerdown', () => {
        console.log('Achievements clicked!');
        this.achievementPanel?.show();
      });
    }

    this.events.once(Phaser.Core.Events.SHUTDOWN, () => {
      this.achievementPanel?.hide();
    });
    
    console.log('MainMenu input system ready');
  }
}
