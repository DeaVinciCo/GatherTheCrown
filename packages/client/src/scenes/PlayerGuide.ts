import Phaser from 'phaser';
import { SANCTUARY_ISLE_NOTES } from '../data/SanctuaryIsleNotes';

interface GuidePage {
  title: string;
  body: string;
}

export default class PlayerGuide extends Phaser.Scene {
  private pages: GuidePage[] = [];
  private pageIndex = 0;
  private pageTitle?: Phaser.GameObjects.Text;
  private pageBody?: Phaser.GameObjects.Text;
  private pageFooter?: Phaser.GameObjects.Text;

  constructor() {
    super('PlayerGuide');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1022, 0x111827, 0x10253d, 0x0b1220, 1);
    bg.fillRect(0, 0, width, height);

    const panel = this.add.rectangle(width / 2, height / 2, width - 64, height - 72, 0x020617, 0.9)
      .setStrokeStyle(2, 0x334155, 1);

    this.add.text(panel.x, 52, 'Guide', {
      color: '#f8fafc',
      fontSize: '34px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(panel.x, 86, 'Quick in-game codex for controls, progression, and Sanctuary life.', {
      color: '#94a3b8',
      fontSize: '12px',
      align: 'center'
    }).setOrigin(0.5);

    this.pageTitle = this.add.text(70, 122, '', {
      color: '#fde68a',
      fontSize: '23px',
      fontStyle: 'bold'
    });

    this.pageBody = this.add.text(70, 164, '', {
      color: '#e2e8f0',
      fontSize: '13px',
      lineSpacing: 7,
      wordWrap: { width: width - 140 }
    });

    this.pageFooter = this.add.text(width / 2, height - 70, '', {
      color: '#93c5fd',
      fontSize: '11px',
      align: 'center'
    }).setOrigin(0.5);

