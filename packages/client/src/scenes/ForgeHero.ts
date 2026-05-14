import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { apiUrl } from '../utils/api';
import { COMPATIBILITY } from '../systems/CreatBondSystem';
import { MAX_HEROES } from '../constants/GameConstants';
import { DISPLAY_NAME_MAX_CHARS } from '../constants/GameConstants';
import { normalizeDisplayName, validateDisplayName } from '../utils/nameValidation';

export default class ForgeHero extends Phaser.Scene {
  private nameInput!: HTMLInputElement;
  private overlay!: HTMLDivElement;
  private selectedClass = 'Knight';
  private selectedElement = 'Fire';       // hero's combat element
  private selectedHybridElement = 'Fire'; // creat's element (awakened path only)
  private hybridBondMode: 'match' | 'diverge' = 'match';
  private selectedRace = 'Human';
  private selectedHybridLineage: 'Inherited' | 'Crown-Touched' = 'Inherited';
  private selectedSkinTone = 'tan';
  private selectedHairStyle = 'short';
  private selectedHairColor = 'brown';
  private selectedOriginTrait = 'Realm-born';
  private selectedCombatDoctrine = 'Balanced';
  private selectedWeapons: string[] = [];
  private messageDiv!: HTMLDivElement;

  constructor() {
    super('ForgeHero');
  }

  create() {
    const { width, height } = this.scale;
    const isNarrowLayout = width < 980;

    this.cameras.main.setBackgroundColor(0x08111f);
    this.add.rectangle(width / 2, height / 2, width, height, 0x08111f, 1).setDepth(-100);

    const gameContainer = document.getElementById('game');
    if (gameContainer) {
      gameContainer.querySelectorAll('.achievement-panel, .inventory-menu, .map-menu, .chat-menu').forEach((node) => node.remove());
    }

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x08111f, 0x0f172a, 0x172554, 0x111827, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 12, 'Forge Your Hero', {
      color: '#f8fafc',
      fontSize: '24px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 35, 'Craft your legend. Customize every detail before entering the kingdom.', {
      color: '#94a3b8',
      fontSize: '12px'
    }).setOrigin(0.5);


  const previewX = isNarrowLayout ? 120 : 140;

    const previewY = 310;
    const previewFrame = this.add.rectangle(previewX, previewY, 140, 180, 0x0f172a, 0.7)
      .setStrokeStyle(2, 0x3b82f6, 0.8)
      .setDepth(3);

    const hasHeroTexture = this.textures.exists('hero');
    const preview = hasHeroTexture
      ? this.add.sprite(previewX, previewY - 15, 'hero').setScale(2.5).setDepth(4)
      : null;

    const previewFallback = hasHeroTexture
      ? null
      : this.add.ellipse(previewX, previewY - 20, 56, 76, 0x93c5fd, 0.85)
          .setStrokeStyle(2, 0x3b82f6, 0.9)
          .setDepth(4);

