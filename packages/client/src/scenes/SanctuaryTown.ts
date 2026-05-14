import Phaser from 'phaser';
import { SANCTUARY_NAMESETS } from '../data/SanctuaryLocationReference';
import { getFamiliesForShift } from '../data/SanctuaryFamilyRoster';
import {
  SANCTUARY_DISTRICT_STAFF,
  getNpcFlavorLine,
  getQuickConvo,
  getSanctuaryShiftByHour,
  getScheduledPresence,
  getTideJaeDuoBanter,
  type SanctuaryDistrictId,
  type SanctuaryShift,
} from '../data/SanctuaryNpcRoster';
import {
  SANCTUARY_STREETS,
  getStreetPurpose,
  getPrimaryStreetsForShift,
  type SanctuaryStreetKey,
} from '../data/SanctuaryStreetRotations';
import { SettingsPanel } from '../ui/SettingsPanel';
import { InventoryMenu, type InventoryItem } from '../ui/InventoryMenu';
import { KingdomQuestMenu } from '../ui/KingdomQuestMenu';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import AudioManager from '../audio/AudioManager';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';
import { buildKingdomQuestMenuEntries } from '../systems/KingdomQuestMenuModel';
import { canOpenKingdomDoor } from '../systems/KingdomAccessControl';
import type { FourKingdomId } from '@game/shared';
import { getMainlandTravelUiOptions } from '../data/LocationSystem';

