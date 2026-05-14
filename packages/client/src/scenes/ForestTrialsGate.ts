import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { assessHeroCreatNeeds } from '../systems/HeroCreatNeedsTracker';

export default class ForestTrialsGate extends Phaser.Scene {
  constructor() {
    super('ForestTrialsGate');
  }

  create() {
    const { width, height } = this.scale;
    gameRegistry.loadFromLocalStorage();
    gameRegistry.setForestTrialsStarted(true);
    this.registry.set('forestTrialsStarted', true);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x07111d, 0x0f172a, 0x172033, 0x08111f, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 44, 'Forest Trials', {
      color: '#fde68a',
      fontSize: '30px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 82, 'Choose a guided trial route for faster combat growth, then return home to prep before your next push.', {
      color: '#cbd5e1',
      fontSize: '12px',
      align: 'center',
      wordWrap: { width: 620 }
    }).setOrigin(0.5);

    const needs = assessHeroCreatNeeds(
      this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
      'quest'
    );
    const needsColor = needs.missingCritical.length === 0 ? '#86efac' : '#fde68a';
    const needsLine = needs.missingCritical.length === 0
      ? `Readiness ${needs.readinessScore}% · All critical prep checks passed.`
      : `Readiness ${needs.readinessScore}% · Missing critical: ${needs.missingCritical.map((c) => c.label).join(', ')}`;
    this.add.text(width / 2, 114, needsLine, {
      color: needsColor,
      fontSize: '10px',
      align: 'center',
      wordWrap: { width: 680 },
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const routes = [
      {
        id: 'gentle',
        title: 'Gentle Trail',
        color: 0x14532d,
        stroke: 0x22c55e,
        textColor: '#86efac',
        summary: 'Best for learning movement, pickups, healing, and basic combat.',
        detail: 'Low pressure entry. Clear guidance, light enemy density, and the safest route to begin building confidence.',
        eta: '8-10 min',
        enemyCount: '3 foes',
        rewardTier: 'More food / starter supplies'
      },
      {
        id: 'rider',
        title: 'Rider\'s Path',
        color: 0x1e3a8a,
        stroke: 0x3b82f6,
        textColor: '#93c5fd',
        summary: 'Balanced danger and reward. The intended route for most riders.',
        detail: 'A fuller challenge with more pressure, more resource flow, and stronger preparation for bond and home-base systems.',
        eta: '12-15 min',
        enemyCount: '5 foes',
        rewardTier: 'Balanced loot / crafting mats'
      },
      {
        id: 'sovereign',
        title: 'Sovereign Thicket',
        color: 0x4a044e,
        stroke: 0xa855f7,
        textColor: '#d8b4fe',
        summary: 'Hardest route. Greater pressure, sharper resource decisions, and less forgiveness.',
        detail: 'For players who want to push early. Expect denser threats and a steeper climb through advanced trials.',
        eta: '16-20 min',
        enemyCount: '7 foes',
        rewardTier: 'High-value materials / risk-reward'
      }
    ];

    routes.forEach((route, index) => {
      const x = 160 + index * 240;
      const y = 300;
      const card = this.add.rectangle(x, y, 210, 270, route.color, 0.72)
        .setStrokeStyle(2, route.stroke, 0.95)
        .setInteractive({ useHandCursor: true });
      this.add.text(x, y - 104, route.title, {
        color: route.textColor,
        fontSize: '20px',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(x, y - 58, route.summary, {
        color: '#e2e8f0',
        fontSize: '12px',
        align: 'center',
        wordWrap: { width: 176 }
      }).setOrigin(0.5);
      this.add.text(x, y + 18, route.detail, {
        color: '#94a3b8',
        fontSize: '11px',
        align: 'center',
        wordWrap: { width: 176 }
      }).setOrigin(0.5);
      this.add.text(x, y + 80, `ETA: ${route.eta}  |  ${route.enemyCount}`, {
        color: '#e5e7eb',
        fontSize: '10px',
        align: 'center'
      }).setOrigin(0.5);
      this.add.text(x, y + 98, route.rewardTier, {
        color: '#cbd5e1',
        fontSize: '10px',
        align: 'center'
      }).setOrigin(0.5);
      this.add.text(x, y + 120, 'Enter Trial', {
        color: '#f8fafc',
        fontSize: '14px',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      card.on('pointerdown', () => {
        this.registry.set('lastQuestNeedsReadiness', needs.readinessScore);
        this.registry.set('knownArena', true);
        this.registry.set('forestTrialRouteId', route.id);
        this.registry.set('forestTrialDifficulty', route.title);
        this.scene.start('ForestZone');
      });
      card.on('pointerover', () => card.setAlpha(0.95));
      card.on('pointerout', () => card.setAlpha(0.82));
    });

    this.add.text(width / 2, height - 56, 'Flow: Trial sign -> fork into 3 routes -> gather/fight by route pressure -> paths merge near finish -> Creat Egg -> merged trail to Sanctuary Isle.', {
      color: '#94a3b8',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: 680 }
    }).setOrigin(0.5);

    const backBtn = this.add.text(width / 2, height - 24, '← Return to Haven', {
      color: '#cbd5e1',
      fontSize: '14px',
      backgroundColor: '#111827'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('HavenGrounds'));
  }
}