    const previewFallbackLabel = hasHeroTexture
      ? null
      : this.add.text(previewX, previewY - 20, 'Hero', {
          color: '#0f172a',
          fontSize: '10px',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(5);

    const hasTattooTexture = this.textures.exists('tattoo-fire');
    const previewTattoo = hasTattooTexture
      ? this.add.image(previewX + 16, previewY - 18, 'tattoo-fire').setScale(0.45).setDepth(6).setVisible(false)
      : this.add.circle(previewX + 16, previewY - 18, 4, 0xf97316, 0.85).setDepth(6).setVisible(false);

    const previewSkin = this.add.rectangle(previewX, previewY - 40, 20, 14, 0xd2a679, 0.95).setDepth(4);
    const previewHair = this.add.graphics().setDepth(5);
    const classLabel = this.add.text(previewX, previewY + 60, 'Knight', {
      color: '#93c5fd',
      fontSize: '12px',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    const raceLabel = this.add.text(previewX, previewY + 76, 'Human', {
      color: '#a5b4fc',
      fontSize: '10px'
    }).setOrigin(0.5);
    const lineageLabel = this.add.text(previewX, previewY + 90, '', {
      color: '#c4b5fd',
      fontSize: '9px'
    }).setOrigin(0.5);
    const hybridPowerLabel = this.add.text(previewX, previewY + 104, '', {
      color: '#d1d5db',
      fontSize: '8px',
      align: 'center',
      wordWrap: { width: 140 }
    }).setOrigin(0.5);

    const drawHairPreview = (style: string, colorHex: string) => {
      const hairColor = Number.parseInt(colorHex.replace('#', ''), 16);
      const x = previewX;
      const y = previewY - 50;
      previewHair.clear();
      previewHair.fillStyle(hairColor, 1);

      if (style === 'short') {
        previewHair.fillEllipse(x, y - 1, 24, 10);
      } else if (style === 'wavy') {
        previewHair.fillEllipse(x - 6, y, 12, 10);
        previewHair.fillEllipse(x + 6, y, 12, 10);
      } else if (style === 'curly') {
        previewHair.fillCircle(x - 8, y, 4);
        previewHair.fillCircle(x - 2, y - 2, 4);
        previewHair.fillCircle(x + 4, y, 4);
        previewHair.fillCircle(x + 10, y - 1, 4);
      } else if (style === 'long') {
        previewHair.fillEllipse(x, y, 24, 10);
        previewHair.fillRect(x - 9, y + 2, 5, 18);
        previewHair.fillRect(x + 4, y + 2, 5, 18);
      } else if (style === 'spiky') {
        previewHair.fillTriangle(x - 10, y + 3, x - 4, y - 8, x, y + 3);
        previewHair.fillTriangle(x - 2, y + 3, x + 4, y - 10, x + 8, y + 3);
        previewHair.fillTriangle(x + 6, y + 3, x + 11, y - 7, x + 14, y + 3);
      } else if (style === 'braided') {
        previewHair.fillEllipse(x, y, 24, 10);
        previewHair.fillRect(x - 8, y + 2, 3, 16);
        previewHair.fillRect(x + 5, y + 2, 3, 16);
      } else if (style === 'afro') {
        previewHair.fillCircle(x - 4, y, 9);
        previewHair.fillCircle(x + 5, y, 9);
      } else {
        previewHair.fillRect(x - 11, y - 3, 22, 8);
        previewHair.fillRect(x + 2, y + 4, 8, 3);
      }
    };

    // Build an HTML overlay for the right side
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      top: '50px',
      left: isNarrowLayout ? '230px' : '270px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: '100',
      width: isNarrowLayout ? '460px' : '500px',
      maxHeight: '520px',
      overflowY: 'auto',
      paddingRight: '10px'
    });

    // Hero Name Input
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Hero name (max 35 chars, 5 words)';
    this.nameInput.maxLength = DISPLAY_NAME_MAX_CHARS;
    Object.assign(this.nameInput.style, {
      fontSize: '14px',
      padding: '6px 8px',
      borderRadius: '4px',
      border: '2px solid #0f0',
      background: '#111',
      color: '#fff',
      textAlign: 'center',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
      fontWeight: 'bold'
    });

    // Message display
    this.messageDiv = document.createElement('div');
    Object.assign(this.messageDiv.style, {
      color: '#ef4444',
      fontSize: '11px',
      textAlign: 'center',
      minHeight: '14px',
      width: '100%'
    });

    this.overlay.appendChild(this.nameInput);
    this.overlay.appendChild(this.messageDiv);

    // ── CLASS SELECTOR ───────────────────────────────────────────────
    const classHeader = this.createSectionHeader('Choose Your Class');
    this.overlay.appendChild(classHeader);

    const classRow = document.createElement('div');
    Object.assign(classRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const classInfo: Record<string, { desc: string; tint: number; frame: number; labelColor: string }> = {
      Knight: { desc: 'Frontline duelist', tint: 0xffffff, frame: 0x3b82f6, labelColor: '#93c5fd' },
      Ranger: { desc: 'Fast hunter', tint: 0x86efac, frame: 0x22c55e, labelColor: '#86efac' },
      Arcanist: { desc: 'Crown seeker', tint: 0xfde68a, frame: 0xf59e0b, labelColor: '#fde68a' },
      Sentinel: { desc: 'Defensive anchor', tint: 0x7dd3fc, frame: 0x0284c7, labelColor: '#7dd3fc' },
      Duelist: { desc: 'Burst melee striker', tint: 0xfda4af, frame: 0xe11d48, labelColor: '#fda4af' },
      Warden: { desc: 'Nature-touched vanguard', tint: 0xa7f3d0, frame: 0x0f766e, labelColor: '#99f6e4' }
    };

    const classDescLabel = document.createElement('div');
    Object.assign(classDescLabel.style, {
      color: '#94a3b8',
      fontSize: '10px',
      textAlign: 'center',
      minHeight: '14px',
      marginTop: '2px'
    });

    const classButtons = new Map<string, HTMLButtonElement>();
    const setSelectedClass = (heroClass: string) => {
      this.selectedClass = heroClass;
      classLabel.setText(heroClass);
      const chosenClass = classInfo[heroClass] || classInfo.Knight;

      preview?.setTint(chosenClass.tint);
      previewFallback?.setFillStyle(chosenClass.tint, 0.85);
      previewFrame.setStrokeStyle(2, chosenClass.frame, 0.8);
      classLabel.setColor(chosenClass.labelColor);
      classDescLabel.textContent = chosenClass.desc;

      classButtons.forEach((button, key) => {
        button.style.borderColor = key === heroClass ? '#f8fafc' : 'rgba(148, 163, 184, 0.3)';
        button.style.background = key === heroClass ? 'rgba(30, 64, 175, 0.8)' : 'rgba(15, 23, 42, 0.7)';
      });
    };

    ['Knight', 'Ranger', 'Arcanist', 'Sentinel', 'Duelist', 'Warden'].forEach((heroClass) => {
      const classBtn = document.createElement('button');
      classBtn.textContent = heroClass;
      Object.assign(classBtn.style, {
        fontSize: '12px',
        padding: '6px 4px',
        background: 'rgba(15, 23, 42, 0.7)',
        color: '#e5e7eb',
        border: '2px solid rgba(148, 163, 184, 0.3)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      });
      classBtn.addEventListener('click', () => setSelectedClass(heroClass));
      classButtons.set(heroClass, classBtn);
      classRow.appendChild(classBtn);
    });
    this.overlay.appendChild(classRow);
    this.overlay.appendChild(classDescLabel);

    // ── RACE SELECTOR ─────────────────────────────────────────────────
    const raceHeader = this.createSectionHeader('Resonance Path');
    this.overlay.appendChild(raceHeader);

    const raceRow = document.createElement('div');
    Object.assign(raceRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const raceButtons = new Map<string, HTMLButtonElement>();
    const raceDetailLabel = document.createElement('div');
    Object.assign(raceDetailLabel.style, {
      color: '#94a3b8',
      fontSize: '10px',
      textAlign: 'center',
      minHeight: '14px'
    });

    // Only 4 awakened skin mappings exist in this pass.
    // Storm, Light, and Arcane keep standard skin palette in this UI model.
    const hybridSkinToneByElement: Record<string, string> = {
      Water:  'pale-blue',
      Earth:  'pale-green',
      Shadow: 'pale-purple',
      Fire:   'pale-gray'
    };

    const hybridAbilityByElement: Record<string, string> = {
      Water:  'Awakened Flow Step: rapid water-phase dash',
      Earth:  'Awakened Root Guard: temporary bark barrier',
      Shadow: 'Awakened Umbral Step: short blink movement',
      Fire:   'Awakened Ash Pulse: brief burn aura'
    };

    const elementToTattoo: Record<string, string> = {
      Fire: 'tattoo-fire', Water: 'tattoo-water', Earth: 'tattoo-earth',
      Storm: 'tattoo-storm', Light: 'tattoo-light', Shadow: 'tattoo-shadow', Arcane: 'tattoo-arcane'
    };

    const updateHybridPowerLabel = () => {
      if (this.selectedRace === 'Hybrid') {
        // Power label reflects hero's element (may differ from creat in diverge mode)
        hybridPowerLabel.setText(hybridAbilityByElement[this.selectedHybridElement] || 'Awakened Focus: adaptive elemental expression');
      } else {
        hybridPowerLabel.setText('');
      }
    };

    const assignHybridLineage = () => {
      this.selectedHybridLineage = Math.random() < 0.5 ? 'Fae' : 'Titanborn';
      this.selectedHybridLineage = Math.random() < 0.5 ? 'Inherited' : 'Crown-Touched';
    };

    // Forward declarations — assigned below after DOM elements are created
    let creatElementSection: HTMLDivElement;
    let heroElementSection: HTMLDivElement;
    let bondInfoLabel: HTMLDivElement;
    let creatElemButtons: Map<string, HTMLButtonElement>;
    let matchModeBtn: HTMLButtonElement;
    let divergeModeBtn: HTMLButtonElement;

    const setSelectedCreatElement = (el: string) => {
      this.selectedHybridElement = el;
      // Tattoo + skin follow creat element
      previewTattoo.setTexture(elementToTattoo[el] || 'tattoo-fire');
      const mappedTone = hybridSkinToneByElement[el] || 'pale-gray';
      setSelectedSkinTone(mappedTone);
      // In match mode, hero element tracks creat element
      if (this.hybridBondMode === 'match') {
        setSelectedElement(el);
      }
      updateHybridPowerLabel();
      // Only 4 hybrid element buttons exist now
      const hybridColors: Record<string, string> = {
        Water: '#3b82f6', Earth: '#22c55e', Shadow: '#a855f7', Fire: '#ef4444'
      };
      creatElemButtons?.forEach((btn, key) => {
        const c = hybridColors[key] ?? '#fff';
        btn.style.borderColor = key === el ? c : 'rgba(148,163,184,0.2)';
        btn.style.background  = key === el ? 'rgba(40,20,80,0.8)' : 'rgba(15,23,42,0.5)';
        btn.style.color       = key === el ? c : '#9ca3af';
      });
    };

    const setHybridBondMode = (mode: 'match' | 'diverge') => {
      this.hybridBondMode = mode;
      if (mode === 'match') {
        heroElementSection.style.display = 'none';
        setSelectedElement(this.selectedHybridElement);
        bondInfoLabel.textContent = '🥚 Creat egg found via Forest Trials or Sanctuary Trail - bond % set at hatch time in Haven.';
        bondInfoLabel.style.color = '#94a3b8';
          bondInfoLabel.textContent = '🥚 Creat egg found via Forest Trials or Sanctuary Trail - bond % set at hatch time in Haven.';
        matchModeBtn.style.background = 'rgba(120,90,10,0.7)';
        matchModeBtn.style.borderColor = '#fde68a';
        divergeModeBtn.style.background = 'rgba(15,23,42,0.5)';
        divergeModeBtn.style.borderColor = 'rgba(148,163,184,0.2)';
        divergeModeBtn.style.color = '#9ca3af';
        matchModeBtn.style.color = '#fde68a';
      } else {
        heroElementSection.style.display = 'block';
        bondInfoLabel.textContent = '🥚 Creat egg found via Forest Trials or Sanctuary Trail — bond % set at hatch time in Haven.';
        bondInfoLabel.style.color = '#94a3b8';
        divergeModeBtn.style.background = 'rgba(60,20,100,0.7)';
        divergeModeBtn.style.borderColor = '#a855f7';
        divergeModeBtn.style.color = '#a855f7';
        matchModeBtn.style.background = 'rgba(15,23,42,0.5)';
        matchModeBtn.style.borderColor = 'rgba(148,163,184,0.2)';
        matchModeBtn.style.color = '#9ca3af';
      }
    };

    const setSelectedRace = (race: string) => {
      this.selectedRace = race;
      if (race === 'Hybrid') {
        assignHybridLineage();
        raceLabel.setText('Awakened Human');
        lineageLabel.setText(`Resonance: ${this.selectedHybridLineage}`);
        raceDetailLabel.textContent = `Awakened resonance path: ${this.selectedHybridLineage}`;
        // Show creat element panel — tattoo/skin auto-set when creat element is picked
        creatElementSection.style.display = 'block';
        // Start in match mode
        setHybridBondMode('match');
        setSelectedCreatElement(this.selectedHybridElement);
        previewTattoo.setVisible(true);
      } else {
        raceLabel.setText('Human');
        lineageLabel.setText('');
        raceDetailLabel.textContent = 'Baseline human path (awakening untrained or dormant)';
        creatElementSection.style.display = 'none';
        heroElementSection.style.display = 'block';
        previewTattoo.setVisible(false);
      }

      updateHybridPowerLabel();
      updateSkinToneAvailability();

      raceButtons.forEach((button, key) => {
        button.style.borderColor = key === race ? '#fef9c3' : 'rgba(148, 163, 184, 0.3)';
        button.style.background = key === race ? 'rgba(180, 150, 20, 0.4)' : 'rgba(15, 23, 42, 0.7)';
      });
    };

    [
      { value: 'Human', label: 'Human' },
      { value: 'Hybrid', label: 'Awakened' }
    ].forEach((race) => {
      const raceBtn = document.createElement('button');
      raceBtn.textContent = race.label;
      Object.assign(raceBtn.style, {
        fontSize: '12px',
        padding: '6px 4px',
        background: 'rgba(15, 23, 42, 0.7)',
        color: '#e5e7eb',
        border: '2px solid rgba(148, 163, 184, 0.3)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
      });
      raceBtn.addEventListener('click', () => setSelectedRace(race.value));
      raceButtons.set(race.value, raceBtn);
      raceRow.appendChild(raceBtn);
    });
    this.overlay.appendChild(raceRow);
    this.overlay.appendChild(raceDetailLabel);

    // ── AWAKENED: RESONANCE ELEMENT + BOND MODE (shown only when Awakened selected) ──
    creatElementSection = document.createElement('div');
    creatElementSection.style.display = 'none';
    Object.assign(creatElementSection.style, { width: '100%' });

    const creatElemHeader = this.createSectionHeader('🐉 Awakened Resonance Focus');
    creatElementSection.appendChild(creatElemHeader);

    const creatElemDesc = document.createElement('div');
    creatElemDesc.textContent = 'Your awakened resonance sets your signature skin/tattoo expression. Your Creat companion is still found as an egg through Forest Trials or Sanctuary Trail - you choose its element and name at hatch.';
    Object.assign(creatElemDesc.style, {
      color: '#9ca3af', fontSize: '9px', textAlign: 'center', marginBottom: '4px', lineHeight: '1.4'
    });
    creatElementSection.appendChild(creatElemDesc);

    const creatElemRow1 = document.createElement('div');
    Object.assign(creatElemRow1.style, { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', width: '100%' });
    const creatElemRow2 = document.createElement('div');
    Object.assign(creatElemRow2.style, {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '75%', margin: '4px auto 0'
    });

    creatElemButtons = new Map<string, HTMLButtonElement>();
    // Exactly 4 awakened resonance mappings in this panel
    const creatElementDefs = [
      { name: 'Water',  emoji: '💧', color: '#3b82f6', skin: 'pale-blue'   },
      { name: 'Earth',  emoji: '🌿', color: '#22c55e', skin: 'pale-green'  },
      { name: 'Shadow', emoji: '🌑', color: '#a855f7', skin: 'pale-purple' },
      { name: 'Fire',   emoji: '🔥', color: '#ef4444', skin: 'pale-gray'   }
    ];
    // 2×2 grid — one row is enough for 4 elements
    Object.assign(creatElemRow1.style, { gridTemplateColumns: 'repeat(4, 1fr)' });
    creatElemRow2.style.display = 'none'; // unused
    creatElementDefs.forEach((el) => {
      const btn = document.createElement('button');
      btn.textContent = `${el.emoji} ${el.name}`;
      const skinDot = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${el.skin};margin-left:3px;vertical-align:middle;"></span>`;
      btn.innerHTML = `${el.emoji} ${el.name}${skinDot}`;
      Object.assign(btn.style, {
        fontSize: '11px', padding: '5px 2px', background: 'rgba(15,23,42,0.5)', color: '#9ca3af',
        border: '1px solid rgba(148,163,184,0.2)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
      });
      btn.addEventListener('click', () => setSelectedCreatElement(el.name));
      creatElemButtons.set(el.name, btn);
      creatElemRow1.appendChild(btn);
    });
    creatElementSection.appendChild(creatElemRow1);
    creatElementSection.appendChild(creatElemRow2);

    // Bond mode buttons
    const bondModeHeader = this.createSectionHeader('Bond Style');
    creatElementSection.appendChild(bondModeHeader);

    const bondModeRow = document.createElement('div');
    Object.assign(bondModeRow.style, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', width: '100%' });

    matchModeBtn = document.createElement('button');
    matchModeBtn.textContent = '⭐ Sync Resonance (Rec.)';
    Object.assign(matchModeBtn.style, {
      fontSize: '11px', padding: '6px 4px', background: 'rgba(120,90,10,0.7)', color: '#fde68a',
      border: '2px solid #fde68a', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
    });
    matchModeBtn.addEventListener('click', () => setHybridBondMode('match'));

    divergeModeBtn = document.createElement('button');
    divergeModeBtn.textContent = '⚡ Choose My Own';
    Object.assign(divergeModeBtn.style, {
      fontSize: '11px', padding: '6px 4px', background: 'rgba(15,23,42,0.5)', color: '#9ca3af',
      border: '2px solid rgba(148,163,184,0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
    });
    divergeModeBtn.addEventListener('click', () => setHybridBondMode('diverge'));

    bondModeRow.appendChild(matchModeBtn);
    bondModeRow.appendChild(divergeModeBtn);
    creatElementSection.appendChild(bondModeRow);

    bondInfoLabel = document.createElement('div');
    bondInfoLabel.textContent = '🥚 Creat egg found via Forest Trials or Sanctuary Trail - bond % set at hatch time in Haven.';
    Object.assign(bondInfoLabel.style, {
      color: '#94a3b8', fontSize: '9px', textAlign: 'center', marginTop: '4px',
      padding: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px'
    });
    creatElementSection.appendChild(bondInfoLabel);
    this.overlay.appendChild(creatElementSection);
    const skinHeader = this.createSectionHeader('Skin Tone');
    this.overlay.appendChild(skinHeader);

    const skinTones = [
      { name: 'pale', color: '#f5d5b8', code: '#f5d5b8' },
      { name: 'tan', color: '#d2a679', code: '#d2a679' },
      { name: 'olive', color: '#b8956a', code: '#b8956a' },
      { name: 'bronze', color: '#8b6f47', code: '#8b6f47' },
      { name: 'ebony', color: '#3d2817', code: '#3d2817' },
      { name: 'umber', color: '#6a4a2f', code: '#6a4a2f' },
      { name: 'rose', color: '#e7b8a0', code: '#e7b8a0' },
      { name: 'pale-blue', color: '#a7bfdc', code: '#a7bfdc' },
      { name: 'pale-green', color: '#b0c8b0', code: '#b0c8b0' },
      { name: 'pale-purple', color: '#bcaed1', code: '#bcaed1' },
      { name: 'pale-gray', color: '#b8bcc4', code: '#b8bcc4' }
    ];

    const hybridOnlySkinTones = new Set(['pale-blue', 'pale-green', 'pale-purple', 'pale-gray']);

    const skinRow = document.createElement('div');
    Object.assign(skinRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const skinButtons = new Map<string, HTMLButtonElement>();
    const updateSkinToneAvailability = () => {
      skinButtons.forEach((button, key) => {
        const isHybridTone = hybridOnlySkinTones.has(key);
        if (this.selectedRace === 'Hybrid') {
          button.style.opacity = isHybridTone ? '1' : '0.25';
          button.style.pointerEvents = isHybridTone ? 'auto' : 'none';
        } else {
          button.style.opacity = isHybridTone ? '0.4' : '1';
          button.style.pointerEvents = isHybridTone ? 'none' : 'auto';
        }
      });
    };

    const setSelectedSkinTone = (tone: string) => {
      if (this.selectedRace === 'Hybrid' && !hybridOnlySkinTones.has(tone)) {
        return;
      }
      if (this.selectedRace !== 'Hybrid' && hybridOnlySkinTones.has(tone)) {
        return;
      }
      this.selectedSkinTone = tone;
      const selectedTone = skinTones.find((item) => item.name === tone);
      if (selectedTone) {
        previewSkin.setFillStyle(Number.parseInt(selectedTone.color.replace('#', ''), 16), 0.95);
      }
      skinButtons.forEach((button, key) => {
        button.style.border = key === tone ? '3px solid #fef9c3' : '2px solid #333';
      });
    };

    skinTones.forEach((tone) => {
      const skinBtn = document.createElement('button');
      skinBtn.textContent = '';
      Object.assign(skinBtn.style, {
        width: '40px',
        height: '40px',
        background: tone.color,
        border: '2px solid #333',
        borderRadius: '4px',
        cursor: 'pointer',
        title: tone.name
      });
      skinBtn.addEventListener('click', () => setSelectedSkinTone(tone.name));
      skinButtons.set(tone.name, skinBtn);
      skinRow.appendChild(skinBtn);
    });
    this.overlay.appendChild(skinRow);

    // ── HAIR STYLE SELECTOR ──────────────────────────────────────────
    const hairStyleHeader = this.createSectionHeader('Hair Style');
    this.overlay.appendChild(hairStyleHeader);

    const hairStyles = ['short', 'wavy', 'curly', 'long', 'spiky', 'braided', 'afro', 'undercut'];
    const hairStyleRow = document.createElement('div');
    Object.assign(hairStyleRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const hairStyleButtons = new Map<string, HTMLButtonElement>();
    const setSelectedHairStyle = (style: string) => {
      this.selectedHairStyle = style;
      const selectedHair = hairColors.find((item) => item.name === this.selectedHairColor) || hairColors[1];
      drawHairPreview(style, selectedHair.color);
      hairStyleButtons.forEach((button, key) => {
        button.style.borderColor = key === style ? '#fef9c3' : 'rgba(148, 163, 184, 0.3)';
        button.style.background = key === style ? 'rgba(100, 100, 150, 0.5)' : 'rgba(15, 23, 42, 0.7)';
      });
    };

    hairStyles.forEach((style) => {
      const hairBtn = document.createElement('button');
      hairBtn.textContent = style.charAt(0).toUpperCase() + style.slice(1);
      Object.assign(hairBtn.style, {
        fontSize: '11px',
        padding: '4px 2px',
        background: 'rgba(15, 23, 42, 0.7)',
        color: '#d1d5db',
        border: '2px solid rgba(148, 163, 184, 0.3)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      });
      hairBtn.addEventListener('click', () => setSelectedHairStyle(style));
      hairStyleButtons.set(style, hairBtn);
      hairStyleRow.appendChild(hairBtn);
    });
    this.overlay.appendChild(hairStyleRow);

    // ── HAIR COLOR SELECTOR ──────────────────────────────────────────
    const hairColorHeader = this.createSectionHeader('Hair Color');
    this.overlay.appendChild(hairColorHeader);

    const hairColors = [
      { name: 'black', color: '#1a1a1a' },
      { name: 'brown', color: '#654321' },
      { name: 'red', color: '#cc3300' },
      { name: 'blonde', color: '#ffcc00' },
      { name: 'silver', color: '#c0c0c0' },
      { name: 'auburn', color: '#8b3a3a' },
      { name: 'white', color: '#f8fafc' },
      { name: 'teal', color: '#0f766e' }
    ];

    const hairColorRow = document.createElement('div');
    Object.assign(hairColorRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const hairColorButtons = new Map<string, HTMLButtonElement>();
    const setSelectedHairColor = (color: string) => {
      this.selectedHairColor = color;
      const selectedHair = hairColors.find((item) => item.name === color);
      if (selectedHair) {
        drawHairPreview(this.selectedHairStyle, selectedHair.color);
      }
      hairColorButtons.forEach((button, key) => {
        button.style.border = key === color ? '3px solid #fef9c3' : '2px solid #333';
      });
    };

    hairColors.forEach((hc) => {
      const colorBtn = document.createElement('button');
      colorBtn.textContent = '';
      Object.assign(colorBtn.style, {
        width: '40px',
        height: '40px',
        background: hc.color,
        border: '2px solid #333',
        borderRadius: '4px',
        cursor: 'pointer',
        title: hc.name
      });
      colorBtn.addEventListener('click', () => setSelectedHairColor(hc.name));
      hairColorButtons.set(hc.name, colorBtn);
      hairColorRow.appendChild(colorBtn);
    });
    this.overlay.appendChild(hairColorRow);

    // ── ORIGIN TRAIT SELECTOR ─────────────────────────────────────────
    const originHeader = this.createSectionHeader('Origin Trait');
    this.overlay.appendChild(originHeader);

    const originRow = document.createElement('div');
    Object.assign(originRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const originTraits = [
      { name: 'Realm-born', desc: 'Raised in the kingdom' },
      { name: 'Frontier-raised', desc: 'Hardy and resourceful' },
      { name: 'Temple-trained', desc: 'Disciplined and focused' },
      { name: 'Forge-touched', desc: 'Built for pressure' },
      { name: 'Skybound', desc: 'Fast and elusive' },
      { name: 'Wildmarked', desc: 'Instinct-driven' }
    ];

    const originButtons = new Map<string, HTMLButtonElement>();
    const setSelectedOriginTrait = (trait: string) => {
      this.selectedOriginTrait = trait;
      originButtons.forEach((button, key) => {
        button.style.borderColor = key === trait ? '#fef9c3' : 'rgba(148, 163, 184, 0.3)';
        button.style.background = key === trait ? 'rgba(120, 92, 255, 0.35)' : 'rgba(15, 23, 42, 0.7)';
      });
    };

    originTraits.forEach((trait) => {
      const originBtn = this.createTagButton(trait.name);
      originBtn.title = trait.desc;
      originBtn.addEventListener('click', () => setSelectedOriginTrait(trait.name));
      originButtons.set(trait.name, originBtn);
      originRow.appendChild(originBtn);
    });
    this.overlay.appendChild(originRow);

    // ── COMBAT DOCTRINE SELECTOR ──────────────────────────────────────
    const doctrineHeader = this.createSectionHeader('Combat Doctrine');
    this.overlay.appendChild(doctrineHeader);

    const doctrineRow = document.createElement('div');
    Object.assign(doctrineRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const doctrines = [
      { name: 'Balanced', desc: 'Even stats and flexibility' },
      { name: 'Aggressive', desc: 'Front-load damage pressure' },
      { name: 'Defensive', desc: 'Safer play and survivability' },
      { name: 'Swift', desc: 'Speed and repositioning' },
      { name: 'Mystic', desc: 'Elemental and utility focus' },
      { name: 'Tactician', desc: 'Control and adaptability' }
    ];

    const doctrineButtons = new Map<string, HTMLButtonElement>();
    const setSelectedCombatDoctrine = (doctrine: string) => {
      this.selectedCombatDoctrine = doctrine;
      doctrineButtons.forEach((button, key) => {
        button.style.borderColor = key === doctrine ? '#fef9c3' : 'rgba(148, 163, 184, 0.3)';
        button.style.background = key === doctrine ? 'rgba(34, 197, 94, 0.28)' : 'rgba(15, 23, 42, 0.7)';
      });
    };

    doctrines.forEach((doctrine) => {
      const doctrineBtn = this.createTagButton(doctrine.name);
      doctrineBtn.title = doctrine.desc;
      doctrineBtn.addEventListener('click', () => setSelectedCombatDoctrine(doctrine.name));
      doctrineButtons.set(doctrine.name, doctrineBtn);
      doctrineRow.appendChild(doctrineBtn);
    });
    this.overlay.appendChild(doctrineRow);

    // ── ELEMENT SELECTOR ─────────────────────────────────────────────
    const elementHeader = this.createSectionHeader('Choose Your Element');
    this.overlay.appendChild(elementHeader);

    const elementRow = document.createElement('div');
    Object.assign(elementRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '4px',
      width: '100%'
    });

    const elementRow2 = document.createElement('div');
    Object.assign(elementRow2.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '4px',
      width: '75%',
      marginLeft: 'auto',
      marginRight: 'auto'
    });

    const elementDescLabel = document.createElement('div');
    Object.assign(elementDescLabel.style, {
      color: '#94a3b8',
      fontSize: '10px',
      textAlign: 'center',
      minHeight: '14px',
      marginTop: '2px'
    });

    const elements: Array<{ name: string; emoji: string; color: string; desc: string; tint: number }> = [
      { name: 'Fire',   emoji: '🔥', color: '#ef4444', desc: 'High crit rate', tint: 0xfca5a5 },
      { name: 'Water',  emoji: '💧', color: '#3b82f6', desc: 'Regen boost', tint: 0x93c5fd },
      { name: 'Earth',  emoji: '🌿', color: '#22c55e', desc: 'Max defense', tint: 0x86efac },
      { name: 'Storm',  emoji: '⚡', color: '#eab308', desc: 'Speed boost', tint: 0xfde68a },
      { name: 'Light',  emoji: '✨', color: '#fef9c3', desc: 'Healing amplify', tint: 0xfefce8 },
      { name: 'Shadow', emoji: '🌑', color: '#a855f7', desc: 'Lifesteal', tint: 0xd8b4fe },
      { name: 'Arcane', emoji: '🔮', color: '#06b6d4', desc: 'Crown pressure', tint: 0xa5f3fc },
    ];

    const elementButtons = new Map<string, HTMLButtonElement>();
    const setSelectedElement = (el: string) => {
      this.selectedElement = el;
      const found = elements.find((e) => e.name === el);
      elementDescLabel.textContent = found ? found.desc : '';
      if (found) {
        preview.setTint(found.tint);
      }
      if (this.selectedRace === 'Hybrid') {
        const mappedTone = hybridSkinToneByElement[el] || 'pale-gray';
        setSelectedSkinTone(mappedTone);
      }
      updateHybridPowerLabel();
      // Tattoo is creat-element driven (setSelectedCreatElement) — never touch it here
      elementButtons.forEach((btn, key) => {
        const el2 = elements.find((e) => e.name === key)!;
        btn.style.borderColor = key === el ? el2.color : 'rgba(148,163,184,0.2)';
        btn.style.background  = key === el ? 'rgba(30,30,60,0.7)' : 'rgba(15,23,42,0.5)';
        btn.style.color       = key === el ? el2.color : '#9ca3af';
      });
    };

    elements.slice(0, 4).forEach((el) => {
      const btn = document.createElement('button');
      btn.textContent = `${el.emoji} ${el.name}`;
      Object.assign(btn.style, {
        fontSize: '11px', padding: '4px 2px',
        background: 'rgba(15,23,42,0.5)', color: '#9ca3af',
        border: '1px solid rgba(148,163,184,0.2)', borderRadius: '4px',
        cursor: 'pointer', fontWeight: 'bold'
      });
      btn.addEventListener('click', () => setSelectedElement(el.name));
      elementButtons.set(el.name, btn);
      elementRow.appendChild(btn);
    });
    elements.slice(4).forEach((el) => {
      const btn = document.createElement('button');
      btn.textContent = `${el.emoji} ${el.name}`;
      Object.assign(btn.style, {
        fontSize: '11px', padding: '4px 2px',
        background: 'rgba(15,23,42,0.5)', color: '#9ca3af',
        border: '1px solid rgba(148,163,184,0.2)', borderRadius: '4px',
        cursor: 'pointer', fontWeight: 'bold'
      });
      btn.addEventListener('click', () => setSelectedElement(el.name));
      elementButtons.set(el.name, btn);
      elementRow2.appendChild(btn);
    });

    setSelectedElement('Fire');
    this.overlay.appendChild(elementRow);
    this.overlay.appendChild(elementRow2);
    this.overlay.appendChild(elementDescLabel);

    // ── WEAPON SELECTOR ──────────────────────────────────────────────
    const weaponHeader = this.createSectionHeader('Starting Weapons');
    this.overlay.appendChild(weaponHeader);

    const weapons = [
      { name: 'Iron Sword', icon: '⚔️', desc: 'Balanced damage' },
      { name: 'Ash Bow', icon: '🏹', desc: 'Ranged attacks' },
      { name: 'Ember Staff', icon: '🔱', desc: 'Magic damage' },
      { name: 'Tower Shield', icon: '🛡️', desc: 'Defense up' },
      { name: 'Trail Knife', icon: '🔪', desc: 'Quick strikes' },
      { name: 'Focus Orb', icon: '🔮', desc: 'Spell focus' },
      { name: 'Warhammer', icon: '🔨', desc: 'Heavy impact' },
      { name: 'Moon Spear', icon: '🗡️', desc: 'Reach control' },
      { name: 'Rune Tome', icon: '📘', desc: 'Arcane utility' },
      { name: 'Twin Chakrams', icon: '🌀', desc: 'Rapid throws' }
    ];

    const weaponRow = document.createElement('div');
    Object.assign(weaponRow.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '6px',
      width: '100%'
    });

    const weaponButtons = new Map<string, HTMLButtonElement>();
    const setWeaponSelected = (weaponName: string) => {
      const idx = this.selectedWeapons.indexOf(weaponName);
      if (idx === -1) {
        this.selectedWeapons.push(weaponName);
      } else {
        this.selectedWeapons.splice(idx, 1);
      }
      weaponButtons.forEach((btn, key) => {
        btn.style.borderColor = this.selectedWeapons.includes(key) ? '#86efac' : 'rgba(148,163,184,0.3)';
        btn.style.background = this.selectedWeapons.includes(key) ? 'rgba(50, 100, 50, 0.6)' : 'rgba(15,23,42,0.7)';
      });
    };

    weapons.forEach((weapon) => {
      const weaponBtn = document.createElement('button');
      weaponBtn.textContent = `${weapon.icon}\n${weapon.name}`;
      Object.assign(weaponBtn.style, {
        fontSize: '10px',
        padding: '6px 4px',
        background: 'rgba(15,23,42,0.7)',
        color: '#d1d5db',
        border: '2px solid rgba(148,163,184,0.3)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        minHeight: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      });
      weaponBtn.title = weapon.desc;
      weaponBtn.addEventListener('click', () => setWeaponSelected(weapon.name));
      weaponButtons.set(weapon.name, weaponBtn);
      weaponRow.appendChild(weaponBtn);
    });
    this.overlay.appendChild(weaponRow);

    // ── CREAT BOND PREVIEW NOTE ────────────────────────────────────────
    const bondPreviewNote = document.createElement('div');
    Object.assign(bondPreviewNote.style, {
      background: 'rgba(7, 89, 133, 0.18)', border: '1px solid #0e7490',
      borderRadius: '7px', padding: '8px 12px', marginTop: '6px', width: '100%',
      boxSizing: 'border-box' as const
    });
    bondPreviewNote.innerHTML = `
      <div style="font-size:11px;font-weight:bold;color:#a5f3fc;margin-bottom:3px;">🥚 Creat Companion (Found via Forest Trials or Sanctuary Trail)</div>
      <div style="font-size:10px;color:#94a3b8;line-height:1.5;">
        Your creat egg is discovered during Forest Trials. You'll name and hatch it in Haven.<br/>
        <span style="color:#86efac;">Match Hero Element</span> at hatch → <strong style="color:#fde68a;">85% starting bond</strong> (easier upkeep)<br/>
        <span style="color:#a78bfa;">Diverge from Hero Element</span> at hatch → <strong style="color:#a78bfa;">75% starting bond</strong> (unique powers, harder care)
      </div>
    `;
    this.overlay.appendChild(bondPreviewNote);

    // ── ACTION BUTTONS ──────────────────────────────────────────────
    const buttonRow = document.createElement('div');
    Object.assign(buttonRow.style, {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      width: '100%',
      marginTop: '8px'
    });

    const forgeBtn = document.createElement('button');
    forgeBtn.textContent = 'Forge Hero';
    Object.assign(forgeBtn.style, {
      fontSize: '14px',
      padding: '8px 12px',
      background: '#22c55e',
      color: '#08111f',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });

    forgeBtn.addEventListener('click', () => this.handleForgeHero());

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back';
    Object.assign(backBtn.style, {
      fontSize: '14px',
      padding: '8px 12px',
      background: 'rgba(107, 114, 128, 0.4)',
      color: '#d1d5db',
      border: '1px solid #4b5563',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });

    backBtn.addEventListener('click', () => {
      this._removeOverlay();
      this.scene.start('MainMenu');
    });

    buttonRow.appendChild(forgeBtn);
    buttonRow.appendChild(backBtn);
    this.overlay.appendChild(buttonRow);

    const container = document.getElementById('game');
    if (container) {
      container.appendChild(this.overlay);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this._removeOverlay());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this._removeOverlay());

    setSelectedClass(this.selectedClass);
    setSelectedRace('Human');
    setSelectedSkinTone('tan');
    updateSkinToneAvailability();
    setSelectedHairStyle('short');
    setSelectedHairColor('brown');
    setSelectedOriginTrait('Realm-born');
    setSelectedCombatDoctrine('Balanced');
    this.nameInput.focus();
  }

  private createSectionHeader(title: string): HTMLDivElement {
    const header = document.createElement('div');
    header.textContent = title;
    Object.assign(header.style, {
      color: '#cbd5e1',
      fontSize: '12px',
      fontWeight: 'bold',
      marginTop: '6px',
      marginBottom: '4px'
    });
    return header;
  }

  private createTagButton(label: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = label;
    Object.assign(button.style, {
      fontSize: '11px',
      padding: '5px 4px',
      background: 'rgba(15, 23, 42, 0.7)',
      color: '#e5e7eb',
      border: '2px solid rgba(148, 163, 184, 0.3)',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });
    return button;
  }

  private async handleForgeHero() {
    const nameInputValue = normalizeDisplayName(this.nameInput.value.trim() || 'Hero');
    const heroNameError = validateDisplayName(nameInputValue, 'Hero name');
    if (heroNameError) {
      this.messageDiv.textContent = heroNameError;
      this.messageDiv.style.color = '#ef4444';
      return;
    }
    const name = nameInputValue;

    if (this.selectedWeapons.length === 0) {
      this.messageDiv.textContent = 'Please select at least one weapon';
      this.messageDiv.style.color = '#ef4444';
      return;
    }

    try {
      // Require an authenticated session
      const accessToken = gameRegistry.accessToken;
      if (!gameRegistry.currentUserId || !accessToken) {
        this.messageDiv.textContent = 'Not logged in. Please sign in first.';
        this.messageDiv.style.color = '#ef4444';
        return;
      }

      // Enforce MAX_HEROES roster limit before attempting creation
      try {
        const countRes = await fetch(apiUrl('/users/me/hero-count'), {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (countRes.ok) {
          const { count } = await countRes.json();
          if (count >= MAX_HEROES) {
            this.messageDiv.textContent = `Hero limit reached (${MAX_HEROES} max). Delete a hero to create a new one.`;
            this.messageDiv.style.color = '#ef4444';
            return;
          }
        }
      } catch {
        // Offline or server down — allow creation locally, server will enforce on its side
      }

      // Save hero to backend
      const response = await fetch(apiUrl('/heroes/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          heroData: {
            name,
            class: this.selectedClass,
            element: this.selectedElement,
            race: this.selectedRace === 'Hybrid' ? `Awakened Human (${this.selectedHybridLineage})` : 'Human',
            skinTone: this.selectedSkinTone,
            hairStyle: this.selectedHairStyle,
            hairColor: this.selectedHairColor,
            originTrait: this.selectedOriginTrait,
            combatDoctrine: this.selectedCombatDoctrine,
            selectedWeapons: this.selectedWeapons
            ,
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.messageDiv.textContent = data.error || 'Failed to create hero';
        this.messageDiv.style.color = '#ef4444';
        return;
      }

      // Creat companion comes from Forest Trials only and is not pre-set at hero creation.
      // Awakening path determines tattoo/skin aesthetic while the actual creat egg is found in the wild.
      const isHybrid = this.selectedRace === 'Hybrid';

      // Update registry with hero data
      gameRegistry.setHero(data.hero.id, {
        name,
        class: this.selectedClass,
        element: this.selectedElement,
        race: this.selectedRace === 'Hybrid' ? `Awakened Human (${this.selectedHybridLineage})` : 'Human',
        skinTone: this.selectedSkinTone,
        hairStyle: this.selectedHairStyle,
        hairColor: this.selectedHairColor,
        originTrait: this.selectedOriginTrait,
        combatDoctrine: this.selectedCombatDoctrine,
        selectedWeapons: this.selectedWeapons,
        tattoo: isHybrid ? this.selectedHybridElement : ''
        // creatElement, creatCompatibility, startingBond are set at hatch time in Haven
        // after the hero finds a Creat Egg in Forest Trials
      });

      // Set creat care defaults (no creat yet — egg found in Forest)
      gameRegistry.creatHunger = 100;
      gameRegistry.creatLastFedAt = Date.now();
      gameRegistry.creatLastCaredAt = Date.now();
      gameRegistry.hasCreatEgg = false;
      gameRegistry.hasHatchedCreat = false;
      gameRegistry.creatStage = 'none';
      gameRegistry.creatElement = '';
      gameRegistry.creatName = '';
      gameRegistry.creatSpecies = '';
      gameRegistry.creatBond = 0;
      gameRegistry.creatCompatibility = 'match';
      gameRegistry.creatInventory = [];
      gameRegistry.heroLevel = 1;
      gameRegistry.storyModeCompleted = false;
      gameRegistry.saveToLocalStorage();

      // Set starter inventory
      // Universal starter loadout (Option C: all heroes get same base items)
      const starterInventory = UNIVERSAL_STARTER_LOADOUT.map((itemId) => {
        const itemData = getItemById(itemId);
        return {
          id: itemId,
          name: itemData?.name || itemId,
          equipped: itemId === 'weapon-iron-sword' ? true : false
        };
      });

      const existingInventory = gameRegistry.inventory || [];
      const mergedInventory = [...existingInventory];
      for (const starterItem of starterInventory) {
        const alreadyOwned = mergedInventory.some((ownedItem) => ownedItem.id === starterItem.id);
        if (!alreadyOwned) {
          mergedInventory.push(starterItem);
        }
      }

      gameRegistry.inventory = mergedInventory;
      gameRegistry.gold = Math.max(gameRegistry.gold, 25);
      gameRegistry.setHavenPathsUnlocked(true);
      gameRegistry.saveToLocalStorage();

      // Also update Phaser registry for compatibility
      this.registry.set('heroName', name);
      this.registry.set('heroClass', this.selectedClass);
      this.registry.set('heroElement', this.selectedElement);
      this.registry.set('heroRace', this.selectedRace === 'Hybrid' ? `Awakened Human (${this.selectedHybridLineage})` : 'Human');
      this.registry.set('heroSkinTone', this.selectedSkinTone);
      this.registry.set('heroHairStyle', this.selectedHairStyle);
      this.registry.set('heroHairColor', this.selectedHairColor);
      this.registry.set('heroOriginTrait', this.selectedOriginTrait);
      this.registry.set('heroCombatDoctrine', this.selectedCombatDoctrine);
      this.registry.set('inventory', mergedInventory);
      this.registry.set('gold', Math.max((this.registry.get('gold') as number) || 0, gameRegistry.gold));
      this.registry.set('soulshards', gameRegistry.soulshards);
      this.registry.set('greenGems', gameRegistry.greenGems);
      this.registry.set('redGems', gameRegistry.redGems);
      this.registry.set('emberFruit', gameRegistry.emberFruit);
      this.registry.set('crownFragments', gameRegistry.crownFragments);
      this.registry.set('creatBond', 0);
      this.registry.set('creatHunger', 100);
      this.registry.set('creatElement', '');
      this.registry.set('creatSpecies', '');
      this.registry.set('creatCompatibility', 'match');
      this.registry.set('creatLastFedAt', Date.now());
      this.registry.set('creatLastCaredAt', Date.now());

      this._removeOverlay();
      
      this.scene.start('ChooseBeginning');
    } catch (err: any) {
      this.messageDiv.textContent = 'Error: ' + err.message;
      this.messageDiv.style.color = '#ef4444';
    }
  }

  private _removeOverlay() {
    this.overlay?.parentElement?.removeChild(this.overlay);
  }

  shutdown() {
    this._removeOverlay();
  }
}

