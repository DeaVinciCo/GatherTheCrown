import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { ACCOUNT_WIPE_COST_GC, HERO_RENAME_COST_GC, CREAT_RENAME_UNLOCK_LEVEL } from '../constants/GameConstants';
import {
  getCreatSpecies,
  getAutoCreatNameForSpecies,
  getCreatSpeciesByName,
  getCreatSpeciesSelectionOptions,
  type CreatSpeciesEntry
} from '../systems/CreatSpecies';
import { getHeroCreatCombo } from '../systems/GameplayDataTables';
import { InventoryMenu, InventoryItem } from '../ui/InventoryMenu';
import AchievementPanel from '../ui/AchievementPanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import { getAchievementsFromRegistry, updateAchievementRegistryFlags } from '../progression/achievements';
import {
  getBondTier, getNeglectStage, COMPATIBILITY,
  calculatePassiveDecay, calculateHungerDecay,
  getPreferredFoods, getUniversalFoods, applyFeeding,
  getOffenseTier, getRelationshipEffects,
  type BondCompatibility
} from '../systems/CreatBondSystem';
import { DISPLAY_NAME_MAX_CHARS, DISPLAY_NAME_MAX_WORDS } from '../constants/GameConstants';
import { normalizeDisplayName, validateDisplayName } from '../utils/nameValidation';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';

