import Phaser from 'phaser';
import { updateAchievementRegistryFlags } from '../progression/achievements';
import { gameRegistry } from '../registry/GameRegistry';
import { gainPrepXp, getPrepProgress } from '../systems/PrepProgression';

interface DialogueLine {
  speaker: string;
  text: string;
  color: string;
  choices?: Array<{ text: string; next: number }>;
}

interface InteractionBeat {
  hint: string;
  success: string;
  rewardXp: number;
  done: boolean;
}

const DIALOGUE: DialogueLine[] = [
  {
    speaker: 'Elder Miriam',
    text: '"Welcome, young rider. The legends speak of you — the one who will gather the Crown."',
    color: '#fde68a',
    choices: [
      { text: 'Who are you?',           next: 1 },
      { text: 'What legends?',          next: 2 },
      { text: '[ Say nothing... ]',     next: 3 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"I am Miriam, keeper of the old ways. I have watched over this kingdom for many years, waiting for the rider who would come. The creat egg you carry — it chose you."',
    color: '#fde68a',
    choices: [
      { text: 'What egg? I don\'t understand.',  next: 4 },
      { text: 'Tell me about the Crown.',        next: 2 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"Long ago, eight kingdoms lived in harmony under the Crown Convergence. The Crown itself balanced all elements — Fire, Water, Earth, Storm, Light, Shadow, and Arcane. But jealousy and war shattered it. The world has been broken ever since."',
    color: '#fde68a',
    choices: [
      { text: 'And you think I can fix this?',   next: 5 },
      { text: 'Tell me about my creat.',         next: 4 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"Silent, are we? That is wise. Sometimes the best wisdom comes from listening first, and speaking when it counts."',
    color: '#fde68a',
    choices: [
      { text: 'I\'m ready to listen.',           next: 2 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"Your creat bonded with you the moment it sensed your element. As you train and fight together, your Bond will grow. At 50% you will unlock Combo Attacks. At 100% — Perfect Bond — your creat becomes your truest weapon."',
    color: '#c4b5fd',
    choices: [
      { text: 'How do I raise our bond?',        next: 6 },
      { text: 'What about the Crown fragments?', next: 7 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"You are the only one. The prophecy is clear. Gather the crown fragments, forge the Crown of Seven Realms, and the Hollow Monarch shall fall. I believe this completely."',
    color: '#fde68a',
    choices: [
      { text: 'Then I will not fail.',           next: 7 },
      { text: 'Tell me more about the enemies.', next: 8 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"Win battles with your creat at your side. Feed it Ember Fruit and rare fruits. Train in the Forest, survive the Crown Trials, ride the Race Circuits. The bond is forged through shared danger — not words."',
    color: '#86efac',
    choices: [
      { text: 'I understand.',                   next: 7 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"The Crown Trial holds a fragment guarded by Solflare Aevan — a firebird born from the sun\'s rage. Defeat it and claim your first fragment. Three fragments can be forged at the Crown Forge into a true crown."',
    color: '#fbbf24',
    choices: [
      { text: 'I will face Solflare Aevan.',     next: 9 },
      { text: 'What dangers await in the forest?', next: 8 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"The forests hide Venom Spiders, Root Beasts, and Stone Sentinels. The Volcano Zone seethes with Emberlings and Lava Hounds. Face them — each kill strengthens your bond and fills your treasury. Death will come for those unprepared."',
    color: '#f87171',
    choices: [
      { text: 'I\'m ready for anything.',        next: 9 },
    ]
  },
  {
    speaker: 'Elder Miriam',
    text: '"Then go. The Haven is your home — return here between battles to rest and reforge your purpose. The Crown awaits you, rider. Do not let it shatter again."',
    color: '#fde68a',
    choices: [
      { text: '→ Enter the Haven',               next: -1 },
    ]
  },
];

export default class StoryIntro extends Phaser.Scene {
  private currentLine = 0;
  private dialogueBox!: Phaser.GameObjects.Rectangle;
  private speakerText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private choiceButtons: Array<{ box: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }> = [];
  private miriamSprite!: Phaser.GameObjects.Sprite;
  private interactHintText!: Phaser.GameObjects.Text;
  private interactFeedbackText!: Phaser.GameObjects.Text;
  private checklistText!: Phaser.GameObjects.Text;
  private prepProgressText!: Phaser.GameObjects.Text;
  private prepXp = 0;
  private interactionBeats: Record<number, InteractionBeat> = {
    4: {
      hint: 'Interact Available: [E] Feed/steady the Creat egg during dialogue',
      success: 'You steady and feed the Creat egg. +6 Prep XP',
      rewardXp: 6,
      done: false
    },
    6: {
      hint: 'Interact Available: [E] Prepare trail supplies with Miriam',
      success: 'You help prepare travel supplies. +8 Prep XP',
      rewardXp: 8,
      done: false
    },
    7: {
      hint: 'Interact Available: [E] Quick waterside fish prep before departure',
      success: 'You add fresh fish to supplies. +5 Prep XP',
      rewardXp: 5,
      done: false
    }
  };

  constructor() { super('StoryIntro'); }

  create() {
    const { width, height } = this.scale;
    gameRegistry.loadFromLocalStorage();

    // ── Background: dark temple ──────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0310, 0x100520, 0x06090f, 0x0a0310, 1);
    bg.fillRect(0, 0, width, height);

    // Starfield
    for (let i = 0; i < 80; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(0, height * 0.6);
      const star = this.add.rectangle(sx, sy, 1.5, 1.5, 0xfef9c3, 0.8 * Math.random() + 0.2);
      this.tweens.add({ targets: star, alpha: 0.1, yoyo: true, repeat: -1, duration: 1000 + Math.random() * 2000 });
    }

    // Title
    this.add.text(width / 2, 28, 'ACT I  —  THE AWAKENING', {
      color: '#7c3aed', fontSize: '14px', fontStyle: 'bold', letterSpacing: 6
    }).setOrigin(0.5).setDepth(2);
    this.add.text(width / 2, 48, 'Path of the Crown', {
      color: '#6b7280', fontSize: '12px'
    }).setOrigin(0.5).setDepth(2);

    // Elder Miriam: use the hero sprite tinted purple as placeholder portrait
    this.miriamSprite = this.add.sprite(width * 0.25, height * 0.42, 'hero')
      .setScale(4).setTint(0xc4b5fd).setDepth(3);
    this.tweens.add({ targets: this.miriamSprite, y: height * 0.42 - 4, yoyo: true, repeat: -1, duration: 1800 });
    this.add.text(width * 0.25, height * 0.42 + 90, 'Elder Miriam', {
      color: '#c4b5fd', fontSize: '13px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(4);
    this.add.text(width * 0.25, height * 0.42 + 106, 'Keeper of the Old Ways', {
      color: '#6b7280', fontSize: '11px'
    }).setOrigin(0.5).setDepth(4);

    // Creat egg glow
    const egg = this.add.graphics().setDepth(3);
    egg.fillStyle(0x7c3aed, 0.25); egg.fillEllipse(width * 0.68, height * 0.38, 40, 50);
    egg.fillStyle(0x4c1d95, 0.8);  egg.fillEllipse(width * 0.68, height * 0.38, 28, 36);
    this.tweens.add({ targets: egg, alpha: 0.4, yoyo: true, repeat: -1, duration: 1200 });
    this.add.text(width * 0.68, height * 0.38 + 30, 'Your Creat Egg', {
      color: '#c4b5fd', fontSize: '10px'
    }).setOrigin(0.5).setDepth(4);

    // ── Dialogue box ─────────────────────────────────────────────────────
    this.dialogueBox = this.add.rectangle(width / 2, height - 110, width - 40, 140, 0x0f0a1e, 0.93)
      .setStrokeStyle(2, 0x7c3aed, 0.8).setDepth(8);
    this.speakerText = this.add.text(width / 2 - (width - 80) / 2 + 8, height - 195, '', {
      color: '#fde68a', fontSize: '14px', fontStyle: 'bold'
    }).setDepth(9);
    this.bodyText = this.add.text(width / 2, height - 175, '', {
      color: '#e2e8f0', fontSize: '13px', wordWrap: { width: width - 80 }, align: 'center'
    }).setOrigin(0.5, 0).setDepth(9);

    this.interactHintText = this.add.text(width / 2, height - 66, '', {
      color: '#93c5fd',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5).setDepth(10);

    this.interactFeedbackText = this.add.text(width / 2, height - 84, '', {
      color: '#86efac',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5).setDepth(10);

    this.checklistText = this.add.text(width - 14, 78, '', {
      color: '#cbd5e1',
      fontSize: '11px',
      align: 'right',
      wordWrap: { width: 320 }
    }).setOrigin(1, 0).setDepth(10);

    this.prepProgressText = this.add.text(width - 14, 186, '', {
      color: '#93c5fd',
      fontSize: '11px',
      align: 'right',
      wordWrap: { width: 320 }
    }).setOrigin(1, 0).setDepth(10);

    const currentPrep = getPrepProgress(this.registry);
    this.prepXp = currentPrep.totalXp;
    this.refreshPrepChecklistAndProgress();

    this.showLine(0);

    this.input.keyboard?.on('keydown-E', () => this.tryInteractionBeat());

    // Skip button
    const skipBtn = this.add.text(width - 10, 12, 'Skip →', {
      color: '#475569', fontSize: '12px'
    }).setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true });
    skipBtn.on('pointerdown', () => {
      this.registry.set('storyIntroSeen', true);
      localStorage.setItem('storyIntroSeen', 'true');
      this.scene.start('HavenGrounds');
    });
    skipBtn.on('pointerover', () => skipBtn.setColor('#94a3b8'));
    skipBtn.on('pointerout',  () => skipBtn.setColor('#475569'));
  }

  private showLine(index: number) {
    if (index < 0) {
      const allDone = Object.values(this.interactionBeats).every((beat) => beat.done);
      this.registry.set('storyCutscenePrepComplete', allDone);
      this.registry.set('storyIntroSeen', true);
      localStorage.setItem('storyIntroSeen', 'true');
      updateAchievementRegistryFlags(this.registry);
      this.scene.start('HavenGrounds');
      return;
    }
    this.currentLine = index;
    const line = DIALOGUE[index];

    const beat = this.interactionBeats[index];
    if (beat && !beat.done) {
      this.interactHintText.setText(beat.hint);
      this.interactHintText.setColor('#93c5fd');
    } else if (beat && beat.done) {
      this.interactHintText.setText('Interaction complete for this story moment.');
      this.interactHintText.setColor('#86efac');
    } else {
      this.interactHintText.setText('');
    }
    this.refreshPrepChecklistAndProgress();

    this.speakerText.setText(line.speaker + ':');
    this.speakerText.setColor(line.color);
    this.bodyText.setText(line.text);

    // Clear old choices
    for (const c of this.choiceButtons) { c.box.destroy(); c.label.destroy(); }
    this.choiceButtons = [];

    if (!line.choices) {
      const cont = this.add.text(this.scale.width / 2, this.scale.height - 36, '[ Click or press SPACE to continue ]', {
        color: '#475569', fontSize: '12px'
      }).setOrigin(0.5).setDepth(9);
      this.choiceButtons.push({ box: this.add.rectangle(0, 0, 0, 0, 0), label: cont });
      this.input.once('pointerdown', () => this.showLine(index + 1));
      this.input.keyboard?.once('keydown-SPACE', () => this.showLine(index + 1));
      return;
    }

    const { width, height } = this.scale;
    const totalW = line.choices.length * 190 + (line.choices.length - 1) * 10;
    let cx = width / 2 - totalW / 2 + 95;

    line.choices.forEach((choice) => {
      const box = this.add.rectangle(cx, height - 36, 180, 30, 0x1e1b4b, 0.85)
        .setStrokeStyle(1, 0x7c3aed, 0.8).setDepth(9).setInteractive({ useHandCursor: true });
      const label = this.add.text(cx, height - 36, choice.text, {
        color: '#c4b5fd', fontSize: '12px'
      }).setOrigin(0.5).setDepth(10);
      box.on('pointerdown', () => this.showLine(choice.next));
      box.on('pointerover', () => { box.setFillStyle(0x2e1065, 0.95); label.setColor('#fff'); });
      box.on('pointerout',  () => { box.setFillStyle(0x1e1b4b, 0.85); label.setColor('#c4b5fd'); });
      this.choiceButtons.push({ box, label });
      cx += 190;
    });
  }

  private tryInteractionBeat() {
    const beat = this.interactionBeats[this.currentLine];
    if (!beat) {
      this.interactFeedbackText.setText('No interaction event at this moment.');
      this.interactFeedbackText.setColor('#64748b');
      return;
    }
    if (beat.done) {
      this.interactFeedbackText.setText('This interaction is already completed.');
      this.interactFeedbackText.setColor('#64748b');
      return;
    }

    beat.done = true;
    const result = gainPrepXp(this.registry, beat.rewardXp, `story-intro:${this.currentLine}`);
    this.prepXp = result.totalXp;
    gameRegistry.addGold(beat.rewardXp / 2);
    this.interactFeedbackText.setText(`${beat.success} (Story Prep XP total: ${this.prepXp}${result.leveledUp ? ` · Prep Level ${result.level}!` : ''})`);
    this.interactFeedbackText.setColor('#86efac');
    this.interactHintText.setText('Interaction complete for this story moment.');
    this.interactHintText.setColor('#86efac');
    this.refreshPrepChecklistAndProgress();
  }

  private refreshPrepChecklistAndProgress() {
    const rows = Object.entries(this.interactionBeats)
      .map(([key, beat]) => {
        const shortLabel = key === '4'
          ? 'Egg care step'
          : key === '6'
            ? 'Supply prep step'
            : 'Waterside fish prep';
        return `${beat.done ? '✓' : '•'} ${shortLabel} (+${beat.rewardXp} XP)`;
      });

    this.checklistText.setText(`Cutscene Preparedness Checklist\n${rows.join('\n')}`);

    const progress = getPrepProgress(this.registry);
    this.prepProgressText.setText(
      `Prep XP Points: ${progress.totalXp}\nPrep Level: ${progress.level}\nNext Level: ${progress.xpIntoLevel}/${progress.xpToNextLevel}`
    );
  }
}