interface AmbientNpc {
  sprite: Phaser.GameObjects.Arc;
  targetX: number;
  targetY: number;
  speed: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface SocialNpc {
  x: number;
  y: number;
  name: string;
  role: string;
  prompt: string;
  districtId?: SanctuaryDistrictId;
  rewardHint?: string;
}

interface FamilyAnchor {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  labelX: number;
  labelY: number;
}

interface FishingSpot {
  x: number;
  y: number;
  label: string;
  fishPool: string[];
}

// ─── Town Request Types ───────────────────────────────────────────────────────
type TownRequestType = 'trinket' | 'ingredient' | 'delivery';
type TownRequestStatus = 'queued' | 'available' | 'active' | 'complete';

interface TownRequest {
  id: string;
  type: TownRequestType;
  npcName: string;           // who gives the request
  targetNpcName?: string;    // delivery: who receives
  itemName: string;          // trinket / ingredient / note name
  street: string;
  routeHint: string;
  gcReward: number;
  materialReward: string;
  status: TownRequestStatus;
  // world marker for collectible / gather node
  markerX?: number;
  markerY?: number;
  markerObj?: Phaser.GameObjects.Arc;
  markerPulse?: Phaser.GameObjects.Arc;
  markerLabel?: Phaser.GameObjects.Text;
}

interface ResidentialCluster {
  id: string;
  title: string;
  districtLabel: string;
  street: string;
  doorX: number;
  doorY: number;
  homes: string[];
  morningUse: string;
  afternoonUse: string;
  eveningUse: string;
  marker: Phaser.GameObjects.Arc;
}

interface ShiftFlowProfile {
  ambientCount: number;
  laneMinY: number;
  laneMaxY: number;
  minSpeed: number;
  maxSpeed: number;
  summary: string;
}

interface StreetSignRender {
  key: SanctuaryStreetKey;
  nameText: Phaser.GameObjects.Text;
  purposeText: Phaser.GameObjects.Text;
}

type InteriorActionId = 'sit' | 'inspect' | 'dialog';

interface RouteGuideNode {
  x: number;
  y: number;
}

export default class SanctuaryTown extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; f: Phaser.Input.Keyboard.Key; q: Phaser.Input.Keyboard.Key };
  private settingsPanel?: SettingsPanel;
  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'SanctuaryTown', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu(),
    onSettings: () => this.openSettings()
  });

  private ambientNpcs: AmbientNpc[] = [];
  private socialNpcs: Array<SocialNpc & { marker: Phaser.GameObjects.Arc }> = [];
  private fishingSpots: FishingSpot[] = [];

  private messageText!: Phaser.GameObjects.Text;
  private helpText!: Phaser.GameObjects.Text;
  private activeNpcIndex = -1;
  private activeResidentialIndex = -1;
  private prevHeroX = 220;
  private prevHeroY = 560;
  private cameraZoom = 1.26;
  private readonly cameraZoomMin = 1.14;
  private readonly cameraZoomMax = 1.38;
  private residentialClusters: ResidentialCluster[] = [];
  private interiorBackdrop?: Phaser.GameObjects.Rectangle;
  private interiorPanel?: Phaser.GameObjects.Rectangle;
  private interiorTexts: Phaser.GameObjects.Text[] = [];
  private inInterior = false;
  private activeInteriorCluster?: ResidentialCluster;
  private interiorActionHints: Phaser.GameObjects.Text[] = [];
  private interiorActionKinds: InteriorActionId[] = [];
  private interiorActionCooldowns: Record<InteriorActionId, number> = { sit: 0, inspect: 0, dialog: 0 };
  private interiorRewardLog: string[] = [];
  private interiorRewardLogText?: Phaser.GameObjects.Text;
  private streetSignRenders: StreetSignRender[] = [];
  private shiftInfoText?: Phaser.GameObjects.Text;
  private shiftSummaryText?: Phaser.GameObjects.Text;
  private shiftTransitionOverlay?: Phaser.GameObjects.Rectangle;
  private shiftCycleStartMs = 0;
  private shiftCycleMs = 120000;
  private routeGuideLines: Phaser.GameObjects.Line[] = [];
  private routeGuideArrows: Phaser.GameObjects.Triangle[] = [];
  private routeGuideDots: Phaser.GameObjects.Arc[] = [];
  private routeGuideText?: Phaser.GameObjects.Text;
  private readonly shiftFlowProfile: Record<SanctuaryShift, ShiftFlowProfile> = {
    morning: {
      ambientCount: 10,
      laneMinY: 420,
      laneMaxY: 680,
      minSpeed: 24,
      maxSpeed: 40,
      summary: 'Morning setup flow: dock crews and school routes form east-west streams.'
    },
    afternoon: {
      ambientCount: 15,
      laneMinY: 450,
      laneMaxY: 760,
      minSpeed: 30,
      maxSpeed: 48,
      summary: 'Afternoon peak flow: market and training lanes are the busiest corridors.'
    },
    evening: {
      ambientCount: 8,
      laneMinY: 500,
      laneMaxY: 740,
      minSpeed: 18,
      maxSpeed: 32,
      summary: 'Evening wind-down flow: tavern and quiet pier routes dominate foot traffic.'
    }
  };

  // ─── Town Request state ───────────────────────────────────────────────────
  private townRequests: TownRequest[] = [];
  private requestBoardStatusText?: Phaser.GameObjects.Text;
  private carriedNoteFor = '';    // delivery: name of target NPC
  private heldTrinketId = '';     // trinket: which request id
  private ingredientGatheredId = ''; // ingredient: which request id
  private readonly requestCadence = {
    visiblePool: 4,
    maxActive: 2
  };
  private townShift: SanctuaryShift = 'morning';
  private townWeekday = 'Monday';
  private requestContacts = {
    trinket: 'Juniper',
    ingredient: 'Saph',
    deliveryFrom: 'Elric',
    deliveryTo: 'Talli'
  };

  private readonly ambientKidLines = [
    'Did you see the rider\'s boots?',
    'My teacher says hatchlings need quiet hands.',
    'I\'m not scared of crawlers. I\'m only... watchful.',
    'Tide said the sea gets moody. Can water be moody?',
    'I drew a hatchling with four crowns. It\'s very brave.',
  ];

  private readonly ambientTeenLines = [
    'Open Ring is easy until Rowan actually starts watching.',
    'I could take Gentle Trail. Probably.',
    'Don\'t tell Lorn I said Sovereign sounds exciting.',
    'One day I\'m leaving past the Isle road. Just not today.',
    'If Kirra can do it, maybe we can too.',
    'My parents never talk about before we were here. Like there was a whole other chapter.',
    'Old Ren says the tavern used to be half empty. I cannot picture that.',
    'Tide looks at the docks like he is remembering something.',
    'There must have been a reason people stopped coming here for a while. Nobody says what it was.',
    'Harbor Jae calls it "the leaner stretch." I do not know exactly when that was.',
  ];

  private readonly ambientFieldYearsLines = [
    'Field Years this week: docks, then map routes, then hallow care.',
    'Rowan says wooden staves are for form, not for showing off.',
    'I am on messenger duty after we finish trail markers.',
    'Kaelis said breathe first, then move. Awakening Yard felt easier after that.',
    'We rotate every few days. I like mapmaking best.',
    'Gentry says Field Years is where we learn to be useful before we learn to be impressive.',
  ];

  private readonly ambientApprenticeLines = [
    'Corren says Smitty can hear bad steel from across the forge.',
    'Palla runs half the island before noon.',
    'Kirra trains like she\'s got something to prove.',
    'Lorn still talks to us like we\'re students. He\'s barely older.',
    'Keep your hands steady first. Speed comes later.',
    'My folks were already here when the routes reopened. They do not say much about what it was like before.',
    'You notice there are no one our age? Like, no twenty-year-olds. Everyone\'s either younger or older.',
    'Wren says the old crowd has a different kind of tired. Not bad. Just — they remember something.',
    'Luma came over on the first merchant run after the closure. She says the dock felt strange empty.',
    'We grew up here thinking this was just how it always was. Turns out the towne had a harder decade.',
  ];

  private readonly familyAnchors: Record<'market' | 'fishersWalk' | 'quietPier' | 'hatchlingHallow' | 'openRing' | 'tavern', FamilyAnchor> = {
    market: { minX: 720, maxX: 940, minY: 250, maxY: 380, labelX: 840, labelY: 355 },
    fishersWalk: { minX: 800, maxX: 980, minY: 980, maxY: 1120, labelX: 900, labelY: 1045 },
    quietPier: { minX: 1240, maxX: 1400, minY: 980, maxY: 1120, labelX: 1320, labelY: 1035 },
    hatchlingHallow: { minX: 1320, maxX: 1580, minY: 710, maxY: 900, labelX: 1450, labelY: 850 },
    openRing: { minX: 220, maxX: 420, minY: 710, maxY: 900, labelX: 300, labelY: 850 },
    tavern: { minX: 150, maxX: 340, minY: 220, maxY: 370, labelX: 240, labelY: 340 },
  };

  constructor() {
    super('SanctuaryTown');
  }

  private setCameraZoom(nextZoom: number) {
    this.cameraZoom = Phaser.Math.Clamp(nextZoom, this.cameraZoomMin, this.cameraZoomMax);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  create() {
    const { width, height } = this.scale;
    const now = new Date();
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.townWeekday = weekDays[now.getDay()] ?? 'Monday';
    this.townShift = getSanctuaryShiftByHour(now.getHours());
    this.shiftCycleStartMs = Date.now();

    this.cameras.main.setBounds(0, 0, 1800, 1200);
    this.drawTownLayout();
    this.drawStreetPathSignage();
    AudioManager.attachScene(this);
    AudioManager.playAmbientLoop(this.townShift === 'evening' ? 'night' : 'day');

    this.hero = this.add.circle(220, 560, 14, 0xf8fafc, 1).setDepth(20);
    this.add.circle(220, 572, 18, 0x000000, 0.2).setDepth(3);
    this.prevHeroX = this.hero.x;
    this.prevHeroY = this.hero.y;

    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,E,F,Q') as { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; f: Phaser.Input.Keyboard.Key; q: Phaser.Input.Keyboard.Key };

    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1, -12, 58);
    this.setCameraZoom(this.cameraZoom);

    this.spawnPopulation();
    this.spawnResidentialClusters();
    this.initTownRequests();
    this.seedRequestCadence();
    this.drawRequestBoard();
    this.createHud(width, height);
    this.shiftTransitionOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0)
      .setDepth(80)
      .setScrollFactor(0)
      .setVisible(false);
    this.startAmbientIdleChatter();

    this.input.keyboard?.on('keydown-E', () => {
      if (this.inInterior) {
        this.closeInteriorView();
        return;
      }
      this.tryInteract();
    });
    this.input.keyboard?.on('keydown-F', () => this.tryFishSpot());
    this.input.keyboard?.on('keydown-Q', () => this.openKingdomQuestMenu());
    this.input.keyboard?.on('keydown-O', () => this.openSettings());
    this.input.keyboard?.on('keydown-ONE', () => {
      if (this.inInterior) {
        this.triggerInteriorAction('sit');
        return;
      }
      this.setCameraZoom(1.14);
    });
    this.input.keyboard?.on('keydown-TWO', () => {
      if (this.inInterior) {
        this.triggerInteriorAction('inspect');
        return;
      }
      this.setCameraZoom(1.26);
    });
    this.input.keyboard?.on('keydown-THREE', () => {
      if (this.inInterior) {
        this.triggerInteriorAction('dialog');
        return;
      }
      this.setCameraZoom(1.36);
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.inInterior) {
        this.closeInteriorView();
        return;
      }
      this.scene.start('SanctuaryHomeBase');
    });

    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    this.showMessage(`Welcome to ${SANCTUARY_NAMESETS.townCasual}. ${this.townWeekday} ${this.townShift} shift is active. Use your discernment.`, '#93c5fd');
  }

  update(_time: number, delta: number) {
    this.updateShiftCycle();

    if (this.inInterior) {
      this.updateInteriorActionCooldowns(delta);
      this.updateInteriorLogPanel();
      this.updateResidentialPrompt();
      return;
    }

    const speed = 175;
    const dt = delta / 1000;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.keys.a?.isDown) vx -= speed;
    if (this.cursors.right?.isDown || this.keys.d?.isDown) vx += speed;
    if (this.cursors.up?.isDown || this.keys.w?.isDown) vy -= speed;
    if (this.cursors.down?.isDown || this.keys.s?.isDown) vy += speed;

    const x = Phaser.Math.Clamp(this.hero.x + vx * dt, 40, 1760);
    const y = Phaser.Math.Clamp(this.hero.y + vy * dt, 40, 1160);
    this.hero.setPosition(x, y);

    const movedDist = Phaser.Math.Distance.Between(this.prevHeroX, this.prevHeroY, x, y);
    if (movedDist > 1.5 && (vx !== 0 || vy !== 0)) {
      AudioManager.playFootstep('stone');
    }
    this.prevHeroX = x;
    this.prevHeroY = y;

    this.updateAmbientPopulation(dt);
    this.updateNpcPrompt();
    this.updateResidentialPrompt();
    this.updateRequestMarkers(_time);
  }

  private drawTownLayout() {
    const g = this.add.graphics();

    g.fillStyle(0x0b1627, 1);
    g.fillRect(0, 0, 1800, 1200);

    g.fillStyle(0x1f2937, 0.95);
    g.fillRoundedRect(120, 500, 1560, 170, 16);
    g.fillRoundedRect(420, 140, 920, 120, 12);
    g.fillRoundedRect(420, 880, 920, 120, 12);

    this.drawDistrict(240, 300, 230, 150, 0x6b2f1a, SANCTUARY_NAMESETS.tavern, '#fde68a');
    this.drawDistrict(540, 300, 230, 150, 0x1e3a8a, SANCTUARY_NAMESETS.inn, '#bfdbfe');
    this.drawDistrict(840, 300, 230, 150, 0x14532d, SANCTUARY_NAMESETS.market, '#bbf7d0');
    this.drawDistrict(1140, 300, 230, 150, 0x7c2d12, SANCTUARY_NAMESETS.smithy, '#fdba74');
    this.drawDistrict(1440, 300, 230, 150, 0x312e81, SANCTUARY_NAMESETS.tradingPoste, '#c4b5fd');

    this.drawDistrict(300, 780, 280, 160, 0x0f766e, 'Open Ring', '#99f6e4');
    this.drawDistrict(680, 780, 280, 160, 0x4c1d95, 'Awakening Yard', '#e9d5ff');
    this.drawDistrict(1060, 780, 280, 160, 0x0c4a6e, 'Spellgrounds', '#a5f3fc');
    this.drawDistrict(1440, 780, 280, 160, 0x374151, 'Hatchling Hallow', '#e5e7eb');

    this.add.text(900, 72, SANCTUARY_NAMESETS.townOfficial, {
      color: '#f8fafc',
      fontSize: '34px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(900, 108, 'Population lore: ~200 residents. Trial Circle and Ember Circle run advanced drills east of towne.', {
      color: '#93c5fd',
      fontSize: '12px'
    }).setOrigin(0.5);

    this.drawFishingSpots();
  }

  private drawStreetPathSignage() {
    for (const sign of this.streetSignRenders) {
      sign.nameText.destroy();
      sign.purposeText.destroy();
    }
    this.streetSignRenders = [];

    const signs: SanctuaryStreetKey[] = [
      'hearth_row',
      'inne_lane',
      'market_cross',
      'forge_turn',
      'poste_walk',
      'fishers_walk',
      'ring_path',
      'hallow_bend'
    ];

    for (const sign of signs) {
      const street = SANCTUARY_STREETS[sign];
      const purpose = getStreetPurpose(sign, this.townShift);
      
      // Display street name with shift-specific activity
      const nameText = this.add.text(street.x, street.y - 8, street.name, {
        color: street.color,
        fontSize: '11px',
        fontStyle: 'bold',
        backgroundColor: '#0f172a'
      }).setPadding(4, 2).setOrigin(0.5).setDepth(5);
      
      // Display shift-specific purpose below street name
      const purposeText = this.add.text(street.x, street.y + 8, purpose, {
        color: street.color,
        fontSize: '8px',
        backgroundColor: '#0f172a'
      }).setPadding(3, 1).setOrigin(0.5).setDepth(5).setAlpha(0.75);

      this.streetSignRenders.push({ key: sign, nameText, purposeText });
    }
  }

  private drawDistrict(x: number, y: number, w: number, h: number, color: number, label: string, textColor: string) {
    this.add.rectangle(x, y, w, h, color, 0.9).setDepth(2).setStrokeStyle(2, 0x0f172a, 1);
    this.add.text(x, y - 12, label, {
      color: textColor,
      fontSize: '18px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
  }

  private drawFishingSpots() {
    this.fishingSpots = [
      { x: 160, y: 980, label: 'Tidewater Pier', fishPool: ['River Fish', 'Silver Minnow'] },
      { x: 900, y: 1080, label: 'Fishers Walk', fishPool: ['Canal Carp', 'Bluefin Pike'] },
      { x: 1320, y: 1060, label: 'The Quiet Pier', fishPool: ['Moon Koi', 'Storm Eel'] },
      { x: 1640, y: 980, label: 'Driftwood Wharf', fishPool: ['Moon Koi', 'Storm Eel'] }
    ];

    for (const spot of this.fishingSpots) {
      this.add.circle(spot.x, spot.y, 34, 0x38bdf8, 0.25).setDepth(1);
      this.add.circle(spot.x, spot.y, 10, 0x67e8f9, 0.9).setDepth(2);
      this.add.text(spot.x, spot.y + 38, `${spot.label} (F)`, {
        color: '#bfdbfe',
        fontSize: '11px'
      }).setOrigin(0.5).setDepth(3);
    }
  }

  private spawnPopulation() {
    const flow = this.shiftFlowProfile[this.townShift];

    // Ambient population: frequent movement and chatter vibe.
    for (let i = 0; i < flow.ambientCount; i += 1) {
      const sprite = this.add.circle(
        Phaser.Math.Between(180, 1620),
        Phaser.Math.Between(flow.laneMinY, flow.laneMaxY),
        Phaser.Math.Between(6, 8),
        0x9ca3af,
        0.9
      ).setDepth(6);

      this.ambientNpcs.push({
        sprite,
        targetX: Phaser.Math.Between(180, 1620),
        targetY: Phaser.Math.Between(flow.laneMinY, flow.laneMaxY),
        speed: Phaser.Math.Between(flow.minSpeed, flow.maxSpeed),
        minX: 180,
        maxX: 1620,
        minY: flow.laneMinY,
        maxY: flow.laneMaxY
      });
    }

    const schedule = getScheduledPresence(this.townShift);
    const districtSpots: Array<{ x: number; y: number; districtId: SanctuaryDistrictId; role: string; rewardHint?: string }> = [
      { x: 240, y: 300, districtId: 'tavern', role: 'Hearth Staff', rewardHint: 'Can point you to quick nearby helps.' },
      { x: 320, y: 330, districtId: 'tavern', role: 'Hearth Regular' },
      { x: 540, y: 300, districtId: 'inn', role: 'Inn Staff' },
      { x: 840, y: 300, districtId: 'market', role: 'Market Staff' },
      { x: 1140, y: 300, districtId: 'smithy', role: 'Forge Staff' },
      { x: 1440, y: 300, districtId: 'tradingPoste', role: 'Poste Staff' },
      { x: 300, y: 780, districtId: 'openRing', role: 'Open Ring Trainer' },
      { x: 680, y: 780, districtId: 'hybridYard', role: 'Awakening Yard Trainer' },
      { x: 1060, y: 780, districtId: 'spellgrounds', role: 'Spellgrounds Mentor' },
      { x: 1440, y: 780, districtId: 'hatchlingHallow', role: 'Hallow Caretaker' }
    ];

    const districtSeenCount: Partial<Record<SanctuaryDistrictId, number>> = {};

    const socialData: SocialNpc[] = districtSpots.map((spot, idx) => {
      const occurrenceIndex = districtSeenCount[spot.districtId] ?? 0;
      districtSeenCount[spot.districtId] = occurrenceIndex + 1;
      const scheduledForDistrict = schedule.filter(s => s.districtId === spot.districtId);
      const scheduled = scheduledForDistrict[occurrenceIndex] ?? scheduledForDistrict[0];
      const staff = SANCTUARY_DISTRICT_STAFF[spot.districtId];
      let name =
        scheduled?.name ??
        staff.owner ??
        staff.runner ??
        staff.employees[0] ??
        `Local-${idx + 1}`;

      // Rare folklore moment: Tide sometimes wanders into the tavern at evening.
      // Keep this uncommon so players discover it naturally.
      if (spot.districtId === 'tavern' && spot.role === 'Hearth Regular' && this.townShift === 'evening') {
        const tideWanderRoll = Phaser.Math.Between(1, 100);
        if (tideWanderRoll <= 16) {
          name = 'Tide';
        }
      }

      const role = scheduled?.roleHint ?? `${spot.role} (${this.townShift})`;
      const seed = idx + this.townWeekday.length + this.townShift.length;
      const prompt = `${getQuickConvo(spot.districtId, seed)} ${getNpcFlavorLine(name, seed + 7)}`;
      return {
        x: spot.x,
        y: spot.y,
        name,
        role,
        prompt,
        districtId: spot.districtId,
        rewardHint: spot.rewardHint,
      };
    });

    const harborPresent = socialData.some(n => n.name === 'Harbor Jae' && n.districtId === 'tavern');
    const tideIdx = socialData.findIndex(n => n.name === 'Tide' && n.districtId === 'tavern' && this.townShift === 'evening');
    if (tideIdx >= 0 && harborPresent && Phaser.Math.Between(1, 100) <= 34) {
      socialData[tideIdx].prompt = `${socialData[tideIdx].prompt} ${getTideJaeDuoBanter(tideIdx + this.townWeekday.length + 17)}`;
    }

    const byDistrict = (id: SanctuaryDistrictId, fallback: string) => socialData.find(n => n.districtId === id)?.name ?? fallback;
    this.requestContacts = {
      trinket: byDistrict('tavern', 'Juniper'),
      ingredient: byDistrict('spellgrounds', 'Saph'),
      deliveryFrom: byDistrict('inn', 'Elric'),
      deliveryTo: byDistrict('tradingPoste', 'Talli')
    };

    // Family layer: small visible household presence by shift.
    this.spawnFamilyLifeLayer();

    for (const data of socialData) {
      const marker = this.add.circle(data.x, data.y, 10, 0x22d3ee, 0.92).setDepth(7);
      this.add.circle(data.x, data.y, 24, 0x67e8f9, 0.16).setDepth(6);
      this.add.text(data.x, data.y - 22, data.name, {
        color: '#e2e8f0',
        fontSize: '11px',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(8);
      this.socialNpcs.push({ ...data, marker });
    }
  }

  private spawnFamilyLifeLayer() {
    const families = getFamiliesForShift(this.townShift);

    for (let i = 0; i < families.length; i += 1) {
      const entry = families[i];
      const anchor = this.familyAnchors[entry.anchor];

      // Guardians: steady movement, slightly larger marker.
      for (const guardian of entry.family.guardians.slice(0, 2)) {
        const gx = Phaser.Math.Between(anchor.minX, anchor.maxX);
        const gy = Phaser.Math.Between(anchor.minY, anchor.maxY);
        const gSprite = this.add.circle(gx, gy, 7, 0x94a3b8, 0.95).setDepth(6);
        this.ambientNpcs.push({
          sprite: gSprite,
          targetX: Phaser.Math.Between(anchor.minX, anchor.maxX),
          targetY: Phaser.Math.Between(anchor.minY, anchor.maxY),
          speed: Phaser.Math.Between(18, 30),
          minX: anchor.minX,
          maxX: anchor.maxX,
          minY: anchor.minY,
          maxY: anchor.maxY
        });

        if (Phaser.Math.Between(1, 100) <= 40) {
          this.add.text(gx, gy - 16, guardian, {
            color: '#cbd5e1',
            fontSize: '9px'
          }).setOrigin(0.5).setDepth(7);
        }
      }

      // Kids: smaller and slightly faster to imply playful movement.
      for (const kid of entry.family.kids.slice(0, 2)) {
        const kx = Phaser.Math.Between(anchor.minX, anchor.maxX);
        const ky = Phaser.Math.Between(anchor.minY, anchor.maxY);
        const kSprite = this.add.circle(kx, ky, 5, 0xfcd34d, 0.95).setDepth(6);
        this.ambientNpcs.push({
          sprite: kSprite,
          targetX: Phaser.Math.Between(anchor.minX, anchor.maxX),
          targetY: Phaser.Math.Between(anchor.minY, anchor.maxY),
          speed: Phaser.Math.Between(26, 44),
          minX: anchor.minX,
          maxX: anchor.maxX,
          minY: anchor.minY,
          maxY: anchor.maxY
        });
      }

      // Light family interaction points (not quest-heavy).
      if (i < 3) {
        const isMaraHouse = entry.family.id === 'mara-daughters';
        const contactName = isMaraHouse ? 'Market Sisters' : 'Young Local';
        const contactAge = entry.family.kids[0]?.age;
        const ageTag = !isMaraHouse && contactAge ? ` (age ${contactAge})` : '';
        const familyPrompt = isMaraHouse
          ? `${contactName}: "Lavender, age 5, is in Little Lantern House with her longer locs, and Primrose, age 4, follows Mara everywhere with her shorter locs."`
          : contactAge
            ? `${contactName}${ageTag}: "My ma says Tide talks to storms. Is that true?"`
            : `${entry.family.householdName}: "Good to see you passing through ${SANCTUARY_NAMESETS.townCasual}."`;
        const fx = Phaser.Math.Between(anchor.minX + 12, anchor.maxX - 12);
        const fy = Phaser.Math.Between(anchor.minY + 12, anchor.maxY - 12);
        const marker = this.add.circle(fx, fy, 9, 0xfbbf24, 0.86).setDepth(7);
        this.add.circle(fx, fy, 22, 0xfde68a, 0.16).setDepth(6);
        this.add.text(fx, fy - 18, contactName, {
          color: '#fef3c7',
          fontSize: '10px',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(8);

        this.socialNpcs.push({
          x: fx,
          y: fy,
          name: contactName,
          role: `Family Local · ${entry.family.householdName}`,
          prompt: familyPrompt,
          rewardHint: 'Mostly chat, sometimes a tiny nearby favor.',
          marker
        });
      }

      this.add.text(anchor.labelX, anchor.labelY, `${entry.family.householdName}`, {
        color: '#94a3b8',
        fontSize: '9px'
      }).setOrigin(0.5).setDepth(5);
    }
  }

  private startAmbientIdleChatter() {
    this.time.addEvent({
      delay: 6200,
      loop: true,
      callback: () => {
        this.emitAmbientIdleLine();
      }
    });
  }

  private emitAmbientIdleLine() {
    const roll = Phaser.Math.Between(1, 100);
    let speakerLabel = 'Young Local';
    let line = this.ambientKidLines[0];
    let anchor: FamilyAnchor = this.familyAnchors.market;

    // Shift-weighted chatter: mornings skew younger, afternoons skew field-years/teen,
    // evenings keep a quieter apprentice/older-youth atmosphere.
    if (this.townShift === 'morning') {
      if (roll <= 48) {
        speakerLabel = 'Little Lantern Kid';
        line = Phaser.Utils.Array.GetRandom(this.ambientKidLines);
        anchor = Phaser.Math.Between(1, 100) <= 50 ? this.familyAnchors.market : this.familyAnchors.hatchlingHallow;
      } else if (roll <= 68) {
        speakerLabel = 'Field Years Trainee';
        line = Phaser.Utils.Array.GetRandom(this.ambientFieldYearsLines);
        anchor = Phaser.Math.Between(1, 100) <= 50 ? this.familyAnchors.openRing : this.familyAnchors.market;
      } else if (roll <= 86) {
        speakerLabel = 'Hearthway Student';
        line = Phaser.Utils.Array.GetRandom(this.ambientTeenLines);
        anchor = this.familyAnchors.openRing;
      } else {
        speakerLabel = 'Apprentice';
        line = Phaser.Utils.Array.GetRandom(this.ambientApprenticeLines);
        anchor = Phaser.Math.Between(1, 100) <= 50 ? this.familyAnchors.market : this.familyAnchors.openRing;
      }
    } else if (this.townShift === 'afternoon') {
      if (roll <= 25) {
        speakerLabel = 'Little Lantern Kid';
        line = Phaser.Utils.Array.GetRandom(this.ambientKidLines);
        anchor = this.familyAnchors.hatchlingHallow;
      } else if (roll <= 52) {
        speakerLabel = 'Field Years Trainee';
        line = Phaser.Utils.Array.GetRandom(this.ambientFieldYearsLines);
        anchor = Phaser.Math.Between(1, 100) <= 50 ? this.familyAnchors.openRing : this.familyAnchors.market;
      } else if (roll <= 74) {
        speakerLabel = 'Hearthway Student';
        line = Phaser.Utils.Array.GetRandom(this.ambientTeenLines);
        anchor = this.familyAnchors.openRing;
      } else {
        speakerLabel = Phaser.Math.Between(1, 100) <= 50 ? 'Market Runner' : 'Apprentice';
        line = Phaser.Utils.Array.GetRandom(this.ambientApprenticeLines);
        anchor = this.familyAnchors.market;
      }
    } else {
      if (roll <= 16) {
        speakerLabel = 'Field Years Trainee';
        line = Phaser.Utils.Array.GetRandom(this.ambientFieldYearsLines);
        anchor = this.familyAnchors.tavern;
      } else if (roll <= 30) {
        speakerLabel = 'Hearthway Student';
        line = Phaser.Utils.Array.GetRandom(this.ambientTeenLines);
        anchor = this.familyAnchors.tavern;
      } else {
        speakerLabel = Phaser.Math.Between(1, 100) <= 50 ? 'Dock Apprentice' : 'Apprentice';
        line = Phaser.Utils.Array.GetRandom(this.ambientApprenticeLines);
        anchor = Phaser.Math.Between(1, 100) <= 50 ? this.familyAnchors.fishersWalk : this.familyAnchors.market;
      }
    }

    const x = Phaser.Math.Between(anchor.minX + 8, anchor.maxX - 8);
    const y = Phaser.Math.Between(anchor.minY + 8, anchor.maxY - 8);
    const bubble = this.add.text(x, y - 18, `${speakerLabel}: "${line}"`, {
      color: '#f8fafc',
      fontSize: '10px',
      backgroundColor: '#0f172a'
    })
      .setPadding(6, 4)
      .setDepth(12)
      .setOrigin(0.5);

    this.tweens.add({
      targets: bubble,
      alpha: { from: 0.95, to: 0 },
      y: bubble.y - 12,
      duration: 2500,
      ease: 'Sine.Out',
      onComplete: () => bubble.destroy()
    });
  }

  private updateAmbientPopulation(dt: number) {
    for (const npc of this.ambientNpcs) {
      const dx = npc.targetX - npc.sprite.x;
      const dy = npc.targetY - npc.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8) {
        npc.targetX = Phaser.Math.Between(npc.minX, npc.maxX);
        npc.targetY = Phaser.Math.Between(npc.minY, npc.maxY);
        continue;
      }

      npc.sprite.x += (dx / dist) * npc.speed * dt;
      npc.sprite.y += (dy / dist) * npc.speed * dt;
    }
  }

  private createHud(width: number, _height: number) {
    const panel = this.add.rectangle(12, 12, 620, 126, 0x020617, 0.86)
      .setOrigin(0, 0)
      .setDepth(40)
      .setScrollFactor(0);
    panel.setStrokeStyle(1, 0x334155, 1);

    this.add.text(24, 20, `${SANCTUARY_NAMESETS.townCasual} Hub`, {
      color: '#f8fafc',
      fontSize: '20px',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(41);

    this.shiftInfoText = this.add.text(24, 38, `${this.townWeekday} · ${this.townShift.toUpperCase()} shift`, {
      color: '#93c5fd',
      fontSize: '11px'
    }).setScrollFactor(0).setDepth(41);

    this.helpText = this.add.text(24, 54, 'Move: WASD/Arrows  E: Talk/Enter  F: Fish  M: Map  I: Inventory  Shift: Chat  O: Settings', {
      color: '#cbd5e1',
      fontSize: '11px'
    }).setScrollFactor(0).setDepth(41);

    this.shiftSummaryText = this.add.text(24, 72, this.shiftFlowProfile[this.townShift].summary, {
      color: '#a5b4fc',
      fontSize: '10px'
    }).setScrollFactor(0).setDepth(41);

    this.messageText = this.add.text(width / 2, 18, '', {
      color: '#a7f3d0',
      fontSize: '12px',
      backgroundColor: '#052e16'
    }).setOrigin(0.5, 0).setPadding(8, 4).setScrollFactor(0).setDepth(41);
  }

  private updateNpcPrompt() {
    this.activeNpcIndex = -1;

    for (let i = 0; i < this.socialNpcs.length; i += 1) {
      const npc = this.socialNpcs[i];
      const near = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, npc.x, npc.y) < 42;
      npc.marker.setFillStyle(near ? 0xfbbf24 : 0x22d3ee, 0.92);
      if (near) this.activeNpcIndex = i;
    }

    if (this.activeNpcIndex >= 0) {
      const npc = this.socialNpcs[this.activeNpcIndex];
      this.helpText.setText(`Near ${npc.name} (${npc.role}). Press E to interact.`);
    } else {
      this.helpText.setText('Move: WASD/Arrows  E: Talk/Enter  F: Fish  Q: Kingdom Quests  M: Map  I: Inventory  Shift: Chat  O: Settings');
    }
  }

  private spawnResidentialClusters() {
    const clusters: Array<Omit<ResidentialCluster, 'marker'>> = [
      {
        id: 'market_cluster',
        title: 'Market Cluster Homes',
        districtLabel: 'Market Quarter',
        street: 'Market Cross',
        doorX: 900,
        doorY: 400,
        homes: ['Mara and Daughters House', 'Poste Ledger House'],
        morningUse: 'Breakfast prep and school send-off.',
        afternoonUse: 'Restock and errand sorting between shifts.',
        eveningUse: 'Family supper and market ledger checks.'
      },
      {
        id: 'dock_cluster',
        title: 'Fishers Walk Cluster',
        districtLabel: 'Dock Quarter',
        street: 'Fishers Walk',
        doorX: 900,
        doorY: 920,
        homes: ['Fenward Household', 'Renbrook Home'],
        morningUse: 'Net prep, boat checks, and tide planning.',
        afternoonUse: 'Catch sorting and route relays.',
        eveningUse: 'Quiet pier stories and gear drying.'
      },
      {
        id: 'hallow_cluster',
        title: 'Hallow Cluster Homes',
        districtLabel: 'Hatchling Hallow',
        street: 'Hallow Bend',
        doorX: 1460,
        doorY: 860,
        homes: ['Linna and Pipp Nest', 'Creatreat Cottage'],
        morningUse: 'Hatchling feed rounds and calm starts.',
        afternoonUse: 'Care rotations and kid pickup loops.',
        eveningUse: 'Quiet care checks and herbal wind-down.'
      },
      {
        id: 'ring_cluster',
        title: 'Ring Path Homes',
        districtLabel: 'Open Ring Edge',
        street: 'Ring Path',
        doorX: 320,
        doorY: 860,
        homes: ['Ringwatch Family', 'Awakening Yard House'],
        morningUse: 'Training prep and gear setup.',
        afternoonUse: 'Drill debrief and apprentice traffic.',
        eveningUse: 'Recovery meals and route planning.'
      },
      {
        id: 'hearth_cluster',
        title: 'Hearth Row Homes',
        districtLabel: 'Tavern Adjacent',
        street: 'Hearth Row',
        doorX: 250,
        doorY: 390,
        homes: ['Juniper-Lark House', 'Jolet-Luma Stay Rooms'],
        morningUse: 'Inn resets and hearth opening.',
        afternoonUse: 'Visitor rotations and delivery staging.',
        eveningUse: 'Story hour and local gathering traffic.'
      }
    ];

    for (const base of clusters) {
      const marker = this.add.circle(base.doorX, base.doorY, 10, 0xf59e0b, 0.9).setDepth(9);
      this.add.circle(base.doorX, base.doorY, 26, 0xfcd34d, 0.18).setDepth(8);
      this.add.text(base.doorX, base.doorY - 20, 'Home Entry', {
        color: '#fde68a',
        fontSize: '10px',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(10);
      this.residentialClusters.push({ ...base, marker });
    }
  }

  private updateResidentialPrompt() {
    this.activeResidentialIndex = -1;

    for (let i = 0; i < this.residentialClusters.length; i += 1) {
      const cluster = this.residentialClusters[i];
      const near = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, cluster.doorX, cluster.doorY) < 44;
      cluster.marker.setFillStyle(near ? 0xfde047 : 0xf59e0b, 0.9);
      if (near) this.activeResidentialIndex = i;
    }

    if (this.activeResidentialIndex >= 0 && !this.inInterior) {
      const cluster = this.residentialClusters[this.activeResidentialIndex];
      this.helpText.setText(`Near ${cluster.title}. Press E to enter interior.`);
    } else if (this.inInterior) {
      this.helpText.setText('Interior: Press 1 Sit  2 Inspect  3 Family Talk  E/ESC Exit');
    }
  }

  private tryResidentialEntry(): boolean {
    if (this.activeResidentialIndex < 0) return false;

    const shouldRequireDoorKey = !!this.registry.get('requireFolkDoorKey');
    if (shouldRequireDoorKey) {
      const kingdomId = this.getCurrentMainlandKingdom();
      const access = canOpenKingdomDoor(this.getInventoryEntries(), kingdomId);
      if (!access.granted) {
        this.showMessage(`Door locked: ${access.lockLabel}. Folk key required before entry.`, '#fca5a5');
        return true;
      }
    }

    this.openInteriorView(this.residentialClusters[this.activeResidentialIndex]);
    return true;
  }

  private getCurrentMainlandKingdom(): FourKingdomId {
    const raw = String(this.registry.get('activeMainlandKingdom') ?? 'aldermarch').toLowerCase();
    if (raw === 'stormrage' || raw === 'vastmalaise' || raw === 'sunward') return raw;
    return 'aldermarch';
  }

  private getInventoryEntries(): InventoryItem[] {
    return (this.registry.get('inventory') as InventoryItem[]) || [
      { id: 'travel-ration', name: 'Travel Ration', equipped: false },
      { id: 'field-bandage', name: 'Field Bandage', equipped: false },
    ];
  }

  private openInteriorView(cluster: ResidentialCluster) {
    if (this.inInterior) return;
    this.inInterior = true;
    this.activeInteriorCluster = cluster;

    AudioManager.playPickup('item');
    this.interiorBackdrop = this.add.rectangle(900, 600, 1800, 1200, 0x020617, 0.72).setDepth(70);
    this.interiorPanel = this.add.rectangle(900, 600, 760, 470, 0x0f172a, 0.96)
      .setStrokeStyle(2, 0xfbbf24, 0.85)
      .setDepth(71);

    const shiftUse = this.townShift === 'morning'
      ? cluster.morningUse
      : this.townShift === 'afternoon'
        ? cluster.afternoonUse
        : cluster.eveningUse;

    const lines = [
      `${cluster.title} Interior`,
      `${cluster.districtLabel} - ${cluster.street}`,
      `Current shift use: ${shiftUse}`,
      `Homes in this cluster:`,
      ...cluster.homes.map((h) => `- ${h}`),
      '',
      'Local details:',
      '- Shared table, entry mats, and day ledger wall.',
      '- Family routes are tied to nearby named streets.',
      '- Press E or ESC to exit this interior view.'
    ];

    const colors = ['#fde68a', '#cbd5e1', '#93c5fd', '#f8fafc'];
    lines.forEach((line, index) => {
      const text = this.add.text(570, 410 + index * 28, line, {
        color: index === 0 ? colors[0] : index <= 2 ? colors[2] : colors[1],
        fontSize: index === 0 ? '22px' : '14px',
        fontStyle: index === 0 ? 'bold' : 'normal'
      }).setDepth(72);
      this.interiorTexts.push(text);
    });

    const actions: Array<{ x: number; id: InteriorActionId; label: string }> = [
      { x: 650, id: 'sit', label: '1) Sit by hearth' },
      { x: 900, id: 'inspect', label: '2) Inspect family ledger' },
      { x: 1160, id: 'dialog', label: '3) Family dialog' },
    ];
    for (const a of actions) {
      const hint = this.add.text(a.x, 770, a.label, {
        color: '#fef3c7',
        fontSize: '12px',
        fontStyle: 'bold',
        backgroundColor: '#1f2937'
      }).setPadding(8, 4).setOrigin(0.5).setDepth(73);
      this.interiorActionHints.push(hint);
      this.interiorActionKinds.push(a.id);
    }

    this.interiorRewardLog = ['Interior log: actions ready.'];
    this.interiorRewardLogText = this.add.text(1210, 420, '', {
      color: '#cbd5e1',
      fontSize: '11px',
      backgroundColor: '#111827'
    }).setPadding(8, 6).setDepth(72).setWordWrapWidth(220, true);
    this.updateInteriorLogPanel();
    this.updateInteriorActionCooldowns(0);

    this.showMessage(`Entered ${cluster.title}.`, '#fde68a');
  }

  private closeInteriorView() {
    if (!this.inInterior) return;
    this.inInterior = false;

    this.interiorBackdrop?.destroy();
    this.interiorPanel?.destroy();
    this.interiorBackdrop = undefined;
    this.interiorPanel = undefined;
    for (const text of this.interiorTexts) text.destroy();
    this.interiorTexts = [];
    for (const hint of this.interiorActionHints) hint.destroy();
    this.interiorActionHints = [];
    this.interiorActionKinds = [];
    this.interiorRewardLogText?.destroy();
    this.interiorRewardLogText = undefined;
    this.activeInteriorCluster = undefined;
    this.interiorActionCooldowns = { sit: 0, inspect: 0, dialog: 0 };

    AudioManager.playPickup('item');
    this.showMessage('Returned to Sanctuary Towne streets.', '#a7f3d0');
  }

  private tryInteract() {
    // 0. Enter home interiors first when near a residential door marker.
    if (this.tryResidentialEntry()) return;

    // 1. Check active request markers first (trinket pickup, ingredient gather, delivery hand-off)
    if (this.tryRequestMarkerInteract()) return;

    // 2. Then NPC dialogue / request accept
    if (this.activeNpcIndex < 0) {
      this.showMessage('No one close enough to talk to.', '#cbd5e1');
      return;
    }
    this.tryNpcRequestFlow();
  }

  private triggerInteriorAction(actionId: InteriorActionId) {
    if (!this.inInterior || !this.activeInteriorCluster) return;

    const remaining = this.interiorActionCooldowns[actionId] ?? 0;
    if (remaining > 0) {
      this.showMessage(`That action is still recovering. ${Math.ceil(remaining / 1000)}s left.`, '#fbbf24');
      return;
    }

    if (actionId === 'sit') {
      this.registry.set('heroRested', true);
      const current = Number(this.registry.get('heroEnergy') || 80);
      const max = Number(this.registry.get('heroMaxEnergy') || 100);
      this.registry.set('heroEnergy', Math.min(max, current + 8));
      this.interiorActionCooldowns.sit = 1800;
      this.recordInteriorReward('Sit by hearth · +8 energy');
      this.showMessage(`You sat and recovered. +8 energy at ${this.activeInteriorCluster.title}.`, '#a7f3d0');
      return;
    }

    if (actionId === 'inspect') {
      this.registry.set('inventoryOrganized', true);
      this.registry.set('townInsights', Number(this.registry.get('townInsights') || 0) + 1);
      this.interiorActionCooldowns.inspect = 2400;
      this.recordInteriorReward('Ledger checked · +1 insight');
      this.showMessage(`Ledger checked: routes for ${this.activeInteriorCluster.street} updated in your notes.`, '#93c5fd');
      return;
    }

    const variant = this.getInteriorDialogVariant(this.activeInteriorCluster);
    this.registry.set(`interiorDialog_${this.activeInteriorCluster.id}`, Number(this.registry.get(`interiorDialog_${this.activeInteriorCluster.id}`) || 0) + 1);
    this.interiorActionCooldowns.dialog = 1600;
    this.recordInteriorReward('Family dialog · +1 rapport');
    this.showMessage(variant, '#fef3c7');
  }

  private recordInteriorReward(entry: string) {
    this.interiorRewardLog.unshift(entry);
    this.interiorRewardLog = this.interiorRewardLog.slice(0, 4);
    this.updateInteriorLogPanel();
  }

  private updateInteriorLogPanel() {
    if (!this.interiorRewardLogText) return;
    this.interiorRewardLogText.setText(['Recent gains', ...this.interiorRewardLog].join('\n'));
  }

  private updateInteriorActionCooldowns(delta: number) {
    this.interiorActionCooldowns = {
      sit: Math.max(0, (this.interiorActionCooldowns.sit ?? 0) - delta),
      inspect: Math.max(0, (this.interiorActionCooldowns.inspect ?? 0) - delta),
      dialog: Math.max(0, (this.interiorActionCooldowns.dialog ?? 0) - delta)
    };

    for (let i = 0; i < this.interiorActionHints.length; i += 1) {
      const hint = this.interiorActionHints[i];
      const actionId = this.interiorActionKinds[i];
      const remaining = Math.ceil((this.interiorActionCooldowns[actionId] ?? 0) / 1000);
      const base = actionId === 'sit'
        ? '1) Sit by hearth'
        : actionId === 'inspect'
          ? '2) Inspect family ledger'
          : '3) Family dialog';
      hint.setText(remaining > 0 ? `${base} (${remaining}s)` : base);
      hint.setAlpha(remaining > 0 ? 0.72 : 1);
    }
  }

  private getInteriorDialogVariant(cluster: ResidentialCluster) {
    const shiftPrefix = this.townShift === 'morning'
      ? 'Morning chatter'
      : this.townShift === 'afternoon'
        ? 'Afternoon chatter'
        : 'Evening chatter';

    const options: Record<string, string[]> = {
      market_cluster: [
        '"Poste runners are already crossing Market Cross with order slips."',
        '"Keep your pace steady; market corners get crowded after noon."',
      ],
      dock_cluster: [
        '"Fishers Walk traffic splits near Driftwood by tide bell."',
        '"Dock families always mark safe return lanes before dusk."',
      ],
      hallow_cluster: [
        '"Hallow Bend stays calm if riders keep spell lanterns low."',
        '"Some awakened locals here carry trace resonance from other coasts."',
      ],
      ring_cluster: [
        '"Ring Path drills rotate by shift; afternoon is peak pressure."',
        '"Open Ring families still track combo timings at supper."',
      ],
      hearth_cluster: [
        '"Hearth Row hears every route rumor before nightfall."',
        '"Travelers from other kingdoms often stay a cycle, then settle."',
      ]
    };

    const lines = options[cluster.id] || ['"Routes stay safer when everyone shares updates."'];
    const picked = lines[Phaser.Math.Between(0, lines.length - 1)];
    return `${shiftPrefix}: ${picked}`;
  }

  // ─── NPC request flow ─────────────────────────────────────────────────────

  private tryNpcRequestFlow() {
    const npc = this.socialNpcs[this.activeNpcIndex];

    // Does this NPC have an active request for the player to complete?
    const activeReq = this.townRequests.find(
      r => r.status === 'active' && (r.npcName === npc.name || r.targetNpcName === npc.name)
    );

    if (activeReq) {
      // Delivery hand-off at target NPC
      if (activeReq.type === 'delivery' && activeReq.targetNpcName === npc.name && this.carriedNoteFor === npc.name) {
        this.completeRequest(activeReq);
        return;
      }
      // Ingredient return to request NPC
      if (activeReq.type === 'ingredient' && activeReq.npcName === npc.name && this.ingredientGatheredId === activeReq.id) {
        this.completeRequest(activeReq);
        return;
      }
      // Trinket return to request NPC
      if (activeReq.type === 'trinket' && activeReq.npcName === npc.name && this.heldTrinketId === activeReq.id) {
        this.completeRequest(activeReq);
        return;
      }
      // Request is active but player doesn't have item yet — remind them
      this.showRequestReminder(activeReq);
      return;
    }

    // Does this NPC have an available request?
    const availReq = this.townRequests.find(r => r.status === 'available' && r.npcName === npc.name);
    if (availReq) {
      this.acceptRequest(availReq);
      return;
    }

    // Completed request NPC — friendly follow-up
    const doneReq = this.townRequests.find(r => r.status === 'complete' && (r.npcName === npc.name || r.targetNpcName === npc.name));
    if (doneReq) {
      this.showMessage(`${npc.name}: "Thanks again! You've been a real help around here."`, '#a7f3d0');
      return;
    }

    // Default dialogue
    const extra = npc.rewardHint ? ` ${npc.rewardHint}` : '';
    this.showMessage(`${npc.name} (${npc.role}): ${npc.prompt}${extra}`, '#bfdbfe');
  }

  // ─── Request marker pickup / gather ───────────────────────────────────────

  private tryRequestMarkerInteract(): boolean {
    for (const req of this.townRequests) {
      if (req.status !== 'active' || req.markerX === undefined) continue;
      const dist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, req.markerX, req.markerY!);
      if (dist > 52) continue;

      if (req.type === 'trinket') {
        this.heldTrinketId = req.id;
        this.removeRequestMarker(req);
        AudioManager.playPickup('item');
        this.showMessage(
          `Found: ${req.itemName} on ${req.street}. Return it to ${req.npcName}.`,
          '#fde68a'
        );
        return true;
      }

      if (req.type === 'ingredient') {
        this.ingredientGatheredId = req.id;
        this.removeRequestMarker(req);
        AudioManager.playPickup('material');
        this.showMessage(
          `Gathered: ${req.itemName} from ${req.street}. Bring it back to ${req.npcName}.`,
          '#bbf7d0'
        );
        return true;
      }

      if (req.type === 'delivery' && this.carriedNoteFor === '') {
        this.carriedNoteFor = req.targetNpcName!;
        this.removeRequestMarker(req);
        AudioManager.playPickup('item');
        this.showMessage(
          `Picked up note on ${req.street} for ${req.targetNpcName}. Follow the route and press E to deliver.`,
          '#c4b5fd'
        );
        return true;
      }
    }
    return false;
  }

  // ─── Accept / complete requests ───────────────────────────────────────────

  private acceptRequest(req: TownRequest) {
    if (this.getActiveRequestCount() >= this.requestCadence.maxActive) {
      this.showMessage(`Use your discernment: you are already engaged in ${this.requestCadence.maxActive} paths. Complete one before taking on another.`, '#fde68a');
      return;
    }

    req.status = 'active';
    this.spawnRequestMarker(req);
    this.refreshRequestBoardStatus();

    if (req.type === 'trinket') {
      this.showMessage(
        `${req.npcName}: "I lost my ${req.itemName} near ${req.street}. ${req.routeHint} The yellow star marks the spot."`,
        '#fde68a'
      );
    } else if (req.type === 'ingredient') {
      this.showMessage(
        `${req.npcName}: "Could you gather some ${req.itemName} from ${req.street}? ${req.routeHint}"`,
        '#bbf7d0'
      );
    } else if (req.type === 'delivery') {
      this.showMessage(
        `${req.npcName}: "Please carry this note to ${req.targetNpcName}. Start on ${req.street}. ${req.routeHint}"`,
        '#c4b5fd'
      );
    }
  }

  private completeRequest(req: TownRequest) {
    req.status = 'complete';
    this.carriedNoteFor = '';
    this.heldTrinketId = '';
    this.ingredientGatheredId = '';
    AudioManager.playPickup('quest');

    // Rapport: store in scene registry (placeholder, no multiplayer yet)
    const rapportKey = `townRapport_${req.npcName.replace(/\s/g, '_')}`;
    const current: number = this.registry.get(rapportKey) ?? 0;
    this.registry.set(rapportKey, Math.min(100, current + 8));
    if (req.targetNpcName) {
      const tk2 = `townRapport_${req.targetNpcName.replace(/\s/g, '_')}`;
      const c2: number = this.registry.get(tk2) ?? 0;
      this.registry.set(tk2, Math.min(100, c2 + 5));
    }

    // GC reward (placeholder — registry coin pot)
    const gcKey = 'playerGC';
    const gc: number = this.registry.get(gcKey) ?? 0;
    this.registry.set(gcKey, gc + req.gcReward);
    const unlockedNext = this.rotateNextQueuedRequest(req.type);
    this.refreshRequestBoardStatus();

    // First-request achievement hook
    if (!this.registry.get('firstTownRequestComplete')) {
      this.registry.set('firstTownRequestComplete', true);
      this.showMessage(
        `Request complete on ${req.street}! +${req.gcReward} GC, ${req.materialReward}. First Town Helper unlocked.${unlockedNext ? ' A new board request rotated in.' : ''}`,
        '#fbbf24'
      );
    } else {
      this.showMessage(
        `Request complete on ${req.street}! +${req.gcReward} GC, ${req.materialReward}. Rapport with ${req.npcName} +8.${unlockedNext ? ' New request posted.' : ''}`,
        '#a7f3d0'
      );
    }
  }

  private getActiveRequestCount() {
    return this.townRequests.filter((r) => r.status === 'active').length;
  }

  private getRequestCadenceOrder() {
    const typePriorityByShift: Record<SanctuaryShift, TownRequestType[]> = {
      morning: ['ingredient', 'delivery', 'trinket'],
      afternoon: ['delivery', 'ingredient', 'trinket'],
      evening: ['trinket', 'delivery', 'ingredient']
    };
    const typeOrder = typePriorityByShift[this.townShift] ?? typePriorityByShift.morning;
    const emphasisStreets = this.getShiftEmphasisStreets();
    
    return [...this.townRequests].sort((a, b) => {
      const ai = typeOrder.indexOf(a.type);
      const bi = typeOrder.indexOf(b.type);
      if (ai !== bi) return ai - bi;
      
      // Within same type, prioritize emphasized streets
      const aStreetIdx = emphasisStreets.indexOf(a.street);
      const bStreetIdx = emphasisStreets.indexOf(b.street);
      const aIsEmphasized = aStreetIdx !== -1;
      const bIsEmphasized = bStreetIdx !== -1;
      
      if (aIsEmphasized && !bIsEmphasized) return -1;
      if (!aIsEmphasized && bIsEmphasized) return 1;
      if (aIsEmphasized && bIsEmphasized) return aStreetIdx - bStreetIdx;
      
      return a.id.localeCompare(b.id);
    });
  }

  private seedRequestCadence() {
    for (const req of this.townRequests) {
      req.status = 'queued';
    }
    const ordered = this.getRequestCadenceOrder();
    const visible = ordered.slice(0, this.requestCadence.visiblePool);
    for (const req of visible) {
      req.status = 'available';
    }
  }

  private rotateNextQueuedRequest(preferredType: TownRequestType) {
    let next = this.townRequests.find((r) => r.status === 'queued' && r.type === preferredType);
    if (!next) next = this.townRequests.find((r) => r.status === 'queued');
    if (!next) return false;
    next.status = 'available';
    return true;
  }

  private showRequestReminder(req: TownRequest) {
    const npc = this.socialNpcs[this.activeNpcIndex];
    if (req.type === 'trinket') {
      this.showMessage(`${npc.name}: "Still looking for that ${req.itemName}? Re-check ${req.street}. ${req.routeHint}"`, '#fde68a');
    } else if (req.type === 'ingredient') {
      this.showMessage(`${npc.name}: "Any luck finding ${req.itemName}? Follow ${req.street}. ${req.routeHint}"`, '#bbf7d0');
    } else if (req.type === 'delivery') {
      if (this.carriedNoteFor) {
        this.showMessage(`${npc.name}: "You have the note - follow ${req.street} to ${req.targetNpcName}."`, '#c4b5fd');
      } else {
        this.showMessage(`${npc.name}: "Grab the note from ${req.street}, then bring it to ${req.targetNpcName}."`, '#c4b5fd');
      }
    }
  }

  // ─── Request marker visual management ─────────────────────────────────────

  private spawnRequestMarker(req: TownRequest) {
    const colors: Record<TownRequestType, number> = { trinket: 0xfbbf24, ingredient: 0x4ade80, delivery: 0xa855f7 };
    const col = colors[req.type];
    req.markerObj = this.add.circle(req.markerX!, req.markerY!, 12, col, 0.9).setDepth(15);
    req.markerPulse = this.add.circle(req.markerX!, req.markerY!, 22, col, 0.2).setDepth(14);
    req.markerLabel = this.add.text(req.markerX!, req.markerY! - 30, '★ E', {
      color: '#fff',
      fontSize: '11px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(16);
  }

  private removeRequestMarker(req: TownRequest) {
    req.markerObj?.destroy();
    req.markerPulse?.destroy();
    req.markerLabel?.destroy();
    req.markerObj = undefined;
    req.markerPulse = undefined;
    req.markerLabel = undefined;
    req.markerX = undefined;
    req.markerY = undefined;
  }

  private updateRequestMarkers(time: number) {
    const pulse = 0.15 + 0.12 * Math.sin(time / 350);
    for (const req of this.townRequests) {
      if (req.markerPulse) {
        req.markerPulse.setAlpha(pulse);
      }
    }

    this.updateRequestRouteGuide();
  }

  private updateRequestRouteGuide() {
    const active = this.townRequests.find((r) => r.status === 'active');
    if (!active) {
      this.hideRouteGuide();
      this.routeGuideText?.setVisible(false);
      return;
    }

    const hasItem =
      (active.type === 'trinket' && this.heldTrinketId === active.id)
      || (active.type === 'ingredient' && this.ingredientGatheredId === active.id)
      || (active.type === 'delivery' && this.carriedNoteFor === active.targetNpcName);

    let targetX = active.markerX;
    let targetY = active.markerY;

    if (hasItem) {
      const targetNpcName = active.targetNpcName || active.npcName;
      const targetNpc = this.socialNpcs.find((n) => n.name === targetNpcName);
      if (targetNpc) {
        targetX = targetNpc.x;
        targetY = targetNpc.y;
      }
    }

    if (targetX === undefined || targetY === undefined) {
      this.routeGuideLine?.setVisible(false);
      this.routeGuideArrow?.setVisible(false);
      this.routeGuideText?.setVisible(false);
      return;
    }

    const routePoints = this.buildRouteGuidePoints(active.street, targetX, targetY);
    if (routePoints.length < 2) {
      this.hideRouteGuide();
      this.routeGuideText?.setVisible(false);
      return;
    }

    this.syncRouteGuide(routePoints, `Route: ${active.street}`);
  }

  private hideRouteGuide() {
    for (const line of this.routeGuideLines) line.setVisible(false);
    for (const arrow of this.routeGuideArrows) arrow.setVisible(false);
    for (const dot of this.routeGuideDots) dot.setVisible(false);
  }

  private syncRouteGuide(points: RouteGuideNode[], label: string) {
    while (this.routeGuideLines.length < points.length - 1) {
      this.routeGuideLines.push(this.add.line(0, 0, 0, 0, 0, 0, 0x22d3ee).setLineWidth(2, 2).setAlpha(0.72).setDepth(13));
    }
    while (this.routeGuideLines.length > points.length - 1) {
      this.routeGuideLines.pop()?.destroy();
    }

    while (this.routeGuideArrows.length < points.length - 1) {
      this.routeGuideArrows.push(this.add.triangle(0, 0, 0, -7, 12, 0, 0, 7, 0x22d3ee).setDepth(13).setAlpha(0.92));
    }
    while (this.routeGuideArrows.length > points.length - 1) {
      this.routeGuideArrows.pop()?.destroy();
    }

    while (this.routeGuideDots.length < Math.max(0, points.length - 2)) {
      this.routeGuideDots.push(this.add.circle(0, 0, 4, 0x67e8f9, 0.95).setDepth(13));
    }
    while (this.routeGuideDots.length > Math.max(0, points.length - 2)) {
      this.routeGuideDots.pop()?.destroy();
    }

    let labelX = (points[0].x + points[points.length - 1].x) / 2;
    let labelY = (points[0].y + points[points.length - 1].y) / 2;

    for (let i = 0; i < points.length - 1; i += 1) {
      const start = points[i];
      const end = points[i + 1];
      this.routeGuideLines[i].setTo(start.x, start.y, end.x, end.y).setVisible(true);
      this.routeGuideArrows[i]
        .setPosition(end.x, end.y)
        .setRotation(Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y))
        .setVisible(true);

      if (i > 0) {
        this.routeGuideDots[i - 1].setPosition(start.x, start.y).setVisible(true);
      }

      if (i === 0) {
        labelX = (start.x + end.x) / 2;
        labelY = (start.y + end.y) / 2;
      }
    }

    this.routeGuideText ??= this.add.text(labelX, labelY - 14, label, {
      color: '#67e8f9',
      fontSize: '10px',
      fontStyle: 'bold',
      backgroundColor: '#0f172a'
    }).setPadding(4, 2).setOrigin(0.5).setDepth(13);

    this.routeGuideText
      .setPosition(labelX, labelY - 14)
      .setText(label)
      .setVisible(true);
  }

  private buildRouteGuidePoints(streetName: string, targetX: number, targetY: number): RouteGuideNode[] {
    const route: RouteGuideNode[] = [{ x: this.hero.x, y: this.hero.y }];
    const streetEntry = Object.values(SANCTUARY_STREETS).find((street) => street.name === streetName);
    const mainY = 540;
    const hubX = streetEntry?.x ?? targetX;
    const branchY = streetEntry?.y ?? targetY;

    if (Math.abs(this.hero.y - mainY) > 10) {
      route.push({ x: this.hero.x, y: mainY });
    }

    route.push({ x: hubX, y: mainY });
    if (branchY > mainY + 80) {
      route.push({ x: hubX, y: branchY });
    }

    route.push({ x: targetX, y: targetY });
    return route.filter((point, index, list) => index === 0 || point.x !== list[index - 1].x || point.y !== list[index - 1].y);
  }

  private updateShiftCycle() {
    if (!this.shiftCycleStartMs) return;
    const elapsed = Date.now() - this.shiftCycleStartMs;
    const cycleIndex = Math.floor(elapsed / this.shiftCycleMs);
    const order: SanctuaryShift[] = ['morning', 'afternoon', 'evening'];
    const startIndex = order.indexOf(getSanctuaryShiftByHour(new Date().getHours()));
    const nextShift = order[(startIndex + cycleIndex) % order.length];
    if (nextShift === this.townShift) return;

    this.townShift = nextShift;
    this.applyShiftRefresh();
  }

  private applyShiftRefresh() {
    this.drawStreetPathSignage();
    const flow = this.shiftFlowProfile[this.townShift];
    for (const npc of this.ambientNpcs) {
      npc.minY = flow.laneMinY;
      npc.maxY = flow.laneMaxY;
      npc.speed = Phaser.Math.Between(flow.minSpeed, flow.maxSpeed);
      npc.targetY = Phaser.Math.Between(flow.laneMinY, flow.laneMaxY);
    }

    this.shiftInfoText?.setText(`${this.townWeekday} · ${this.townShift.toUpperCase()} shift`);
    this.shiftSummaryText?.setText(flow.summary);
    this.playShiftTransition();
    AudioManager.playAmbientLoop(this.townShift === 'evening' ? 'night' : 'day');
    this.showMessage(`Shift updated: ${this.townShift.toUpperCase()} routes now active.`, '#93c5fd');
  }

  private playShiftTransition() {
    if (!this.shiftTransitionOverlay) return;

    const overlayColor = this.townShift === 'morning' ? 0x38bdf8 : this.townShift === 'afternoon' ? 0xfbbf24 : 0xa855f7;
    this.shiftTransitionOverlay
      .setFillStyle(overlayColor, 0)
      .setVisible(true)
      .setAlpha(0);

    this.tweens.add({
      targets: this.shiftTransitionOverlay,
      alpha: { from: 0, to: 0.16 },
      duration: 180,
      yoyo: true,
      ease: 'Sine.Out'
    });

    this.tweens.add({
      targets: [this.shiftInfoText, this.shiftSummaryText],
      scale: { from: 1, to: 1.04 },
      alpha: { from: 1, to: 0.72 },
      duration: 180,
      yoyo: true,
      ease: 'Sine.Out'
    });
  }

  // ─── Request initialisation ───────────────────────────────────────────────

  /**
   * Map street names to coordinates for request markers.
   * This allows shift-aware request rotation while maintaining consistent marker positions.
   */
  private readonly streetCoordinates: Record<string, { x: number; y: number }> = {
    'Poste Walk': { x: 1580, y: 410 },
    'Fishers Walk': { x: 1320, y: 1040 },
    'Inne Lane': { x: 570, y: 345 },
    'Ring Path': { x: 420, y: 860 },
    'Market Cross': { x: 980, y: 910 },
    'Hallow Bend': { x: 1460, y: 860 },
    'Hearth Row': { x: 250, y: 420 },
    'Forge Turn': { x: 1360, y: 380 }
  };

  /**
   * Get which streets are emphasized in the current shift for request distribution.
   */
  private getShiftEmphasisStreets(): string[] {
    const primaryStreets = getPrimaryStreetsForShift(this.townShift);
    return primaryStreets.map((key) => SANCTUARY_STREETS[key].name);
  }

  /**
   * Prioritize requests based on shift emphasis.
   * This affects the order in which requests appear in the visible pool.
   */
  private prioritizeRequestsByShift() {
    const emphasisStreets = this.getShiftEmphasisStreets();
    
    // Sort: emphasized streets first, then others
    this.townRequests.sort((a, b) => {
      const aEmphasis = emphasisStreets.indexOf(a.street);
      const bEmphasis = emphasisStreets.indexOf(b.street);
      const aIsEmphasized = aEmphasis !== -1;
      const bIsEmphasized = bEmphasis !== -1;
      
      if (aIsEmphasized && !bIsEmphasized) return -1;
      if (!aIsEmphasized && bIsEmphasized) return 1;
      if (aIsEmphasized && bIsEmphasized) return aEmphasis - bEmphasis;
      return 0;
    });
  }

  private initTownRequests() {
    this.townRequests = [
      {
        id: 'trinket_01',
        type: 'trinket',
        npcName: this.requestContacts.trinket,
        itemName: 'Coral Keepsake',
        street: 'Poste Walk',
        routeHint: 'Use Inne Lane, then cut east along Poste Walk.',
        gcReward: 12,
        materialReward: '2× Dried Herb',
        status: 'queued',
        // Trail-edge drop location, east side
        markerX: 1580,
        markerY: 410,
      },
      {
        id: 'ingredient_01',
        type: 'ingredient',
        npcName: this.requestContacts.ingredient,
        itemName: 'River Moss',
        street: 'Fishers Walk',
        routeHint: 'Drop to Fishers Walk from Market Cross and follow the blue lane signs.',
        gcReward: 10,
        materialReward: '1× Healing Potion (Minor)',
        status: 'queued',
        // Near Fisher's Walk
        markerX: 870,
        markerY: 1060,
      },
      {
        id: 'delivery_01',
        type: 'delivery',
        npcName: this.requestContacts.deliveryFrom,
        targetNpcName: this.requestContacts.deliveryTo,
        itemName: 'Trader\'s Note',
        street: 'Inne Lane',
        routeHint: 'Collect at Inne Lane, then deliver through Poste Walk.',
        gcReward: 8,
        materialReward: '3× Copper Coin Bundle',
        status: 'queued',
        // Note pick-up point: just outside the inn
        markerX: 570,
        markerY: 345,
      },
      {
        id: 'trinket_02',
        type: 'trinket',
        npcName: this.requestContacts.trinket,
        itemName: 'Weathered Hook Charm',
        street: 'Fishers Walk',
        routeHint: 'Run Fishers Walk eastbound until the dock bend.',
        gcReward: 9,
        materialReward: '1× Common Herb',
        status: 'queued',
        markerX: 1320,
        markerY: 1040,
      },
      {
        id: 'trinket_03',
        type: 'trinket',
        npcName: this.requestContacts.trinket,
        itemName: 'Lantern Clip',
        street: 'Ring Path',
        routeHint: 'Take Ring Path south and check the training edge.',
        gcReward: 11,
        materialReward: '1× Fiber Bundle',
        status: 'queued',
        markerX: 420,
        markerY: 860,
      },
      {
        id: 'ingredient_02',
        type: 'ingredient',
        npcName: this.requestContacts.ingredient,
        itemName: 'Salt Reed',
        street: 'Fishers Walk',
        routeHint: 'Follow Fishers Walk toward Driftwood side pools.',
        gcReward: 10,
        materialReward: '1× Clean Water',
        status: 'queued',
        markerX: 1490,
        markerY: 1080,
      },
      {
        id: 'ingredient_03',
        type: 'ingredient',
        npcName: this.requestContacts.ingredient,
        itemName: 'Dockmint Bundle',
        street: 'Market Cross',
        routeHint: 'Sweep Market Cross planters, then rejoin Towne corridor.',
        gcReward: 12,
        materialReward: '2× Dried Herb',
        status: 'queued',
        markerX: 980,
        markerY: 910,
      },
      {
        id: 'delivery_02',
        type: 'delivery',
        npcName: this.requestContacts.deliveryFrom,
        targetNpcName: this.requestContacts.deliveryTo,
        itemName: 'Shift Ledger Slip',
        street: 'Inne Lane',
        routeHint: 'Pick up near Inne Lane desk and deliver via Poste Walk.',
        gcReward: 9,
        materialReward: '2× Copper Coin Bundle',
        status: 'queued',
        markerX: 640,
        markerY: 300,
      },
      {
        id: 'delivery_03',
        type: 'delivery',
        npcName: this.requestContacts.deliveryFrom,
        targetNpcName: this.requestContacts.deliveryTo,
        itemName: 'Dock Route Note',
        street: 'Market Cross',
        routeHint: 'Start at Market Cross and carry through Fishers Walk connector.',
        gcReward: 10,
        materialReward: '1× Reed Root',
        status: 'queued',
        markerX: 1180,
        markerY: 350,
      },
    ];

    // Prioritize requests based on current shift's active streets
    this.prioritizeRequestsByShift();
  }

  // ─── Request board visual ─────────────────────────────────────────────────

  private drawRequestBoard() {
    // Small pinboard near Sanctuary Trading Poste lower corner
    const bx = 1570;
    const by = 490;
    this.add.rectangle(bx, by, 180, 104, 0x1c1917, 0.92)
      .setStrokeStyle(2, 0xfbbf24, 0.8)
      .setDepth(5);
    this.add.text(bx, by - 20, 'Town Requests', { color: '#fde68a', fontSize: '13px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(6);
    this.add.text(bx, by + 2, '★ Trinket  ★ Ingredient\n★ Delivery (street routes)', { color: '#e5e7eb', fontSize: '10px', align: 'center' }).setOrigin(0.5).setDepth(6);
    this.add.text(
      bx,
      by + 34,
      `Talk to ${this.requestContacts.trinket} · ${this.requestContacts.ingredient} · ${this.requestContacts.deliveryFrom}`,
      { color: '#cbd5e1', fontSize: '9px' }
    ).setOrigin(0.5).setDepth(6);
    this.requestBoardStatusText = this.add.text(bx, by + 48, '', {
      color: '#94a3b8',
      fontSize: '9px',
      align: 'center'
    }).setOrigin(0.5).setDepth(6);
    this.refreshRequestBoardStatus();
  }

  private refreshRequestBoardStatus() {
    if (!this.requestBoardStatusText) return;
    const available = this.townRequests.filter((r) => r.status === 'available').length;
    const active = this.townRequests.filter((r) => r.status === 'active').length;
    const queued = this.townRequests.filter((r) => r.status === 'queued').length;
    this.requestBoardStatusText.setText(`Board: ${available} open · ${active} active · ${queued} queued`);
  }

  private tryFishSpot() {
    for (const spot of this.fishingSpots) {
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, spot.x, spot.y) > 54) continue;
      const fish = spot.fishPool[Phaser.Math.Between(0, spot.fishPool.length - 1)];
      AudioManager.playFishing('catch');
      this.showMessage(`Caught ${fish} at ${spot.label}.`, '#93c5fd');
      return;
    }

    this.showMessage('Find a marked fishing spot first.', '#cbd5e1');
  }

  private showMessage(text: string, color: string) {
    this.messageText.setText(text);
    this.messageText.setColor(color);
  }

  private openInventory() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.inventory-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const items = this.getInventoryEntries();
    const playerLevel = Number(this.registry.get('currentCrownLevel') || this.registry.get('playerLevel') || this.registry.get('level') || 1);
    new InventoryMenu(items, (updated) => this.registry.set('inventory', updated), { playerLevel }).attach(container);
  }

  private openKingdomQuestMenu() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.kingdom-quest-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const entries = buildKingdomQuestMenuEntries(
      this.registry as unknown as { get: (key: string) => unknown },
      this.getInventoryEntries()
    );

    new KingdomQuestMenu(entries, () => {
      container.querySelector('.kingdom-quest-menu')?.remove();
    }).attach(container);
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
    title.innerText = `${SANCTUARY_NAMESETS.townCasual} Routes`;
    Object.assign(title.style, { color: '#93c5fd', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const spots: Array<{ label: string; scene: string }> = [
      { label: SANCTUARY_NAMESETS.townCasual, scene: 'SanctuaryTown' },
      { label: `${SANCTUARY_NAMESETS.regionCasual} Overworld Walk`, scene: 'SanctuaryIsleOverworld' },
      { label: `${SANCTUARY_NAMESETS.regionCasual} Trail`, scene: 'SanctuaryTrail' },
      { label: `${SANCTUARY_NAMESETS.regionCasual} Home Base`, scene: 'SanctuaryHomeBase' },
      { label: 'Haven Grounds', scene: 'HavenGrounds' }
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
      sceneLabel: 'Sanctuary Town',
      scopeKey: 'sanctuary-town',
      registry: this.registry,
    });
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
