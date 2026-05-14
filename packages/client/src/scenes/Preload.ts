import Phaser from 'phaser';
import { loadLanguage } from '../locale/i18n';
import { gameRegistry } from '../registry/GameRegistry';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const userSetting = localStorage.getItem('lang');
    const browserLang = navigator.language;
    loadLanguage(userSetting || browserLang);

    // Load existing registry from localStorage
    gameRegistry.loadFromLocalStorage();
    this.registry.merge({
      gold: gameRegistry.gold,
      soulshards: gameRegistry.soulshards,
      greenGems: gameRegistry.greenGems,
      redGems: gameRegistry.redGems,
      emberFruit: gameRegistry.emberFruit,
      crownFragments: gameRegistry.crownFragments,
      inventory: gameRegistry.inventory,
      creatInventory: gameRegistry.creatInventory,
      currentUserId: gameRegistry.currentUserId,
      currentUsername: gameRegistry.currentUsername,
      havenUnlocked: gameRegistry.havenUnlocked,
      forestTrialsStarted: gameRegistry.forestTrialsStarted,
      homeBaseUnlocked: gameRegistry.homeBaseUnlocked,
      kingdomArcUnlocked: gameRegistry.kingdomArcUnlocked,
      homeBaseName: gameRegistry.homeBaseName,
      homeBaseRegionName: gameRegistry.homeBaseRegionName,
      homeBaseNameOptions: gameRegistry.homeBaseNameOptions,
      homeBaseRestDays: gameRegistry.homeBaseRestDays,
      homeBaseStoryReady: gameRegistry.homeBaseStoryReady,
      homeBaseDay1Inspected: gameRegistry.homeBaseDay1Inspected,
      homeBaseDay1SuppliesGathered: gameRegistry.homeBaseDay1SuppliesGathered,
      homeBaseDay2Crafted: gameRegistry.homeBaseDay2Crafted,
      homeBaseDay2EggCared: gameRegistry.homeBaseDay2EggCared,
      heroName: gameRegistry.heroName,
      heroGender: gameRegistry.heroGender,
      heroClass: gameRegistry.heroClass,
      heroElement: gameRegistry.heroElement,
      heroRace: gameRegistry.heroRace,
      heroSkinTone: gameRegistry.heroSkinTone,
      heroHairStyle: gameRegistry.heroHairStyle,
      heroHairColor: gameRegistry.heroHairColor,
      heroOriginTrait: gameRegistry.heroOriginTrait,
      heroCombatDoctrine: gameRegistry.heroCombatDoctrine,
      heroTattoo: gameRegistry.heroTattoo,
      hasCreatEgg: gameRegistry.hasCreatEgg,
      hasHatchedCreat: gameRegistry.hasHatchedCreat,
      creatBond: gameRegistry.creatBond,
      creatElement: gameRegistry.creatElement,
      creatName: gameRegistry.creatName,
      creatSpecies: gameRegistry.creatSpecies,
      creatCompatibility: gameRegistry.creatCompatibility,
      heroLevel: gameRegistry.heroLevel,
      storyModeCompleted: gameRegistry.storyModeCompleted
    });

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xfbbf24, 1);
      progressBar.fillRect(width / 4, height / 2 + 40, (width / 2) * value, 12);
    });
  }

  create() {
    const { width, height } = this.scale;

    // ── Splash screen background ─────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b0a1e, 0x1a0f3f, 0x0f172a, 0x06090f, 1);
    bg.fillRect(0, 0, width, height);

    // Starfield
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(0.5, 2),
        0x9ca3af,
        Phaser.Math.FloatBetween(0.2, 0.9)
      );
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.8),
        duration: Phaser.Math.Between(1200, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    // Title with glow effect
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x7c3aed, 0.2);
    titleBg.fillRoundedRect(width / 2 - 180, height / 2 - 80, 360, 100, 12);
    titleBg.setDepth(1);

    const title = this.add.text(width / 2, height / 2 - 30, 'GATHER THE CROWN', {
      color: '#fef9c3',
      fontSize: '42px',
      fontStyle: 'bold',
      letterSpacing: 3,
      stroke: '#7c3aed',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(2);

    const subtitle = this.add.text(width / 2, height / 2 + 18, 'Rise, Rider. The Crown Awaits.', {
      color: '#c4b5fd',
      fontSize: '16px',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(2);

    // Animate title in
    this.tweens.add({
      targets: title,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.8, to: 1 },
      duration: 800,
      ease: 'Power2.out'
    });

    this.tweens.add({
      targets: subtitle,
      alpha: { from: 0, to: 1 },
      duration: 1200,
      ease: 'Power2.out'
    });

    // Loading text and hint
    const loadingText = this.add.text(width / 2, height / 2 + 100, 'Preparing Haven routes...', {
      color: '#94a3b8',
      fontSize: '12px'
    }).setOrigin(0.5).setDepth(2);

    // Fade in and transition to MainMenu after a brief delay
    this.time.delayedCall(2800, () => {
      this.tweens.add({
        targets: [bg, title, subtitle, loadingText],
        alpha: 0,
        duration: 600,
        onComplete: () => {
          this.scene.start('MainMenu');
        }
      });
    });
  }
}