    const backButton = this.add.rectangle(width / 2 - 124, height - 36, 210, 34, 0x1e293b, 0.95)
      .setStrokeStyle(1, 0x64748b, 0.9)
      .setInteractive({ useHandCursor: true });
    const backLabel = this.add.text(width / 2 - 124, height - 36, 'Back to Menu', {
      color: '#e2e8f0',
      fontSize: '14px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const startButton = this.add.rectangle(width / 2 + 124, height - 36, 210, 34, 0x166534, 0.95)
      .setStrokeStyle(1, 0x22c55e, 0.9)
      .setInteractive({ useHandCursor: true });
    const startLabel = this.add.text(width / 2 + 124, height - 36, 'Start Journey', {
      color: '#ecfdf5',
      fontSize: '14px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const goBack = () => this.scene.start('MainMenu');
    const goStart = () => this.scene.start('HavenIntro');
    backButton.on('pointerdown', goBack);
    backLabel.setInteractive({ useHandCursor: true }).on('pointerdown', goBack);
    startButton.on('pointerdown', goStart);
    startLabel.setInteractive({ useHandCursor: true }).on('pointerdown', goStart);

    backButton.on('pointerover', () => backButton.setFillStyle(0x334155, 1));
    backButton.on('pointerout', () => backButton.setFillStyle(0x1e293b, 0.95));
    startButton.on('pointerover', () => startButton.setFillStyle(0x15803d, 1));
    startButton.on('pointerout', () => startButton.setFillStyle(0x166534, 0.95));

    this.pages = this.buildPages();
    this.renderPage();

    this.input.keyboard?.on('keydown-LEFT', () => this.prevPage());
    this.input.keyboard?.on('keydown-A', () => this.prevPage());
    this.input.keyboard?.on('keydown-RIGHT', () => this.nextPage());
    this.input.keyboard?.on('keydown-D', () => this.nextPage());
    this.input.keyboard?.on('keydown-ONE', () => this.jumpPage(0));
    this.input.keyboard?.on('keydown-TWO', () => this.jumpPage(1));
    this.input.keyboard?.on('keydown-THREE', () => this.jumpPage(2));
    this.input.keyboard?.on('keydown-FOUR', () => this.jumpPage(3));
    this.input.keyboard?.on('keydown-FIVE', () => this.jumpPage(4));
    this.input.keyboard?.on('keydown-SIX', () => this.jumpPage(5));
    this.input.keyboard?.on('keydown-ESC', goBack);
  }

  private buildPages(): GuidePage[] {
    const note = SANCTUARY_ISLE_NOTES[0];
    return [
      {
        title: 'Discernment',
        body: [
          'The core principle of your journey: use your discernment.',
          '',
          'Read your creat\'s needs and mood. Recognize which path suits this moment. See opportunities others miss.',
          'When an obstacle appears or a choice blocks you, pause and discern the right response.',
          '',
          'Discernment is not impulse. It is the practice of seeing clearly, choosing wisely, and acting with intention.',
          'Your journey rewards those who develop this skill.'
        ].join('\n')
      },
      {
        title: 'How to Play',
        body: [
          '1. Begin in Haven, complete intro prompts, and choose your route.',
          '2. Gather supplies, train with your creat, and complete tiny requests.',
          '3. Return home between runs to rest, craft, and prep the next route.',
          '',
          'Core loop: prepare -> explore -> return -> improve.'
        ].join('\n')
      },
      {
        title: 'Controls',
        body: [
          'Move: WASD or Arrow Keys',
          'Interact: E',
          'Fish: F (where available)',
          'Inventory/Map/Achievements: I / M / A (scene-dependent)',
          'Settings: O',
          'Return Home Base: ESC (safe scene flow)',
          '',
          'Tip: Not every scene exposes every key, but movement and interact stay consistent.'
        ].join('\n')
      },
      {
        title: 'Currencies and Items',
        body: [
          'GC: General coin used for practical expenses and local rewards.',
          'Materials: Crafting resources from routes, fishing, and request rewards.',
          'Quest/Key Items: Progress markers that unlock routes, story beats, or systems.',
          '',
          'Keep emergency supplies before long routes: food, repair stock, and a reserve coin buffer.'
        ].join('\n')
      },
      {
        title: 'Elements and Creat Growth',
        body: [
          'Elements in circulation: Fire, Water, Earth, Storm, Light, Shadow, Arcane.',
          'Bond and routine matter as much as combat outcomes.',
          'Awakening paths exist and are normalized in Sanctuary social life.',
          '',
          'High bond supports stronger route reliability and cleaner prep cycles.'
        ].join('\n')
      },
      {
        title: 'Sanctuary Basics',
        body: [
          'Sanctuary Isle is your home anchor, not a temporary stop.',
          'A practical rhythm is built in: travel out, then recover and refit at home.',
          'Use town requests for small gains and relationship building.',
          '',
          `Lore note: ${note ? `${note.title} - ${note.body}` : 'The isle keeps its history in small, earned moments.'}`
        ].join('\n')
      },
      {
        title: 'Keys and Progress Locks',
        body: [
          'Story flow unlocks through readiness steps, request completion, and route progression.',
          'Treat key items as long-term progression markers, not sellable junk.',
          'When in doubt, talk to mentors, check nearby prompts, and return to home base to reset priorities.',
          '',
          'Navigation: Left/Right or A/D to change pages. Number keys 1-6 jump sections.'
        ].join('\n')
      }
    ];
  }

  private renderPage() {
    const page = this.pages[this.pageIndex];
    this.pageTitle?.setText(page.title);
    this.pageBody?.setText(page.body);
    this.pageFooter?.setText(`Page ${this.pageIndex + 1}/${this.pages.length}   [A/Left] Prev   [D/Right] Next   [1-6] Jump   [ESC] Menu`);
  }

  private prevPage() {
    this.pageIndex = (this.pageIndex - 1 + this.pages.length) % this.pages.length;
    this.renderPage();
  }

  private nextPage() {
    this.pageIndex = (this.pageIndex + 1) % this.pages.length;
    this.renderPage();
  }

  private jumpPage(index: number) {
    if (index < 0 || index >= this.pages.length) return;
    this.pageIndex = index;
    this.renderPage();
  }
}