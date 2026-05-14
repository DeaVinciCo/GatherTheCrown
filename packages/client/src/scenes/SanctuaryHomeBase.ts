import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { InventoryMenu, InventoryItem } from '../ui/InventoryMenu';
import { SANCTUARY_NAMESETS } from '../data/SanctuaryLocationReference';
import { getMainlandTravelUiOptions } from '../data/LocationSystem';
import AudioManager from '../audio/AudioManager';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import { gainPrepXp } from '../systems/PrepProgression';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';

export default class SanctuaryHomeBase extends Phaser.Scene {
  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'SanctuaryHomeBase', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu()
  });

  constructor() {
    super('SanctuaryHomeBase');
  }

  create() {
    const { width, height } = this.scale;
    gameRegistry.loadFromLocalStorage();
    gameRegistry.setHomeBaseUnlocked(true);
    this.registry.set('homeBaseUnlocked', true);
    AudioManager.attachScene(this);
    AudioManager.playAmbientLoop('day');

    if (!gameRegistry.homeBaseNameOptions || gameRegistry.homeBaseNameOptions.length < 10) {
      gameRegistry.refreshHomeBaseNameOptions();
    }

    const homeBaseName = gameRegistry.homeBaseName || 'Sanctuary';
    const homeBaseRegion = gameRegistry.homeBaseRegionName || SANCTUARY_NAMESETS.regionCasual;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x06141a, 0x0f172a, 0x12303d, 0x08111f, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 52, `${homeBaseName} - Home Base`, {
      color: '#a5f3fc',
      fontSize: '30px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 104, `${homeBaseRegion} is a shared lore location with a personal home-base layout for each player.`, {
      color: '#cbd5e1',
      fontSize: '13px',
      align: 'center',
      wordWrap: { width: 620 }
    }).setOrigin(0.5);

    this.add.text(width / 2, 126, 'Your clearing sits on the northern cliff approach, reached by Greenwood Trail between Northwatch Cliffs and The Old Overlook.', {
      color: '#93c5fd',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: 660 }
    }).setOrigin(0.5);

    const readinessText = this.add.text(width / 2, 146, '', {
      color: '#67e8f9',
      fontSize: '13px',
      align: 'center'
    }).setOrigin(0.5);

    const dayPlanText = this.add.text(width / 2, 170, '', {
      color: '#e2e8f0',
      fontSize: '12px',
      align: 'center',
      wordWrap: { width: 640 }
    }).setOrigin(0.5);

    const panel = this.add.rectangle(width / 2, 316, 560, 286, 0x0f172a, 0.78)
      .setStrokeStyle(2, 0x06b6d4, 0.8);
    panel.setDepth(1);

    const points = [
      'Recover, gather, and craft before taking harder routes.',
      'Home Base flow: rest 2 days before opening story work and heavier battle lanes.',
      'Instant Home Base return works only at safe markers, shrines, camps, and Sanctuary portals.',
      'If return is unavailable: Find a Sanctuary Portal or safe marker to go home.',
      'Forestry Trail runs are lighter pressure loops for resources and scouting.',
      'Forest Trials is the guided combat route with Gentle, Rider, and Sovereign difficulties.',
      'Both paths can lead to Creat Egg discovery, then return here to prep your next move.'
    ];

    points.forEach((point, index) => {
      this.add.text(width / 2, 208 + index * 32, `• ${point}`, {
        color: '#e2e8f0',
        fontSize: '12px',
        wordWrap: { width: 470 }
      }).setOrigin(0.5);
    });

    this.add.text(width / 2, 452, 'Both starting paths stay valid. The loop is explore -> return -> prepare -> advance.', {
      color: '#67e8f9',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: 470 }
    }).setOrigin(0.5);

    const actionFeedback = this.add.text(width / 2, height - 190, '', {
      color: '#cbd5e1',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: 620 }
    }).setOrigin(0.5);

    const checklistText = this.add.text(width / 2, height - 164, '', {
      color: '#93c5fd',
      fontSize: '11px',
      align: 'center',
      wordWrap: { width: 640 }
    }).setOrigin(0.5);

    const setButtonEnabled = (btn: Phaser.GameObjects.Text, enabled: boolean, activeStyle: { color: string; backgroundColor: string }) => {
      btn.setStyle(enabled
        ? activeStyle
        : { color: '#94a3b8', backgroundColor: '#111827' });
      if (enabled) {
        if (!btn.input) btn.setInteractive({ useHandCursor: true });
        btn.setAlpha(1);
      } else {
        btn.disableInteractive();
        btn.setAlpha(0.7);
      }
    };

    if (!gameRegistry.homeBaseNameChosen) {
      this.add.text(width / 2, 146, 'Choose a Home Base Name', {
        color: '#fde68a',
        fontSize: '14px',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const options = gameRegistry.homeBaseNameOptions.slice(0, 10);
      options.forEach((name, index) => {
        const col = index % 5;
        const row = Math.floor(index / 5);
        const x = width / 2 - 228 + col * 114;
        const y = 170 + row * 28;
        const btn = this.add.text(x, y, name, {
          color: '#e2e8f0',
          fontSize: '11px',
          backgroundColor: '#0f172a'
        }).setPadding(6, 3).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
          gameRegistry.setHomeBaseName(name);
          gameRegistry.setHomeBaseNameChosen(true);
          this.scene.restart();
        });
      });
    }

    const inspectBtn = this.add.text(width / 2 - 164, height - 124, 'Inspect Greenwood Clearing Needs', {
      color: '#f1f5f9',
      fontSize: '12px',
      backgroundColor: '#334155'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    inspectBtn.on('pointerdown', () => {
      AudioManager.playPickup('item');
      if (gameRegistry.homeBaseRestDays !== 0) {
        actionFeedback.setText('Inspection was a Day 1 task for the Greenwood Clearing. Move to Day 2 prep now.');
        actionFeedback.setColor('#93c5fd');
        return;
      }
      gameRegistry.setHomeBaseDay1Inspected(true);
      actionFeedback.setText('Day 1 complete step: you inspected the northern clearing, sorted repair priorities, and mapped missing supplies.');
      actionFeedback.setColor('#93c5fd');
      refreshPrepUI();
    });

    const gatherBtn = this.add.text(width / 2 + 164, height - 124, 'Gather Missing Supplies', {
      color: '#d1fae5',
      fontSize: '12px',
      backgroundColor: '#14532d'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    gatherBtn.on('pointerdown', () => {
      AudioManager.playPickup('material');
      if (gameRegistry.homeBaseRestDays !== 0) {
        actionFeedback.setText('Supply gathering for Day 1 is already done. Continue Greenwood Trail prep tasks.');
        actionFeedback.setColor('#a7f3d0');
        return;
      }

      gameRegistry.setHomeBaseDay1SuppliesGathered(true);
      gameRegistry.setEmberFruit(gameRegistry.emberFruit + 2);
      gameRegistry.setGold(gameRegistry.gold + 8);
      this.registry.set('emberFruit', gameRegistry.emberFruit);
      this.registry.set('gold', gameRegistry.gold);
      actionFeedback.setText('Day 1 complete step: supplies secured (+2 Ember Fruit, +8 Gold). The Greenwood Clearing can now settle for the night.');
      actionFeedback.setColor('#a7f3d0');
      refreshPrepUI();
    });

    const craftBtn = this.add.text(width / 2 - 164, height - 92, 'Craft Travel Kit', {
      color: '#fef3c7',
      fontSize: '12px',
      backgroundColor: '#78350f'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    craftBtn.on('pointerdown', () => {
      AudioManager.playPickup('material');
      if (gameRegistry.homeBaseRestDays < 1) {
        actionFeedback.setText('Crafting travel prep is a Day 2 action. Complete Day 1 at the Greenwood Clearing and rest first.');
        actionFeedback.setColor('#fcd34d');
        return;
      }
      if (gameRegistry.homeBaseRestDays >= 2) {
        actionFeedback.setText('Travel kit already prepared. Story travel is unlocked from the northern clearing.');
        actionFeedback.setColor('#86efac');
        return;
      }
      gameRegistry.setHomeBaseDay2Crafted(true);
      actionFeedback.setText('Day 2 complete step: travel kit crafted, gear repaired, and provisions packed for the cliffside road.');
      actionFeedback.setColor('#fcd34d');
      refreshPrepUI();
    });

    const isleWalkBtn = this.add.text(width / 2, height - 108, 'Walk Sanctuary Isle (District Routes + Residential Paths)', {
      color: '#dbeafe',
      fontSize: '13px',
      backgroundColor: '#1e40af'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    isleWalkBtn.on('pointerdown', () => {
      this.scene.start('SanctuaryIsleOverworld');
    });

    const eggCareBtn = this.add.text(width / 2 + 164, height - 92, 'Care for Egg / Secure Nest', {
      color: '#e9d5ff',
      fontSize: '12px',
      backgroundColor: '#4c1d95'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    eggCareBtn.on('pointerdown', () => {
      AudioManager.playPickup('item');
      if (gameRegistry.homeBaseRestDays < 1) {
        actionFeedback.setText('Egg care and travel nesting are Day 2 actions after the first prep day at Greenwood Clearing.');
        actionFeedback.setColor('#c4b5fd');
        return;
      }
      if (!gameRegistry.hasCreatEgg) {
        actionFeedback.setText('No egg in camp yet. Nesting cradle prepared anyway so future finds can be protected at the clearing.');
        actionFeedback.setColor('#c4b5fd');
      } else {
        actionFeedback.setText('Egg cared for and secured for travel. Bond prep complete for departure from the cliffside clearing.');
        actionFeedback.setColor('#c4b5fd');
      }
      gameRegistry.setHomeBaseDay2EggCared(true);
      refreshPrepUI();
    });

    const forestryBtn = this.add.text(width / 2, height - 60, 'Sanctuary Trail Run (Greenwood Trail Outbound + Return + Egg Final Stretch)', {
      color: '#d1fae5',
      fontSize: '13px',
      backgroundColor: '#134e4a'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    forestryBtn.on('pointerdown', () => {
      AudioManager.playPickup('quest');
      this.scene.start('SanctuaryTrail');
    });

    const townBtn = this.add.text(width / 2, height - 76, `Visit ${SANCTUARY_NAMESETS.townCasual} (${SANCTUARY_NAMESETS.tavern}, ${SANCTUARY_NAMESETS.tradingPoste})`, {
      color: '#dbeafe',
      fontSize: '13px',
      backgroundColor: '#1e3a8a'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    townBtn.on('pointerdown', () => {
      AudioManager.playPickup('quest');
      this.scene.start('SanctuaryTown');
    });

    const fishBtn = this.add.text(width / 2, height - 44, 'Fish Sanctuary Waters (Any Nearby Water Edge)', {
      color: '#bfdbfe',
      fontSize: '12px',
      backgroundColor: '#1e3a8a'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    fishBtn.on('pointerdown', () => {
      AudioManager.playFishing('catch');
      const fish = Phaser.Math.Between(1, 3);
      const cleanWater = Phaser.Math.Between(1, 2);
      const prepXp = 5;
      const prep = gainPrepXp(this.registry, prepXp, 'sanctuary-homebase:fishing');
      gameRegistry.setGold(gameRegistry.gold + fish * 2);
      this.registry.set('gold', gameRegistry.gold);
      actionFeedback.setText(`Waterside fishing complete: +${fish} fish, +${cleanWater} clean water, +${prepXp} Prep XP (Prep Lv.${prep.level}).`);
      actionFeedback.setColor('#93c5fd');
    });

    const restBtn = this.add.text(width / 2, height - 28, 'Rest and Close the Day', {
      color: '#fef9c3',
      fontSize: '13px',
      backgroundColor: '#3f3f46'
    }).setOrigin(0.5).setPadding(8, 4).setInteractive({ useHandCursor: true });

    restBtn.on('pointerdown', () => {
      AudioManager.playPickup('item');
      if ((gameRegistry.homeBaseRestDays || 0) >= 2) {
        actionFeedback.setText('Readiness already complete. You can run Forestry Trail or begin Story Work & Battles.');
        actionFeedback.setColor('#86efac');
        return;
      }

      const currentDay = gameRegistry.homeBaseRestDays || 0;
      const pending = gameRegistry.getHomeBasePendingTasks(currentDay);
      if (pending.length > 0) {
        actionFeedback.setText(`Complete prep first: ${pending.join(' + ')}.`);
        actionFeedback.setColor('#fda4af');
        refreshPrepUI();
        return;
      }

      const advanced = gameRegistry.completeHomeBaseDayIfReady();
      if (!advanced) {
        actionFeedback.setText('Day could not advance. Finish required prep tasks first.');
        actionFeedback.setColor('#fda4af');
        refreshPrepUI();
        return;
      }

      const newDay = gameRegistry.homeBaseRestDays || 0;
      if (newDay >= 2) {
        actionFeedback.setText('Day 2 complete. Travel packs are ready and Story Work & Battles are now unlocked.');
        actionFeedback.setColor('#86efac');
      } else {
        actionFeedback.setText('Day 1 complete. At dawn, begin crafting, egg care, and final travel prep.');
        actionFeedback.setColor('#fde68a');
      }
      refreshPrepUI();
    });

    const storyBtn = this.add.text(width - 12, 16, 'Begin Story Work & Battles', {
      color: '#e2e8f0',
      fontSize: '13px',
      backgroundColor: '#1f2937'
    }).setOrigin(1, 0).setPadding(8, 4);

    const refreshPrepUI = () => {
      const days = gameRegistry.homeBaseRestDays || 0;
      const daysLeft = Math.max(0, 2 - days);
      const ready = !!gameRegistry.homeBaseStoryReady || days >= 2;

      if (ready) {
        readinessText.setText('Home Base Readiness complete. Story Work & Battles unlocked.');
        readinessText.setColor('#86efac');
        dayPlanText.setText('Departure plan complete: travel is open. You can still run Forestry Trail loops for extra supplies before leaving.');
      } else if (days === 0) {
        readinessText.setText(`Home Base Readiness: Day ${days}/2 complete. ${daysLeft} prep days remain.`);
        readinessText.setColor('#67e8f9');
        dayPlanText.setText('Day 1 plan: settle in, inspect damage, and gather missing supplies before resting.');
      } else {
        readinessText.setText(`Home Base Readiness: Day ${days}/2 complete. ${daysLeft} prep day remains.`);
        readinessText.setColor('#67e8f9');
        dayPlanText.setText('Day 2 plan: craft travel essentials, rest, care for egg (or secure nest gear), and prepare departure route.');
      }

      const day1Checklist = [
        `${gameRegistry.homeBaseDay1Inspected ? '✓' : '•'} Inspect Home Base Needs`,
        `${gameRegistry.homeBaseDay1SuppliesGathered ? '✓' : '•'} Gather Missing Supplies`
      ];
      const day2Checklist = [
        `${gameRegistry.homeBaseDay2Crafted ? '✓' : '•'} Craft Travel Kit`,
        `${gameRegistry.homeBaseDay2EggCared ? '✓' : '•'} Care for Egg / Secure Nest`
      ];

      if (days === 0) {
        checklistText.setText(`Day 1 Checklist: ${day1Checklist.join('   |   ')}`);
      } else if (days === 1) {
        checklistText.setText(`Day 2 Checklist: ${day2Checklist.join('   |   ')}`);
      } else {
        checklistText.setText('Prep complete: Home Base settled, supplies packed, and route plans ready.');
      }

      setButtonEnabled(inspectBtn, days === 0 && !gameRegistry.homeBaseDay1Inspected, { color: '#f1f5f9', backgroundColor: '#334155' });
      setButtonEnabled(gatherBtn, days === 0 && !gameRegistry.homeBaseDay1SuppliesGathered, { color: '#d1fae5', backgroundColor: '#14532d' });
      setButtonEnabled(craftBtn, days === 1 && !gameRegistry.homeBaseDay2Crafted, { color: '#fef3c7', backgroundColor: '#78350f' });
      setButtonEnabled(eggCareBtn, days === 1 && !gameRegistry.homeBaseDay2EggCared, { color: '#e9d5ff', backgroundColor: '#4c1d95' });
      setButtonEnabled(restBtn, days < 2, { color: '#fef9c3', backgroundColor: '#3f3f46' });

      if (ready) {
        storyBtn.setText('Begin Story Work & Battles');
        storyBtn.setStyle({ color: '#ecfeff', backgroundColor: '#0e7490' });
        if (!storyBtn.input) storyBtn.setInteractive({ useHandCursor: true });
      } else {
        storyBtn.setText(`Story Travel Locked (${days}/2 prep days complete)`);
        storyBtn.setStyle({ color: '#94a3b8', backgroundColor: '#111827' });
        storyBtn.disableInteractive();
      }
    };

    storyBtn.on('pointerdown', () => {
      if (!gameRegistry.homeBaseStoryReady && (gameRegistry.homeBaseRestDays || 0) < 2) {
        AudioManager.playDangerCue('low');
        return;
      }
      AudioManager.playPickup('quest');
      this.scene.start('StoryIntro');
    });

    const havenBtn = this.add.text(12, 16, '← Return to Haven', {
      color: '#e2e8f0',
      fontSize: '13px',
      backgroundColor: '#0f172a'
    }).setOrigin(0, 0).setPadding(8, 4).setInteractive({ useHandCursor: true });
    havenBtn.on('pointerdown', () => {
      AudioManager.playPickup('item');
      this.scene.start('HavenGrounds');
    });

    this.add.text(width - 10, 44, 'M=Map  I=Inventory  Shift=Chat', {
      color: '#64748b',
      fontSize: '11px'
    }).setOrigin(1, 0);

    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    refreshPrepUI();
  }

  private openInventory() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.inventory-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const items: InventoryItem[] = (this.registry.get('inventory') as InventoryItem[]) || [
      { id: 'travel-ration', name: 'Travel Ration', equipped: false },
      { id: 'field-bandage', name: 'Field Bandage', equipped: false },
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
    title.innerText = SANCTUARY_NAMESETS.regionOfficial;
    Object.assign(title.style, { color: '#a5f3fc', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const spots: Array<{ label: string; scene: string }> = [
      { label: `${SANCTUARY_NAMESETS.regionCasual} Home Base`, scene: 'SanctuaryHomeBase' },
      { label: `${SANCTUARY_NAMESETS.regionCasual} Overworld Walk`, scene: 'SanctuaryIsleOverworld' },
      { label: SANCTUARY_NAMESETS.townCasual, scene: 'SanctuaryTown' },
      { label: `${SANCTUARY_NAMESETS.regionCasual} Trail`, scene: 'SanctuaryTrail' },
      { label: 'Haven Grounds', scene: 'HavenGrounds' },
      { label: 'Forest Trials', scene: 'ForestZone' },
      { label: 'Story Intro', scene: 'StoryIntro' }
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

    const mainlandTitle = document.createElement('div');
    mainlandTitle.innerText = 'Mainland Kingdom Routes';
    Object.assign(mainlandTitle.style, {
      color: '#fcd34d',
      fontWeight: 'bold',
      marginTop: '10px',
      marginBottom: '6px',
      borderTop: '1px solid #334155',
      paddingTop: '8px'
    });
    root.appendChild(mainlandTitle);

    const mainlandRoutes = getMainlandTravelUiOptions();
    for (const route of mainlandRoutes) {
      const btn = document.createElement('button');
      btn.innerText = `${route.kingdomName} - ${route.modeLabel} (${route.standardDays}d)`;
      Object.assign(btn.style, {
        display: 'block',
        width: '100%',
        marginBottom: '6px',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #374151',
        background: route.mode === 'land_crossing' ? '#14532d' : '#1e3a8a',
        color: '#e5e7eb',
        cursor: 'pointer',
        textAlign: 'left'
      });
      btn.title = route.summary;
      btn.onclick = () => {
        this.registry.set('activeMainlandKingdom', route.kingdomId);
        this.registry.set('selectedMainlandRouteId', route.routeId);
        this.registry.set('selectedMainlandTravelMode', route.mode);
        this.registry.set('selectedMainlandTravelDays', route.standardDays);
        root.remove();
        this.scene.start('SanctuaryIsleOverworld');
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
      sceneLabel: 'Sanctuary',
      scopeKey: 'sanctuary-home-base',
      registry: this.registry,
    });
  }
}