export default class Haven extends Phaser.Scene {
  private settingsPanel?: SettingsPanel;

  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'Haven', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu(),
    onAchievements: () => this.openAchievements(),
    onSettings: () => this.openSettings()
  });
  private achievementsPanel?: AchievementPanel;

  constructor() {
    super('Haven');
  }

  create() {
    const { width, height } = this.scale;
    gameRegistry.loadFromLocalStorage();

    // ── Background: stone courtyard ─────────────────────────────────────
    for (let tx = 0; tx < width; tx += 32)
      for (let ty = 0; ty < height; ty += 32)
        this.add.image(tx + 16, ty + 16, 'stone').setDepth(0).setAlpha(0.65);
    this.add.rectangle(width / 2, height / 2, width, height, 0x080f1c, 0.52).setDepth(1);

    // ── Top banner ──────────────────────────────────────────────────────
    this.add.rectangle(width / 2, 32, width, 52, 0x0a0f1e, 0.95).setDepth(2);
    this.add.text(width / 2, 18, '⚜  THE HAVEN  ⚜', {
      color: '#fbbf24', fontSize: '20px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(3);

    const name            = (this.registry.get('heroName') as string)    || 'Hero';
    const heroClass       = (this.registry.get('heroClass') as string)   || 'Knight';
    const heroElement     = (this.registry.get('heroElement') as string) || 'Fire';
    const crownFragments  = (this.registry.get('crownFragments') as number) || 0;
    const gold            = (this.registry.get('gold') as number)        || 0;
    const soulshards      = (this.registry.get('soulshards') as number)  || 0;
    const greenGems       = (this.registry.get('greenGems') as number)   || 0;
    const emberFruit      = (this.registry.get('emberFruit') as number)  || 0;
    const creatBond       = (this.registry.get('creatBond') as number)   || 0;
    const hasCreatEgg     = !!this.registry.get('hasCreatEgg');
    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat');
    const districtBlessing = (this.registry.get('districtBlessing') as string) || 'None';

    // ── Apply passive bond / hunger decay since last visit ──────────────
    const creatElement    = (this.registry.get('creatElement') as string) || '';
    const creatCompat     = ((this.registry.get('creatCompatibility') as string) || 'match') as BondCompatibility;
    const creatOffensePoints = (this.registry.get('creatOffensePoints') as number) ?? 0;
    const creatRunaway = !!this.registry.get('creatRunaway');
    const creatCorrupted = !!this.registry.get('creatCorrupted');
    const creatTrackerTag = (this.registry.get('creatTrackerTag') as string) || 'King\'s Sigil Band';
    const creatLastSeenKingdom = (this.registry.get('creatLastSeenKingdom') as string) || 'Haven';
    const creatLastFedAt  = (this.registry.get('creatLastFedAt') as number) || Date.now();
    const creatLastCaredAt = (this.registry.get('creatLastCaredAt') as number) || Date.now();
    const savedCreatName  = (this.registry.get('creatName') as string) || '';
    const savedCreatSpecies = (this.registry.get('creatSpecies') as string) || '';
    const heroLevel       = (this.registry.get('heroLevel') as number) || 1;
    let creatHunger = (this.registry.get('creatHunger') as number) ?? 100;

    if (hasHatchedCreat && creatElement && !creatRunaway) {
      const elapsedHours = (Date.now() - creatLastFedAt) / 3_600_000;
      creatHunger = calculateHungerDecay(creatHunger, creatCompat, elapsedHours);
      const decayedBond = calculatePassiveDecay(creatBond, creatHunger, creatCompat, elapsedHours);
      this.registry.set('creatBond', decayedBond);
      this.registry.set('creatHunger', creatHunger);
      this.registry.set('creatLastFedAt', Date.now()); // reset clock
    }

    const liveBond = (this.registry.get('creatBond') as number) || creatBond;
    const bondTier  = getBondTier(liveBond);
    const neglect   = getNeglectStage(creatHunger);
    const offenseTier = getOffenseTier(creatOffensePoints);
    const relationship = getRelationshipEffects(creatOffensePoints, creatRunaway);
    const crownReady = crownFragments >= 3;

    updateAchievementRegistryFlags(this.registry);
    const achievementCount = (this.registry.get('achievementCount') as number) || 0;

    this.add.text(width / 2, 38, `${name}  |  ⚜ ${crownFragments} Frags  |  💰 ${gold}gc  |  ◈ ${greenGems}  |  ✦ ${soulshards}  |  🍊 ${emberFruit}`, {
      color: '#9ca3af', fontSize: '12px'
    }).setOrigin(0.5).setDepth(3);

    // ── Decorative trees ────────────────────────────────────────────────
    for (const [tx, ty] of [[16, 200], [width - 16, 200], [16, height - 50], [width - 16, height - 50]])
      this.add.image(tx, ty, 'tree').setDepth(2).setScale(0.75);

    // ── LEFT PANEL: Hero + Creat portraits ──────────────────────────────
    const panelX = 106;
    this.add.rectangle(panelX, height / 2, 150, 370, 0x0f172a, 0.72)
      .setStrokeStyle(1, 0x334155).setDepth(2);

    // Hero portrait
    this.add.text(panelX, 72, 'RIDER', { color: '#475569', fontSize: '10px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
    this.add.rectangle(panelX, 110, 80, 80, 0x1e3a8a, 0.5).setStrokeStyle(1, 0x3b82f6).setDepth(2);
    this.add.sprite(panelX, 106, 'hero').setScale(2.2).setDepth(3);
    this.add.text(panelX, 156, name, { color: '#93c5fd', fontSize: '13px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
    this.add.text(panelX, 172, `Lv.1  ${heroClass}`, { color: '#64748b', fontSize: '11px' }).setOrigin(0.5).setDepth(3);

    // Element badge
    const elColors: Record<string, { bg: number; text: string }> = {
      Fire: { bg: 0x7f1d1d, text: '#fca5a5' }, Water: { bg: 0x1e3a8a, text: '#93c5fd' },
      Earth: { bg: 0x14532d, text: '#86efac' }, Storm: { bg: 0x713f12, text: '#fde68a' },
      Light: { bg: 0x78350f, text: '#fef9c3' }, Shadow: { bg: 0x2e1065, text: '#d8b4fe' },
      Arcane: { bg: 0x083344, text: '#a5f3fc' }
    };
    const elCol = elColors[heroElement] || { bg: 0x1f2937, text: '#d1d5db' };
    this.add.rectangle(panelX, 190, 90, 18, elCol.bg, 0.9).setStrokeStyle(1, 0x475569).setDepth(3);
    this.add.text(panelX, 190, heroElement, { color: elCol.text, fontSize: '11px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);

    // Creat portrait progression
    this.add.text(panelX, 212, 'CREAT', { color: '#475569', fontSize: '10px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
    this.add.rectangle(panelX, 258, 80, 80, 0x1a1a2e, 0.6).setStrokeStyle(1, elCol.bg).setDepth(2);
    if (hasHatchedCreat && !creatRunaway) {
      const activeCreatElement = creatElement || heroElement;
      const creatKey = `creat-${activeCreatElement.toLowerCase()}`;
      const creatSpecies = savedCreatSpecies
        ? getCreatSpeciesByName(activeCreatElement, savedCreatSpecies)
        : getCreatSpecies(activeCreatElement);
      const speciesLabel = `${creatSpecies.species} (${creatSpecies.element})`;
      const displayName = savedCreatName || creatSpecies.autoNames[0];
      const creatSpr = this.add.sprite(panelX, 254, creatKey).setScale(1.8).setDepth(3);
      this.tweens.add({ targets: creatSpr, y: 250, yoyo: true, repeat: -1, duration: 900 });
      this.add.text(panelX, 300, displayName, { color: elCol.text, fontSize: '11px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 310, creatSpecies.species, { color: '#475569', fontSize: '9px' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 319, `${creatSpecies.icon} ${creatSpecies.archetype}`, { color: '#334155', fontSize: '8px' }).setOrigin(0.5).setDepth(3);

      // Bond label + bar — define tierColor first so gem ring can use it
      const tierColor = Number('0x' + bondTier.color.replace('#', ''));

      // ── Circular Bond Gem (Haven panel) ─────────────────────────────
      const gemX = panelX, gemY = 228;
      const gemRadius = 16;
      this.add.circle(gemX, gemY, gemRadius + 3, 0x0a0f1e).setDepth(3);
      this.add.circle(gemX, gemY, gemRadius, 0x0f172a).setDepth(3);
      const arcGraphics = this.add.graphics().setDepth(4);
      arcGraphics.lineStyle(4, tierColor, 0.9);
      arcGraphics.beginPath();
      arcGraphics.arc(gemX, gemY, gemRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * liveBond / 100), false);
      arcGraphics.strokePath();
      this.add.circle(gemX, gemY, 6, tierColor, 0.75).setDepth(5);
      this.add.text(gemX, gemY, `${liveBond.toFixed(0)}`, {
        fontSize: '8px', color: '#fff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(6);
      this.add.text(gemX, gemY + gemRadius + 6, 'BOND', { fontSize: '7px', color: '#64748b' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX - 44, 315, `Bond`, { color: '#94a3b8', fontSize: '10px' }).setDepth(3);
      this.add.text(panelX + 5, 315, `${liveBond.toFixed(0)}%  ${bondTier.label}`, { color: bondTier.color, fontSize: '10px', fontStyle: 'bold' }).setDepth(3);
      this.add.rectangle(panelX, 326, 90, 7, 0x1f2937).setDepth(3);
      if (liveBond > 0)
        this.add.rectangle(panelX - 45 + (90 * liveBond / 100) / 2, 326, 90 * liveBond / 100, 7, tierColor).setDepth(4);

      // Hunger label + bar
      const hungerColor = creatHunger >= 75 ? 0x22c55e : creatHunger >= 50 ? 0xeab308 : creatHunger >= 25 ? 0xf97316 : 0xef4444;
      this.add.text(panelX - 44, 336, `${neglect.emoji} ${neglect.label}`, { color: '#94a3b8', fontSize: '10px' }).setDepth(3);
      this.add.rectangle(panelX, 347, 90, 6, 0x1f2937).setDepth(3);
      if (creatHunger > 0)
        this.add.rectangle(panelX - 45 + (90 * creatHunger / 100) / 2, 347, 90 * creatHunger / 100, 6, hungerColor).setDepth(4);

      // Compatibility tag
      const compProfile = COMPATIBILITY[creatCompat];
      const compColor = creatCompat === 'match' ? '#fbbf24' : '#a855f7';
      this.add.text(panelX, 358, compProfile.label, { color: compColor, fontSize: '9px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 366, `⚠ ${offenseTier.label}`, { color: offenseTier.color, fontSize: '9px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 374, `Tracker: ${creatTrackerTag}`, { color: '#64748b', fontSize: '8px' }).setOrigin(0.5).setDepth(3);

      // Feed button
      const feedBtn = this.add.text(panelX, 390, '🍖 Feed Creat', {
        color: '#fef9c3', fontSize: '11px', backgroundColor: '#3f2a14'
      }).setOrigin(0.5).setPadding(6, 2).setDepth(4).setInteractive({ useHandCursor: true });
      feedBtn.on('pointerdown', () => this.openFeedPanel(activeCreatElement, creatCompat));
      feedBtn.on('pointerover', () => feedBtn.setColor('#fff'));
      feedBtn.on('pointerout', () => feedBtn.setColor('#fef9c3'));

      // Creat Inventory button
      const invBtn = this.add.text(panelX, 405, '🎒 Creat Inventory', {
        color: '#a5f3fc', fontSize: '10px', backgroundColor: '#0c1a3a'
      }).setOrigin(0.5).setPadding(5, 2).setDepth(4).setInteractive({ useHandCursor: true });
      invBtn.on('pointerdown', () => this.openCreatInventoryPanel(displayName));
      invBtn.on('pointerover', () => invBtn.setColor('#fff'));
      invBtn.on('pointerout', () => invBtn.setColor('#a5f3fc'));

      // Rename creat (level 20 unlock)
      if (heroLevel >= CREAT_RENAME_UNLOCK_LEVEL) {
        const renameBtn = this.add.text(panelX, 420, '✏ Rename Creat', {
          color: '#fde68a', fontSize: '10px', backgroundColor: '#1c1400'
        }).setOrigin(0.5).setPadding(5, 2).setDepth(4).setInteractive({ useHandCursor: true });
        renameBtn.on('pointerdown', () => this.openRenameCreatPanel(displayName));
        renameBtn.on('pointerover', () => renameBtn.setColor('#fff'));
        renameBtn.on('pointerout', () => renameBtn.setColor('#fde68a'));
      } else {
        this.add.text(panelX, 420, `Rename unlocks at Lv.${CREAT_RENAME_UNLOCK_LEVEL}`, { color: '#334155', fontSize: '9px' }).setOrigin(0.5).setDepth(3);
      }

      // Warning when bond is low in diverge mode
      if (creatCompat === 'diverge' && (liveBond < 50 || creatHunger < 30 || offenseTier.level >= 3)) {
        this.add.text(panelX, 434, '⚠ Needs care!', { color: '#ef4444', fontSize: '10px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);
      }
    } else if (hasHatchedCreat && creatRunaway) {
      this.add.text(panelX, 248, creatCorrupted ? 'Corrupted Runaway' : 'Creat Ran Off', {
        color: creatCorrupted ? '#ef4444' : '#f97316', fontSize: '11px', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 266, `Last Seen: ${creatLastSeenKingdom}`, { color: '#94a3b8', fontSize: '10px' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 280, `Tracker: ${creatTrackerTag}`, { color: '#64748b', fontSize: '9px' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 300, 'Travel speed reduced until trust is rebuilt.', {
        color: '#fca5a5', fontSize: '9px', wordWrap: { width: 120 }
      }).setOrigin(0.5).setDepth(3);

      const trackBtn = this.add.text(panelX, 336, '🧭 Track Creat', {
        color: '#fef9c3', fontSize: '11px', backgroundColor: '#3f2a14'
      }).setOrigin(0.5).setPadding(6, 2).setDepth(4).setInteractive({ useHandCursor: true });
      trackBtn.on('pointerdown', () => this.attemptTrackRunawayCreat());
      trackBtn.on('pointerover', () => trackBtn.setColor('#fff'));
      trackBtn.on('pointerout', () => trackBtn.setColor('#fef9c3'));

      if (creatCorrupted) {
        this.add.text(panelX, 356, 'This creat may return later as a foe.', {
          color: '#ef4444', fontSize: '8px', wordWrap: { width: 120 }
        }).setOrigin(0.5).setDepth(4);
      }
    } else if (hasCreatEgg) {
      const egg = this.add.ellipse(panelX, 254, 30, 40, 0x7c3aed, 0.82).setDepth(3);
      this.tweens.add({ targets: egg, alpha: 0.45, yoyo: true, repeat: -1, duration: 900 });
      this.add.text(panelX, 300, 'Unhatched Egg', { color: '#c4b5fd', fontSize: '11px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
      const hatchBtn = this.add.text(panelX, 318, 'Hatch Egg', {
        color: '#fef9c3', fontSize: '11px', backgroundColor: '#3f2a14'
      }).setOrigin(0.5).setPadding(6, 2).setDepth(4).setInteractive({ useHandCursor: true });
      hatchBtn.on('pointerdown', () => this.openHatchSelectionPanel(heroElement));
      hatchBtn.on('pointerover', () => hatchBtn.setColor('#fff'));
      hatchBtn.on('pointerout', () => hatchBtn.setColor('#fef9c3'));
      this.add.text(panelX, 334, 'Recovered in Forest Trial', { color: '#64748b', fontSize: '9px' }).setOrigin(0.5).setDepth(3);
    } else {
      this.add.text(panelX, 250, 'No Creat', { color: '#64748b', fontSize: '13px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 274, 'Find a Creat Egg', { color: '#93c5fd', fontSize: '10px' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 288, 'in Forest Trials', { color: '#93c5fd', fontSize: '10px' }).setOrigin(0.5).setDepth(3);
      this.add.text(panelX, 318, 'Bond  --', { color: '#64748b', fontSize: '11px' }).setOrigin(0.5).setDepth(3);
    }

    // Blessing
    this.add.text(panelX, 354, districtBlessing, { color: '#c4b5fd', fontSize: '10px', wordWrap: { width: 130 } }).setOrigin(0.5).setDepth(3);

    // ── ZONE NAVIGATION: 2 columns ──────────────────────────────────────
    const col1X = 388, col2X = 620;
    const rowYs = [90, 160, 230, 300];
    const navButtons: Array<{ label: string; sub: string; color: number; stroke: number; textColor: string; scene: string; col: number; row: number }> = [
      { label: '🌲  Forest Trials',   sub: 'Three routes · strongest guidance · deeper kingdom training', color: 0x14532d, stroke: 0x22c55e, textColor: '#86efac', scene: 'ForestTrialsGate', col: 1, row: 0 },
      { label: '🔥  Volcano Zone',     sub: 'Emberlings · Lava Hounds · Fire drops', color: 0x7f1d1d, stroke: 0xef4444, textColor: '#fca5a5', scene: 'VolcanoZone', col: 1, row: 1 },
      { label: '⚜  Crown Trial I',    sub: 'Solflare Aevan boss fight',              color: 0x78350f, stroke: 0xfbbf24, textColor: '#fde68a', scene: 'CrownTrial01', col: 1, row: 2 },
      { label: '🏆  Crown Forge',      sub: `${crownFragments} / 3 fragments`,       color: 0x1c1917, stroke: 0xfbbf24, textColor: '#fef9c3', scene: 'CrownForge',  col: 1, row: 3 },
      { label: '🕊  Sanctuary - SouthFerry Dock', sub: 'Boat arrival · island travel roads · route to Home Base', color: 0x0c4a6e, stroke: 0x06b6d4, textColor: '#a5f3fc', scene: 'SanctuaryIsleOverworld', col: 2, row: 0 },
      { label: '🏁  Race Circuit',     sub: 'Crownride · Earn Rhodium medals',       color: 0x0c1a3a, stroke: 0x06b6d4, textColor: '#a5f3fc', scene: 'RaceCircuit', col: 2, row: 1 },
      { label: '🏙  District 01',      sub: 'Vendor · Shrine · Treasury',            color: 0x1f2937, stroke: 0x9ca3af, textColor: '#d1d5db', scene: 'District01',  col: 2, row: 2 },
      { label: '📖  Story: Awakening', sub: 'Elder Miriam · Act I',                 color: 0x1a0a2e, stroke: 0x7c3aed, textColor: '#c4b5fd', scene: 'StoryIntro',  col: 2, row: 3 },
    ];

    if (gameRegistry.havenPathsUnlocked) {
      this.add.text(width / 2, 76, 'The kingdom has opened. Forest Trials pushes you outward into three escalating routes; Sanctuary gives you a safer base to regroup, learn, and restore.', {
        color: '#cbd5e1',
        fontSize: '11px',
        align: 'center',
        wordWrap: { width: 470 }
      }).setOrigin(0.5).setDepth(4);
    }

    for (const btn of navButtons) {
      const bx = btn.col === 1 ? col1X : col2X;
      const by = rowYs[btn.row] + 18;
      const box = this.add.rectangle(bx, by, 214, 56, btn.color, 0.78)
        .setStrokeStyle(2, btn.stroke, 0.9).setDepth(3).setInteractive({ useHandCursor: true });
      this.add.text(bx, by - 8, btn.label, { color: btn.textColor, fontSize: '15px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);
      this.add.text(bx, by + 10, btn.sub, { color: '#64748b', fontSize: '10px' }).setOrigin(0.5).setDepth(4);
      box.on('pointerdown', () => this.scene.start(btn.scene));
      box.on('pointerover', () => box.setAlpha(1));
      box.on('pointerout',  () => box.setAlpha(0.85));
    }

    // ── QUEST BOARD ──────────────────────────────────────────────────────
    const qbX = 504, qbY = 440;
    this.add.rectangle(qbX, qbY, 430, 160, 0x0f172a, 0.85).setStrokeStyle(1, 0xfbbf24, 0.5).setDepth(3);
    this.add.text(qbX, qbY - 64, '📜  Daily Quests', { color: '#fbbf24', fontSize: '13px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);

    const foes = (this.registry.get('totalKills') as number) || 0;
    const crownsForged = (this.registry.get('crownsForged') as number) || 0;
    const racesWon = (this.registry.get('racesWon') as number) || 0;
    const quests: Array<{ label: string; progress: number; goal: number; color: string }> = [
      { label: '⚔  Defeat 10 Forest Foes',    progress: Math.min(foes, 10),         goal: 10, color: '#86efac' },
      { label: '⚜  Forge your first Crown',   progress: Math.min(crownsForged, 1),  goal: 1,  color: '#fde68a' },
      { label: '🏁  Win a Race Circuit run',  progress: Math.min(racesWon, 1),       goal: 1,  color: '#a5f3fc' },
    ];
    quests.forEach((q, i) => {
      const qy = qbY - 44 + i * 34;
      const done = q.progress >= q.goal;
      this.add.text(qbX - 200, qy, done ? `✅ ${q.label}` : q.label, { color: done ? '#64748b' : q.color, fontSize: '12px' }).setDepth(4);
      this.add.text(qbX + 160, qy, `${q.progress}/${q.goal}`, { color: done ? '#22c55e' : '#94a3b8', fontSize: '12px' }).setOrigin(1, 0).setDepth(4);
      // mini progress bar
      this.add.rectangle(qbX - 20, qy + 14, 170, 5, 0x1f2937).setDepth(4);
      if (q.progress > 0)
        this.add.rectangle(qbX - 20 - 85 + (170 * q.progress / q.goal) / 2, qy + 14, 170 * q.progress / q.goal, 5, 0x22c55e).setDepth(5);
    });

    // ── Inventory / achievements buttons — bottom-right, above hint ──────
    const invBtn = this.add.text(width - 10, height - 62, '🎒 Inventory', {
      color: '#d1d5db', fontSize: '13px', backgroundColor: '#1f2937'
    }).setOrigin(1, 0).setDepth(5).setInteractive({ useHandCursor: true }).setPadding(7, 3);
    invBtn.on('pointerdown', () => this.openInventory());
    invBtn.on('pointerover', () => invBtn.setColor('#fff'));
    invBtn.on('pointerout',  () => invBtn.setColor('#d1d5db'));

    const settingsBtn = this.add.text(width - 10, height - 82, '⚙ Settings', {
      color: '#94a3b8', fontSize: '13px', backgroundColor: '#1f2937'
    }).setOrigin(1, 0).setDepth(5).setInteractive({ useHandCursor: true }).setPadding(7, 3);
    settingsBtn.on('pointerdown', () => this.openSettings());
    settingsBtn.on('pointerover', () => settingsBtn.setColor('#fbbf24'));
    settingsBtn.on('pointerout',  () => settingsBtn.setColor('#94a3b8'));

    const achBtn = this.add.text(width - 10, height - 42, `🏅 Achievements ${achievementCount}/5`, {
      color: '#fcd34d', fontSize: '12px', backgroundColor: '#111827'
    }).setOrigin(1, 0).setDepth(5).setInteractive({ useHandCursor: true }).setPadding(7, 3);
    achBtn.on('pointerdown', () => this.openAchievements());
    achBtn.on('pointerover', () => achBtn.setColor('#fff'));
    achBtn.on('pointerout',  () => achBtn.setColor('#fcd34d'));

    // Change hero name (30k gold)
    const heroNameBtn = this.add.text(width - 10, height - 22, `📝 Change Hero Name (${HERO_RENAME_COST_GC.toLocaleString()} 💰)`, {
      color: '#94a3b8', fontSize: '11px', backgroundColor: '#111827'
    }).setOrigin(1, 0).setDepth(5).setInteractive({ useHandCursor: true }).setPadding(7, 3);
    heroNameBtn.on('pointerdown', () => this.openChangeHeroNamePanel(name, gold));
    heroNameBtn.on('pointerover', () => heroNameBtn.setColor('#fbbf24'));
    heroNameBtn.on('pointerout',  () => heroNameBtn.setColor('#94a3b8'));

    // Reset / wipe account button (bottom-left, unobtrusive)
    const resetBtn = this.add.text(10, height - 6, '⚠ Reset Account', {
      color: '#374151', fontSize: '10px'
    }).setOrigin(0, 1).setDepth(5).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerover', () => resetBtn.setColor('#ef4444'));
    resetBtn.on('pointerout',  () => resetBtn.setColor('#374151'));
    resetBtn.on('pointerdown', () => this.openResetAccountPanel());

    // Keyboard shortcuts hint — placed at bottom so it doesn't overlap zone buttons.
    this.add.text(width / 2, height - 8, 'M=Map  I=Inventory  A=Achievements  O=Settings  Shift=Chat', {
      color: '#475569', fontSize: '11px'
    }).setOrigin(0.5, 1).setDepth(5);
    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    // ── Bottom tip ───────────────────────────────────────────────────────
    const tip = crownReady
      ? '👑 Crown Forge ready! Forge your first crown.'
      : `Collect ${3 - crownFragments} more Crown Fragment(s) from Crown Trial I`;
    this.add.text(width / 2, height - 10, tip, {
      color: crownReady ? '#fde68a' : '#374151', fontSize: '11px'
    }).setOrigin(0.5).setDepth(3);
  }

  private openInventory() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.inventory-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const items: InventoryItem[] = this.registry.get('inventory') || [
      { id: 'iron-sword', name: 'Iron Sword', equipped: true },
      { id: 'tower-shield', name: 'Tower Shield', equipped: false },
    ];
    const playerLevel = Number(this.registry.get('currentCrownLevel') || this.registry.get('playerLevel') || this.registry.get('level') || 1);
    new InventoryMenu(items, (updated) => this.registry.set('inventory', updated), { playerLevel }).attach(container);
  }

  private openMapMenu() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.map-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const root = document.createElement('div');
    root.className = 'map-menu';
    Object.assign(root.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(10, 15, 30, 0.72)',
      backdropFilter: 'blur(4px)',
      color: '#d1d5db',
      border: '1px solid #334155',
      borderRadius: '10px',
      minWidth: '320px',
      padding: '12px',
      zIndex: '99',
      boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
    });

    const title = document.createElement('div');
    title.innerText = 'World Map - Quick Travel';
    Object.assign(title.style, { color: '#fbbf24', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const spots: Array<{ label: string; scene: string }> = [
      { label: 'Haven', scene: 'Haven' },
      { label: 'Forest Run', scene: 'ForestZone' },
      { label: 'Volcano Zone', scene: 'VolcanoZone' },
      { label: 'Crown Trial I', scene: 'CrownTrial01' },
      { label: 'Crown Forge', scene: 'CrownForge' },
      { label: 'Battle Arena', scene: 'BattleArena' },
      { label: 'Race Circuit', scene: 'RaceCircuit' },
      { label: 'District 01', scene: 'District01' },
      { label: 'Story: Awakening', scene: 'StoryIntro' },
    ];

    for (const spot of spots) {
      const btn = document.createElement('button');
      btn.innerText = spot.label;
      Object.assign(btn.style, {
        display: 'block',
        width: '100%',
        marginBottom: '6px',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #374151',
        background: '#111827',
        color: '#e5e7eb',
        cursor: 'pointer'
      });
      btn.onclick = () => {
        root.remove();
        this.scene.start(spot.scene);
      };
      root.appendChild(btn);
    }

    const close = document.createElement('button');
    close.innerText = 'Close [M]';
    Object.assign(close.style, {
      marginTop: '4px',
      width: '100%',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #475569',
      background: '#1f2937',
      color: '#cbd5e1',
      cursor: 'pointer'
    });
    close.onclick = () => root.remove();
    root.appendChild(close);

    container.appendChild(root);
  }

  private openChatMenu() {
    const container = document.getElementById('game');
    if (!container) return;
    openGameChatOverlay({
      container,
      sceneLabel: 'Haven',
      scopeKey: 'haven',
      registry: this.registry,
    });
  }

  private openFeedPanel(creatElement: string, compat: BondCompatibility) {
    const container = document.getElementById('game');
    if (!container) return;

    // Remove any existing feed panel
    container.querySelectorAll('.feed-panel-overlay').forEach(n => n.remove());

    const overlay = document.createElement('div');
    overlay.className = 'feed-panel-overlay';
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '9000'
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#0f172a', border: '2px solid #334155', borderRadius: '12px',
      padding: '20px 24px', minWidth: '360px', maxWidth: '440px',
      color: '#e2e8f0', fontFamily: 'sans-serif', position: 'relative'
    });

    const profile = COMPATIBILITY[compat];
    const preferred = getPreferredFoods(creatElement);
    const universal = getUniversalFoods();
    const allFoods = [...preferred, ...universal];

    const creatHunger = (this.registry.get('creatHunger') as number) ?? 100;
    const liveBond = (this.registry.get('creatBond') as number) ?? 0;
    const curOffense = (this.registry.get('creatOffensePoints') as number) ?? 0;
    const neglect = getNeglectStage(creatHunger);
    const bondTier = getBondTier(liveBond);
    const offenseTier = getOffenseTier(curOffense);

    panel.innerHTML = `
      <h2 style="margin:0 0 4px;color:#fbbf24;font-size:17px;">🍖 Feed Your ${creatElement} Creat</h2>
      <p style="margin:0 0 12px;font-size:11px;color:#94a3b8;">${profile.note}</p>
      <div style="display:flex;gap:16px;margin-bottom:12px;">
        <div style="flex:1;">
          <div style="font-size:10px;color:#94a3b8;">Bond</div>
          <div style="font-size:14px;font-weight:bold;color:${bondTier.color};">${liveBond.toFixed(0)}% — ${bondTier.label}</div>
          <div style="background:#1f2937;border-radius:4px;height:6px;margin-top:2px;">
            <div style="width:${liveBond}%;height:6px;background:${bondTier.color};border-radius:4px;"></div>
          </div>
        </div>
        <div style="flex:1;">
          <div style="font-size:10px;color:#94a3b8;">Hunger ${neglect.emoji}</div>
          <div style="font-size:14px;font-weight:bold;color:${creatHunger >= 75 ? '#22c55e' : creatHunger >= 50 ? '#eab308' : '#ef4444'};">${creatHunger.toFixed(0)}% — ${neglect.label}</div>
          <div style="background:#1f2937;border-radius:4px;height:6px;margin-top:2px;">
            <div style="width:${creatHunger}%;height:6px;background:${creatHunger >= 75 ? '#22c55e' : creatHunger >= 50 ? '#eab308' : '#ef4444'};border-radius:4px;"></div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:8px;">
        <span style="color:#94a3b8;">Offense Tier</span>
        <span style="color:${offenseTier.color};font-weight:bold;">${offenseTier.label} (${curOffense})</span>
      </div>
      <div id="feed-feedback" style="min-height:20px;font-size:12px;margin-bottom:8px;color:#86efac;"></div>
      <div style="font-size:12px;color:#fbbf24;font-weight:bold;margin-bottom:6px;">Preferred foods for ${creatElement} creats:</div>
      <div id="food-list" style="display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto;"></div>
      <div style="font-size:12px;color:#64748b;font-weight:bold;margin:10px 0 6px;">Universal options:</div>
      <div id="universal-list" style="display:flex;flex-direction:column;gap:5px;"></div>
      <button id="close-feed" style="margin-top:14px;width:100%;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:7px;cursor:pointer;font-size:13px;">Close</button>
    `;

    overlay.appendChild(panel);
    container.appendChild(overlay);

    const feedback = panel.querySelector('#feed-feedback') as HTMLDivElement;

    const renderFoodButton = (food: typeof allFoods[0], container: HTMLElement) => {
      const isPreferred = food.preferredBy.includes(creatElement);
      const btn = document.createElement('button');
      Object.assign(btn.style, {
        display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b',
        border: `1px solid ${isPreferred ? '#22c55e33' : '#33415533'}`, borderRadius: '6px',
        padding: '6px 10px', cursor: 'pointer', color: '#e2e8f0', textAlign: 'left', width: '100%'
      });
      btn.innerHTML = `
        <span style="font-size:20px;">${food.emoji}</span>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:bold;">${food.name}</div>
          <div style="font-size:10px;color:#94a3b8;">${food.desc}</div>
        </div>
        <div style="text-align:right;font-size:11px;">
          <div style="color:${isPreferred ? '#22c55e' : '#94a3b8'};">+${isPreferred ? food.bondGain : food.bondGainOther >= 0 ? food.bondGainOther : food.bondGainOther} bond</div>
          <div style="color:#38bdf8;">+${food.hungerRestore}🍖</div>
        </div>`;

      btn.addEventListener('click', () => {
        const curBond = (this.registry.get('creatBond') as number) ?? 0;
        const currentOffense = (this.registry.get('creatOffensePoints') as number) ?? 0;
        const curHunger = (this.registry.get('creatHunger') as number) ?? 100;
        const result = applyFeeding(curBond, currentOffense, food, creatElement, compat);
        const newHunger = Math.min(100, curHunger + food.hungerRestore);
        this.registry.set('creatBond', result.newBond);
        this.registry.set('creatOffensePoints', result.newOffensePoints);
        this.registry.set('creatHunger', newHunger);
        this.registry.set('creatLastFedAt', Date.now());
        feedback.textContent = result.message;
        feedback.style.color = result.message.includes('⚠') || result.runawayTriggered ? '#ef4444' : '#86efac';

        if (result.runawayTriggered) {
          this.registry.set('creatRunaway', true);
          this.registry.set('creatCorrupted', result.corruptionTriggered);
          this.registry.set('creatLastSeenKingdom', 'Wild Borderlands');
          overlay.remove();
          this.scene.restart();
          return;
        }

        // update bars dynamically
        const bondBar = panel.querySelector('#bond-bar') as HTMLElement;
        if (bondBar) { bondBar.style.width = `${result.newBond}%`; }
      });

      container.appendChild(btn);
    };

    const foodList = panel.querySelector('#food-list') as HTMLElement;
    preferred.forEach(f => renderFoodButton(f, foodList));

    const uList = panel.querySelector('#universal-list') as HTMLElement;
    universal.forEach(f => renderFoodButton(f, uList));

    panel.querySelector('#close-feed')?.addEventListener('click', () => {
      overlay.remove();
      this.scene.restart(); // refresh Haven to show updated bond/hunger
    });
    overlay.addEventListener('pointerdown', (e) => {
      if (e.target === overlay) { overlay.remove(); this.scene.restart(); }
    });
  }

  private openAchievements() {
    const container = document.getElementById('game');
    if (!container) return;

    if (!this.achievementsPanel) {
      container.querySelectorAll('.achievement-panel').forEach((node) => node.remove());
      this.achievementsPanel = new AchievementPanel(() => getAchievementsFromRegistry(this.registry));
      this.achievementsPanel.attach(container);
    }
    this.achievementsPanel.show();
  }

  private openHatchSelectionPanel(heroElement: string) {
    const container = document.getElementById('game');
    if (!container) return;

    container.querySelectorAll('.hatch-panel-overlay').forEach((node) => node.remove());

    const overlay = document.createElement('div');
    overlay.className = 'hatch-panel-overlay';
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '9100'
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#0f172a', border: '2px solid #334155', borderRadius: '12px',
      padding: '18px 22px', minWidth: '420px', maxWidth: '560px',
      color: '#e2e8f0', fontFamily: 'sans-serif'
    });

    const hatchingElements = ['Fire', 'Water', 'Earth', 'Storm', 'Light', 'Shadow', 'Arcane'];

    // State
    let selectedElement = heroElement;
    let selectedSpeciesEntry: CreatSpeciesEntry = getCreatSpecies(heroElement);
    let selectedCompatibility: BondCompatibility = 'match';
    let selectedBond = COMPATIBILITY.match.startingBond;
    let creatCustomName = getAutoCreatNameForSpecies(heroElement, selectedSpeciesEntry.species);
    let step: 'element' | 'species' | 'name' = 'element';

    // ── STEP 1: Element selection ─────────────────────────────────────
    const renderElementStep = () => {
      panel.innerHTML = `
        <h2 style="margin:0 0 4px;color:#fbbf24;font-size:18px;">🥚 Hatch Your Creat</h2>
        <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;">Choose your creat's element at hatch time. Matching your hero element is recommended for stronger starting sync.</p>
        <p style="margin:0 0 10px;font-size:11px;color:#a5b4fc;">Hero Element: <strong>${heroElement}</strong> · Match starts at <strong>${COMPATIBILITY.match.startingBond}%</strong> · Diverge starts at <strong>${COMPATIBILITY.diverge.startingBond}%</strong></p>
        <div id="hatch-options" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px;"></div>
        <div style="font-size:11px;color:#64748b;margin-bottom:8px;">Recommended bond targets: 80%+ for Combo Finishers, 90%+ for Soulmate tier.</div>
        <button id="cancel-hatch" style="width:100%;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:7px;cursor:pointer;font-size:13px;">Cancel</button>
      `;

      const optionsRoot = panel.querySelector('#hatch-options') as HTMLDivElement;
      for (const element of hatchingElements) {
        const compatibility: BondCompatibility = element === heroElement ? 'match' : 'diverge';
        const startingBond = COMPATIBILITY[compatibility].startingBond;
        const tier = getBondTier(startingBond);
        const recommended = compatibility === 'match';
        const sp = getCreatSpecies(element);

        const btn = document.createElement('button');
        Object.assign(btn.style, {
          background: '#111827', border: `1px solid ${recommended ? '#22c55e55' : '#33415555'}`,
          color: '#e2e8f0', borderRadius: '8px', padding: '10px', cursor: 'pointer', textAlign: 'left'
        });
        btn.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <strong style="font-size:13px;">${sp.icon} ${element} — ${sp.species}</strong>
            <span style="font-size:10px;color:${recommended ? '#22c55e' : '#a855f7'};font-weight:bold;">${recommended ? 'MATCH' : 'DIVERGE'}</span>
          </div>
          <div style="font-size:10px;color:#94a3b8;font-style:italic;margin-top:2px;">${sp.archetype}</div>
          <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">Start Bond: ${startingBond}% · ${tier.label}</div>
          <div style="font-size:10px;color:#64748b;margin-top:2px;">⚔ <em>${sp.ability.name}</em> — ${sp.ability.description.slice(0, 72)}…</div>
          <div style="font-size:10px;color:#475569;margin-top:1px;">✦ <em>${sp.passive.name}</em>: ${sp.passive.description.slice(0, 60)}…</div>
        `;
        btn.addEventListener('click', () => {
          selectedElement = element;
          selectedSpeciesEntry = getCreatSpecies(element);
          selectedCompatibility = compatibility;
          selectedBond = startingBond;
          creatCustomName = getAutoCreatNameForSpecies(element, selectedSpeciesEntry.species);
          step = 'species';
          renderSpeciesStep();
        });
        optionsRoot.appendChild(btn);
      }

      panel.querySelector('#cancel-hatch')?.addEventListener('click', () => overlay.remove());
    };

    // ── STEP 2: Species selection (Core vs Variant A) ─────────────────
    const renderSpeciesStep = () => {
      const heroLevel = (this.registry.get('heroLevel') as number) || 1;
      const forestTrialsCleared = (this.registry.get('forestTrialsCleared') as number) || 0;
      const creatBond = (this.registry.get('creatBond') as number) || 0;
      const storyModeCompleted = !!this.registry.get('storyModeCompleted');
      const options = getCreatSpeciesSelectionOptions(selectedElement, {
        heroLevel,
        forestTrialsCleared,
        creatBond,
        storyModeCompleted
      });

      panel.innerHTML = `
        <h2 style="margin:0 0 4px;color:#fbbf24;font-size:18px;">🧬 Choose Species</h2>
        <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;">Select a core or variant species for your ${selectedElement} creat.</p>
        <div style="font-size:11px;color:#64748b;margin-bottom:10px;">Unlock snapshot — Hero Lv.${heroLevel} · Forest Trials ${forestTrialsCleared} · Bond ${creatBond.toFixed(0)}% · Story ${storyModeCompleted ? 'Complete' : 'Incomplete'}</div>
        <div id="species-options" style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:10px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="back-species" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:8px;cursor:pointer;font-size:13px;">← Back</button>
          <button id="cancel-species" style="background:#111827;color:#94a3b8;border:1px solid #334155;border-radius:6px;padding:8px;cursor:pointer;font-size:13px;">Cancel</button>
        </div>
      `;

      const optionsRoot = panel.querySelector('#species-options') as HTMLDivElement;
      options.forEach((opt) => {
        const btn = document.createElement('button');
        Object.assign(btn.style, {
          background: opt.unlocked ? '#111827' : '#0b1220',
          border: `1px solid ${opt.unlocked ? '#334155' : '#7f1d1d'}`,
          color: opt.unlocked ? '#e2e8f0' : '#94a3b8',
          borderRadius: '8px',
          padding: '10px',
          cursor: opt.unlocked ? 'pointer' : 'not-allowed',
          textAlign: 'left',
          opacity: opt.unlocked ? '1' : '0.75'
        });
        btn.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <strong style="font-size:13px;">${opt.entry.icon} ${opt.entry.species}</strong>
            <span style="font-size:10px;color:${opt.unlocked ? '#22c55e' : '#ef4444'};font-weight:bold;">${opt.unlocked ? opt.source.toUpperCase() : 'LOCKED'}</span>
          </div>
          <div style="font-size:10px;color:#94a3b8;font-style:italic;margin-top:2px;">${opt.entry.archetype}</div>
          <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">⚔ ${opt.entry.ability.name} · ✦ ${opt.entry.passive.name}</div>
          ${opt.lockReason ? `<div style="font-size:10px;color:#fca5a5;margin-top:3px;">${opt.lockReason}</div>` : ''}
        `;
        if (opt.unlocked) {
          btn.addEventListener('click', () => {
            selectedSpeciesEntry = opt.entry;
            creatCustomName = getAutoCreatNameForSpecies(selectedElement, selectedSpeciesEntry.species);
            step = 'name';
            renderNameStep();
          });
        }
        optionsRoot.appendChild(btn);
      });

      panel.querySelector('#back-species')?.addEventListener('click', () => {
        step = 'element';
        renderElementStep();
      });
      panel.querySelector('#cancel-species')?.addEventListener('click', () => overlay.remove());
    };

    // ── STEP 3: Name your creat ────────────────────────────────────────
    const renderNameStep = () => {
      const tier = getBondTier(selectedBond);
      const sp = selectedSpeciesEntry;
      const combo = getHeroCreatCombo(selectedElement);
      panel.innerHTML = `
        <h2 style="margin:0 0 4px;color:#fbbf24;font-size:18px;">✨ Name Your Creat</h2>
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Your <strong style="color:#e2e8f0;">${sp.icon} ${sp.species}</strong> is breaking free of the shell. Give it a name — or keep the one fate chose.</p>
        <div style="background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;margin-bottom:10px;">
          <div style="font-size:12px;color:#e2e8f0;font-weight:bold;margin-bottom:4px;">${sp.icon} ${sp.species} · <em style="color:#64748b;font-weight:normal;">${sp.archetype}</em></div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px;">Element: <span style="color:#e2e8f0;font-weight:bold;">${selectedElement}</span> &nbsp;|&nbsp; Starting Bond: <span style="color:${tier.color};font-weight:bold;">${selectedBond}% — ${tier.label}</span></div>
          <div style="font-size:11px;color:#a5b4fc;margin-bottom:2px;">⚔ <strong>${sp.ability.name}</strong> (${sp.ability.cooldown}s CD): ${sp.ability.description}</div>
          <div style="font-size:11px;color:#86efac;margin-bottom:4px;">✦ <strong>${sp.passive.name}</strong>: ${sp.passive.description}</div>
          <div style="font-size:10px;color:#fbbf24;margin-bottom:4px;">Combo: <strong>${combo.comboName}</strong> (${combo.heroPower} + ${combo.creatPower})</div>
          <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">${combo.comboEffect}</div>
          <div style="font-size:10px;color:#64748b;">You can rename once at Hero Level ${CREAT_RENAME_UNLOCK_LEVEL} — choose wisely.</div>
        </div>
        <label style="font-size:12px;color:#cbd5e1;display:block;margin-bottom:4px;">Creat's Name</label>
        <div style="font-size:10px;color:#64748b;margin-bottom:6px;">Max ${DISPLAY_NAME_MAX_CHARS} characters, ${DISPLAY_NAME_MAX_WORDS} words.</div>
        <div style="display:flex;gap:6px;margin-bottom:10px;">
          <input id="creat-name-input" type="text" maxlength="35" value="${creatCustomName}"
            style="flex:1;padding:8px;border-radius:6px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:14px;" />
          <button id="regen-name" title="Auto-generate a name" style="padding:8px 12px;background:#1e293b;color:#93c5fd;border:1px solid #334155;border-radius:6px;cursor:pointer;font-size:14px;">🎲</button>
        </div>
        <div id="name-error" style="color:#ef4444;font-size:11px;min-height:16px;margin-bottom:6px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="back-hatch" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:8px;cursor:pointer;font-size:13px;">← Back</button>
          <button id="confirm-hatch" style="background:#16a34a;color:#fff;border:none;border-radius:6px;padding:8px;cursor:pointer;font-size:14px;font-weight:bold;">Hatch!</button>
        </div>
      `;

      const nameInput = panel.querySelector('#creat-name-input') as HTMLInputElement;
      const nameError = panel.querySelector('#name-error') as HTMLDivElement;

      panel.querySelector('#regen-name')?.addEventListener('click', () => {
        nameInput.value = getAutoCreatNameForSpecies(selectedElement, sp.species);
      });

      panel.querySelector('#back-hatch')?.addEventListener('click', () => {
        step = 'species';
        renderSpeciesStep();
      });

      panel.querySelector('#confirm-hatch')?.addEventListener('click', () => {
        const rawName = normalizeDisplayName(nameInput.value);
        const creatNameError = validateDisplayName(rawName, 'Creat name');
        if (creatNameError) {
          nameError.textContent = creatNameError;
          return;
        }
        creatCustomName = rawName;
        overlay.remove();
        this.hatchCreatEgg(selectedElement, selectedSpeciesEntry.species, selectedCompatibility, selectedBond, creatCustomName);
      });
    };

    renderElementStep();

    overlay.addEventListener('pointerdown', (evt) => {
      if (evt.target === overlay) overlay.remove();
    });

    overlay.appendChild(panel);
    container.appendChild(overlay);
  }

  private hatchCreatEgg(selectedElement: string, selectedSpecies: string, compatibility: BondCompatibility, startingBond: number, creatName: string) {
    if (!this.registry.get('hasCreatEgg')) return;
    if (this.registry.get('hasHatchedCreat')) return;

    this.registry.set('hasHatchedCreat', true);
    this.registry.set('creatStage', 'hatchling');
    this.registry.set('creatElement', selectedElement);
    this.registry.set('creatCompatibility', compatibility);
    this.registry.set('creatBond', startingBond);
    this.registry.set('creatName', creatName);
    this.registry.set('creatSpecies', selectedSpecies);
    this.registry.set('creatOffensePoints', 0);
    this.registry.set('creatRunaway', false);
    this.registry.set('creatCorrupted', false);
    this.registry.set('creatTrackerTag', 'King\'s Sigil Band');
    this.registry.set('creatLastSeenKingdom', 'Haven');
    this.registry.set('creatHunger', 100);
    this.registry.set('creatLastFedAt', Date.now());
    this.registry.set('creatLastCaredAt', Date.now());
    updateAchievementRegistryFlags(this.registry);

    this.cameras.main.flash(350, 180, 120, 255);
    const text = this.add.text(this.scale.width / 2, this.scale.height / 2 - 20,
      `${creatName} the ${selectedSpecies} has hatched! (${startingBond}% bond)`, {
      color: '#f0abfc', fontSize: '22px', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(40);
    this.tweens.add({
      targets: text,
      y: this.scale.height / 2 - 56,
      alpha: 0,
      duration: 1300,
      onComplete: () => {
        text.destroy();
        this.scene.restart();
      }
    });
  }

  private attemptTrackRunawayCreat() {
    const offense = (this.registry.get('creatOffensePoints') as number) ?? 90;
    const corrupted = !!this.registry.get('creatCorrupted');
    const baseChance = corrupted ? 0.2 : 0.55;
    const offensePenalty = Math.min(0.25, Math.max(0, (offense - 70) / 200));
    const successChance = Math.max(0.1, baseChance - offensePenalty);
    const success = Math.random() < successChance;

    if (success) {
      this.registry.set('creatRunaway', false);
      this.registry.set('creatCorrupted', false);
      this.registry.set('creatOffensePoints', Math.max(55, offense - 20));
      this.registry.set('creatBond', Math.max(30, ((this.registry.get('creatBond') as number) ?? 0) - 10));
      this.registry.set('creatLastSeenKingdom', 'Haven');
      this.cameras.main.flash(280, 120, 255, 170);
      const t = this.add.text(this.scale.width / 2, this.scale.height / 2, 'You found your creat. Trust must be rebuilt.', {
        color: '#86efac', fontSize: '18px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(40);
      this.tweens.add({ targets: t, alpha: 0, y: t.y - 26, duration: 1300, onComplete: () => this.scene.restart() });
      return;
    }

    this.registry.set('creatLastSeenKingdom', 'Outer Kingdom Ridge');
    const fail = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Trail lost. Keep searching and improve your care choices.', {
      color: '#fca5a5', fontSize: '16px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(40);
    this.tweens.add({ targets: fail, alpha: 0, y: fail.y - 24, duration: 1300 });
  }

  // ── Reset Account (full wipe — requires triple confirmation) ─────────
  // Wipe requires a gold fee and multiple confirmations to avoid accidental resets.
  private openResetAccountPanel() {
    const container = document.getElementById('game');
    if (!container) return;
    container.querySelectorAll('.reset-overlay').forEach(n => n.remove());

    const currentGold = (this.registry.get('gold') as number) || 0;
    const canAffordWipe = currentGold >= ACCOUNT_WIPE_COST_GC;

    const overlay = document.createElement('div');
    overlay.className = 'reset-overlay';
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.86)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '9500'
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#0f172a', border: '2px solid #ef4444', borderRadius: '12px',
      padding: '22px 26px', minWidth: '380px', color: '#e2e8f0', fontFamily: 'sans-serif',
      textAlign: 'center'
    });

    if (!canAffordWipe) {
      // Blocked — not enough GC
      panel.innerHTML = `
        <h2 style="color:#ef4444;margin:0 0 10px;">⚠ Account Wipe Locked</h2>
        <p style="font-size:13px;color:#94a3b8;margin-bottom:6px;">
          A full account wipe costs <strong style="color:#fbbf24;">${ACCOUNT_WIPE_COST_GC.toLocaleString()} 💰</strong>.
        </p>
        <p style="font-size:13px;color:#94a3b8;margin-bottom:14px;">
          Your current gold: <strong style="color:#ef4444;">${currentGold.toLocaleString()} 💰</strong>
        </p>
        <p style="font-size:11px;color:#64748b;margin-bottom:16px;">Earn more gold through quests, races, and crown forging.</p>
        <button id="cancel-reset" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:8px 20px;cursor:pointer;">Close</button>
      `;
      panel.querySelector('#cancel-reset')?.addEventListener('click', () => overlay.remove());
      overlay.appendChild(panel);
      container.appendChild(overlay);
      return;
    }

    // Can afford — 2-step confirmation + type RESET
    let step = 1;
    const render = () => {
      const steps = [
        {
          title: '⚠ Reset Account?',
          body: `This costs <strong style="color:#fbbf24;">${ACCOUNT_WIPE_COST_GC.toLocaleString()} 💰</strong> and permanently wipes ALL progress: hero, creat, gold, crowns, achievements, inventory. You start fresh.`,
          btn: 'Yes, I understand — continue',
          btnColor: '#7f1d1d'
        },
        {
          title: '🔴 Final Confirmation',
          body: 'Type RESET below to confirm. 50,000,000 GC will be deducted and your entire account is wiped.',
          btn: 'WIPE MY ACCOUNT',
          btnColor: '#dc2626',
          requiresInput: true
        }
      ];
      const s = steps[step - 1];
      panel.innerHTML = `
        <h2 style="color:#ef4444;margin:0 0 10px;">${s.title}</h2>
        <p style="font-size:13px;color:#94a3b8;margin-bottom:14px;">${s.body}</p>
        ${s.requiresInput ? `<input id="reset-confirm-input" type="text" placeholder="Type RESET to confirm" style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #ef4444;background:#0f172a;color:#e2e8f0;font-size:14px;margin-bottom:10px;text-align:center;" />` : ''}
        <div id="reset-err" style="color:#ef4444;font-size:11px;min-height:16px;margin-bottom:6px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <button id="cancel-reset" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:8px;cursor:pointer;">Cancel</button>
          <button id="next-reset" style="background:${s.btnColor};color:#fff;border:none;border-radius:6px;padding:8px;cursor:pointer;font-weight:bold;">${s.btn}</button>
        </div>
        <div style="font-size:10px;color:#374151;margin-top:10px;">Step ${step} of 2</div>
      `;

      panel.querySelector('#cancel-reset')?.addEventListener('click', () => overlay.remove());
      panel.querySelector('#next-reset')?.addEventListener('click', () => {
        if (s.requiresInput) {
          const val = (panel.querySelector('#reset-confirm-input') as HTMLInputElement)?.value?.trim();
          const err = panel.querySelector('#reset-err') as HTMLDivElement;
          if (val !== 'RESET') { err.textContent = 'You must type RESET exactly.'; return; }
        }
        if (step < 2) { step++; render(); return; }
        // Deduct wipe cost and execute full reset
        gameRegistry.clear();
        overlay.remove();
        this.scene.start('MainMenu');
      });
    };

    render();
    overlay.appendChild(panel);
    container.appendChild(overlay);
  }

  // ── Change Hero Name (costs 30,000 gold) ──────────────────────────────
  private openChangeHeroNamePanel(currentName: string, currentGold: number) {
    const container = document.getElementById('game');
    if (!container) return;
    container.querySelectorAll('.hero-rename-overlay').forEach(n => n.remove());

    const overlay = document.createElement('div');
    overlay.className = 'hero-rename-overlay';
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '9200'
    });

    const COST = HERO_RENAME_COST_GC;
    const canAfford = currentGold >= COST;

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#0f172a', border: '2px solid #fbbf24', borderRadius: '12px',
      padding: '20px 24px', minWidth: '340px', color: '#e2e8f0', fontFamily: 'sans-serif'
    });
    panel.innerHTML = `
      <h2 style="margin:0 0 6px;color:#fbbf24;font-size:17px;">📝 Change Hero Name</h2>
      <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;">Current name: <strong style="color:#e2e8f0;">${currentName}</strong></p>
      <p style="margin:0 0 10px;font-size:12px;color:${canAfford ? '#86efac' : '#ef4444'};">Cost: 30,000 💰 &nbsp;|&nbsp; Your gold: ${currentGold.toLocaleString()}</p>
      <label style="font-size:12px;color:#cbd5e1;display:block;margin-bottom:4px;">New Name</label>
      <input id="hero-new-name" type="text" maxlength="35" value="${currentName}"
        style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:14px;margin-bottom:10px;" />
      <div id="name-err" style="color:#ef4444;font-size:11px;min-height:16px;margin-bottom:6px;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button id="cancel-hero-rename" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:8px;cursor:pointer;">Cancel</button>
        <button id="confirm-hero-rename" style="background:${canAfford ? '#b45309' : '#374151'};color:${canAfford ? '#fef3c7' : '#64748b'};border:none;border-radius:6px;padding:8px;cursor:${canAfford ? 'pointer' : 'default'};font-weight:bold;">Confirm (30k 💰)</button>
      </div>
    `;

    overlay.appendChild(panel);
    container.appendChild(overlay);

    panel.querySelector('#cancel-hero-rename')?.addEventListener('click', () => overlay.remove());
    panel.querySelector('#confirm-hero-rename')?.addEventListener('click', () => {
      if (!canAfford) return;
      const newName = normalizeDisplayName((panel.querySelector('#hero-new-name') as HTMLInputElement).value);
      const err = panel.querySelector('#name-err') as HTMLDivElement;
      const heroNameError = validateDisplayName(newName, 'Hero name');
      if (heroNameError) { err.textContent = heroNameError; return; }
      const newGold = currentGold - COST;
      this.registry.set('heroName', newName);
      this.registry.set('gold', newGold);
      overlay.remove();
      this.scene.restart();
    });
  }

  // ── Rename Creat (unlocked at Hero Level 20) ──────────────────────────
  private openRenameCreatPanel(currentCreatName: string) {
    const container = document.getElementById('game');
    if (!container) return;
    container.querySelectorAll('.creat-rename-overlay').forEach(n => n.remove());

    const overlay = document.createElement('div');
    overlay.className = 'creat-rename-overlay';
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '9200'
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#0f172a', border: '2px solid #fde68a', borderRadius: '12px',
      padding: '20px 24px', minWidth: '320px', color: '#e2e8f0', fontFamily: 'sans-serif'
    });
    panel.innerHTML = `
      <h2 style="margin:0 0 6px;color:#fde68a;font-size:17px;">✏ Rename Your Creat</h2>
      <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;">Current name: <strong style="color:#e2e8f0;">${currentCreatName}</strong></p>
      <p style="margin:0 0 10px;font-size:11px;color:#64748b;">You have reached Level 20 — one rename is your reward.</p>
      <label style="font-size:12px;color:#cbd5e1;display:block;margin-bottom:4px;">New Name</label>
      <input id="creat-new-name" type="text" maxlength="35" value="${currentCreatName}"
        style="width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:14px;margin-bottom:10px;" />
      <div id="creat-name-err" style="color:#ef4444;font-size:11px;min-height:16px;margin-bottom:6px;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button id="cancel-creat-rename" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:8px;cursor:pointer;">Cancel</button>
        <button id="confirm-creat-rename" style="background:#78350f;color:#fef3c7;border:none;border-radius:6px;padding:8px;cursor:pointer;font-weight:bold;">Save Name</button>
      </div>
    `;

    overlay.appendChild(panel);
    container.appendChild(overlay);

    panel.querySelector('#cancel-creat-rename')?.addEventListener('click', () => overlay.remove());
    panel.querySelector('#confirm-creat-rename')?.addEventListener('click', () => {
      const newName = normalizeDisplayName((panel.querySelector('#creat-new-name') as HTMLInputElement).value);
      const err = panel.querySelector('#creat-name-err') as HTMLDivElement;
      const creatNameError = validateDisplayName(newName, 'Creat name');
      if (creatNameError) { err.textContent = creatNameError; return; }
      this.registry.set('creatName', newName);
      overlay.remove();
      this.scene.restart();
    });
  }

  // ── Creat Inventory Panel ──────────────────────────────────────────────
  // Hero finds food/gear/potions for their creat — all routed here.
  private openCreatInventoryPanel(creatDisplayName: string) {
    const container = document.getElementById('game');
    if (!container) return;
    container.querySelectorAll('.creat-inv-overlay').forEach(n => n.remove());

    const creatInv: Array<{ id: string; name: string; quantity: number; type: string }> =
      (this.registry.get('creatInventory') as any[]) || [];

    const overlay = document.createElement('div');
    overlay.className = 'creat-inv-overlay';
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: '9200'
    });

    const typeEmoji: Record<string, string> = {
      food: '🍖', drink: '💧', gear: '🛡', potion: '🧪', craft: '⚙'
    };
    const typeLabel: Record<string, string> = {
      food: 'Food', drink: 'Drink', gear: 'Gear', potion: 'Potion', craft: 'Crafted'
    };

    const itemRows = creatInv.length > 0
      ? creatInv.map(item => `
          <tr>
            <td style="padding:5px 8px;">${typeEmoji[item.type] ?? '📦'}</td>
            <td style="padding:5px 8px;color:#e2e8f0;">${item.name}</td>
            <td style="padding:5px 8px;color:#64748b;font-size:11px;">${typeLabel[item.type] ?? item.type}</td>
            <td style="padding:5px 8px;color:#fbbf24;text-align:right;">×${item.quantity}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" style="padding:14px;text-align:center;color:#475569;font-size:12px;">No items yet. Hero finds creat items by exploring, crafting, or winning fights.</td></tr>`;

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#0f172a', border: '2px solid #0e7490', borderRadius: '12px',
      padding: '18px 22px', minWidth: '380px', maxWidth: '500px',
      color: '#e2e8f0', fontFamily: 'sans-serif'
    });
    panel.innerHTML = `
      <h2 style="margin:0 0 4px;color:#a5f3fc;font-size:17px;">🎒 ${creatDisplayName}'s Inventory</h2>
      <p style="margin:0 0 10px;font-size:11px;color:#64748b;">Items your hero found, won, or crafted that belong to your creat — food, gear, potions, and more.</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">${itemRows}</table>
      <div style="margin-top:12px;font-size:10px;color:#334155;border-top:1px solid #1e293b;padding-top:8px;">
        Items auto-route here when hero picks up creat food, wins creat gear, or crafts creat potions.<br/>
        Context actions (Feed · Water · Equip · Heal) appear in the field based on what ${creatDisplayName} needs.
      </div>
      <button id="close-creat-inv" style="margin-top:12px;width:100%;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:7px;cursor:pointer;font-size:13px;">Close</button>
    `;

    overlay.appendChild(panel);
    container.appendChild(overlay);
    panel.querySelector('#close-creat-inv')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('pointerdown', evt => { if (evt.target === overlay) overlay.remove(); });
  }

  private openSettings() {
    const container = document.getElementById('game');
    if (!container) return;
    if (!this.settingsPanel) this.settingsPanel = new SettingsPanel(container);
    if (this.settingsPanel.isOpen()) {
      this.settingsPanel.close();
    } else {
      this.settingsPanel.open();
    }
  }
}
