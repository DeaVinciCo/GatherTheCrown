/**
 * GameRegistry - Global game state tracker
 * Stores and manages current user, hero, and game progress
 */
export class GameRegistry {
  private static instance: GameRegistry;

  // ── Auth session ───────────────────────────────────────────────────
  /** Supabase JWT access token — set on login, cleared on logout. */
  accessToken: string | null = null;
  /** When the access token expires (ms). Used to detect expiry before API calls. */
  tokenExpiresAt: number = 0;

  // ── Autosave debounce ──────────────────────────────────────────────
  private _syncTimer: ReturnType<typeof setTimeout> | null = null;

  // User & Account
  currentUserId: string | null = null;
  currentUsername: string | null = null;
  guestIntroCompleted: boolean = false;
  havenPathsUnlocked: boolean = false;
  havenUnlocked: boolean = false;
  forestTrialsStarted: boolean = false;
  homeBaseUnlocked: boolean = false;
  kingdomArcUnlocked: boolean = false;
  homeBaseName: string = 'Sanctuary';
  homeBaseRegionName: string = 'Sanctuary Isle';
  homeBaseNameOptions: string[] = [];
  homeBaseNameChosen: boolean = false;
  homeBaseRestDays: number = 0;
  homeBaseStoryReady: boolean = false;
  homeBaseDay1Inspected: boolean = false;
  homeBaseDay1SuppliesGathered: boolean = false;
  homeBaseDay2Crafted: boolean = false;
  homeBaseDay2EggCared: boolean = false;

  // Hero
  currentHeroId: string | null = null;
  heroName: string = '';
  heroGender: 'male' | 'female' | '' = '';
  heroClass: string = 'Knight';
  heroElement: string = 'Fire';
  heroRace: string = 'Human';
  heroSkinTone: string = 'tan';
  heroHairStyle: string = 'short';
  heroHairColor: string = 'brown';
  heroTattoo: string = '';
  heroOriginTrait: string = 'Realm-born';
  heroCombatDoctrine: string = 'Balanced';
  heroSelectedWeapons: string[] = [];
  lastScene: string = 'ForestZone';
  gold: number = 25;
  soulshards: number = 0;
  greenGems: number = 0;
  redGems: number = 0;
  emberFruit: number = 0;
  crownFragments: number = 0;

  // Game state
  inventory: Array<{ id: string; name: string; equipped?: boolean }> = [];
  unlockedSkills: string[] = [];           // permanent skill unlocks (e.g., campfire)
  completedSkillLessons: string[] = [];    // progressive lesson cutscenes already shown

  // Creat bond & care state
  creatBond: number = 0;          // 0–100 bond percentage
  creatHunger: number = 100;      // 0–100 fullness (100 = full, 0 = starving)
  creatElement: string = '';      // element of the bonded creat
  creatCompatibility: 'match' | 'diverge' = 'match';
  creatOffensePoints: number = 0; // 0–100 wrongdoing accumulation (maps to 6 offense tiers)
  creatRunaway: boolean = false;  // true when trust is severed and creat runs off
  creatCorrupted: boolean = false; // true when runaway creat turns foe-aligned
  creatTrackerTag: string = 'King\'s Sigil Band'; // tracking marker attached to creat gear
  creatLastSeenKingdom: string = 'Haven';
  creatLastFedAt: number = 0;     // Unix timestamp (ms) of last feeding
  creatLastCaredAt: number = 0;   // Unix timestamp (ms) of last groom/play/rest
  hasCreatEgg: boolean = false;
  hasHatchedCreat: boolean = false;
  creatStage: string = 'none';
  creatName: string = '';           // player-given or auto-generated creat name
  creatSpecies: string = '';        // exact selected species (core or variant)
  heroLevel: number = 1;            // hero level; creat rename unlocks at 20
  storyModeCompleted: boolean = false; // unlocks additional hero slots after story
  creatInventory: Array<{ id: string; name: string; quantity: number; type: 'food' | 'drink' | 'gear' | 'potion' | 'craft' }> = [];

  private constructor() {}

  private generateHomeBaseNameOptions(): string[] {
    const prefixes = ['Dawn', 'Star', 'Hearth', 'Mist', 'Bright', 'Moon', 'Ember', 'Stone', 'Wind', 'Silver', 'Sun', 'Sky'];
    const suffixes = ['rest', 'watch', 'wake', 'grove', 'water', 'harbor', 'fall', 'haven', 'mere', 'hold', 'gate', 'field'];
    const options = new Set<string>(['Sanctuary']);

    while (options.size < 10) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      options.add(`${prefix}${suffix}`);
    }

    return [...options];
  }

  static getInstance(): GameRegistry {
    if (!GameRegistry.instance) {
      GameRegistry.instance = new GameRegistry();
      GameRegistry.instance.homeBaseNameOptions = GameRegistry.instance.generateHomeBaseNameOptions();
    }
    return GameRegistry.instance;
  }

  // User Login
  setUser(userId: string, username: string) {
    this.currentUserId = userId;
    this.currentUsername = username;
    this.saveToLocalStorage();
  }

  /** Store Supabase session after sign-in. */
  setSession(accessToken: string, expiresAt: number, userId: string, username: string) {
    this.accessToken = accessToken;
    this.tokenExpiresAt = expiresAt;
    this.currentUserId = userId;
    this.currentUsername = username;
    this.saveToLocalStorage();
  }

  /** Clear session on logout. */
  clearSession() {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.clear();
  }

  setGuestIntroCompleted(completed: boolean) {
    this.guestIntroCompleted = completed;
    this.saveToLocalStorage();
  }

  setHavenPathsUnlocked(unlocked: boolean) {
    this.havenPathsUnlocked = unlocked;
    this.saveToLocalStorage();
  }

  setHavenUnlocked(unlocked: boolean) {
    this.havenUnlocked = unlocked;
    this.saveToLocalStorage();
  }

  setForestTrialsStarted(started: boolean) {
    this.forestTrialsStarted = started;
    this.saveToLocalStorage();
  }

  setHomeBaseUnlocked(unlocked: boolean) {
    this.homeBaseUnlocked = unlocked;
    this.saveToLocalStorage();
  }

  setKingdomArcUnlocked(unlocked: boolean) {
    this.kingdomArcUnlocked = unlocked;
    this.saveToLocalStorage();
  }

  setHomeBaseName(name: string) {
    if (!name) return;
    this.homeBaseName = name;
    this.saveToLocalStorage();
  }

  setHomeBaseNameChosen(chosen: boolean) {
    this.homeBaseNameChosen = chosen;
    this.saveToLocalStorage();
  }

  addHomeBaseRestDay() {
    this.homeBaseRestDays = Math.min(2, this.homeBaseRestDays + 1);
    if (this.homeBaseRestDays >= 2) {
      this.homeBaseStoryReady = true;
    }
    this.saveToLocalStorage();
  }

  resetHomeBaseReadiness() {
    this.homeBaseRestDays = 0;
    this.homeBaseStoryReady = false;
    this.homeBaseDay1Inspected = false;
    this.homeBaseDay1SuppliesGathered = false;
    this.homeBaseDay2Crafted = false;
    this.homeBaseDay2EggCared = false;
    this.saveToLocalStorage();
  }

  setHomeBaseDay1Inspected(done: boolean) {
    this.homeBaseDay1Inspected = done;
    this.saveToLocalStorage();
  }

  setHomeBaseDay1SuppliesGathered(done: boolean) {
    this.homeBaseDay1SuppliesGathered = done;
    this.saveToLocalStorage();
  }

  setHomeBaseDay2Crafted(done: boolean) {
    this.homeBaseDay2Crafted = done;
    this.saveToLocalStorage();
  }

  setHomeBaseDay2EggCared(done: boolean) {
    this.homeBaseDay2EggCared = done;
    this.saveToLocalStorage();
  }

  canAdvanceFromHomeBaseDay(day: number): boolean {
    if (day <= 0) {
      return this.homeBaseDay1Inspected && this.homeBaseDay1SuppliesGathered;
    }
    if (day === 1) {
      return this.homeBaseDay2Crafted && this.homeBaseDay2EggCared;
    }
    return true;
  }

  getHomeBasePendingTasks(day: number): string[] {
    const pending: string[] = [];
    if (day <= 0) {
      if (!this.homeBaseDay1Inspected) pending.push('Inspect Home Base Needs');
      if (!this.homeBaseDay1SuppliesGathered) pending.push('Gather Missing Supplies');
      return pending;
    }
    if (day === 1) {
      if (!this.homeBaseDay2Crafted) pending.push('Craft Travel Kit');
      if (!this.homeBaseDay2EggCared) pending.push('Care for Egg / Secure Nest');
      return pending;
    }
    return pending;
  }

  completeHomeBaseDayIfReady(): boolean {
    const day = this.homeBaseRestDays;
    if (day >= 2) {
      this.homeBaseStoryReady = true;
      this.saveToLocalStorage();
      return true;
    }
    if (!this.canAdvanceFromHomeBaseDay(day)) {
      return false;
    }
    this.addHomeBaseRestDay();
    return true;
  }

  ensureHomeBaseStoryReadyState() {
    if (this.homeBaseRestDays >= 2) {
      this.homeBaseStoryReady = true;
    }
    this.saveToLocalStorage();
  }

  refreshHomeBaseNameOptions() {
    this.homeBaseNameOptions = this.generateHomeBaseNameOptions();
    this.saveToLocalStorage();
  }

  // Hero Creation
  setHero(heroId: string, heroData: {
    name: string;
    class: string;
    element: string;
    race: string;
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    originTrait?: string;
    combatDoctrine?: string;
    selectedWeapons?: string[];
    tattoo?: string;
    creatElement?: string;
    creatCompatibility?: 'match' | 'diverge';
    startingBond?: number;
    gender?: 'male' | 'female';
  }) {
    this.currentHeroId = heroId;
    this.heroName = heroData.name;
    if (heroData.gender) this.heroGender = heroData.gender;
    this.heroClass = heroData.class;
    this.heroElement = heroData.element;
    this.heroRace = heroData.race;
    this.heroSkinTone = heroData.skinTone;
    this.heroHairStyle = heroData.hairStyle;
    this.heroHairColor = heroData.hairColor;
    this.heroTattoo = heroData.tattoo || '';
    this.heroOriginTrait = heroData.originTrait || 'Realm-born';
    this.heroCombatDoctrine = heroData.combatDoctrine || 'Balanced';
    this.heroSelectedWeapons = heroData.selectedWeapons || [];
    if (heroData.creatElement !== undefined) this.creatElement = heroData.creatElement;
    if (heroData.creatCompatibility !== undefined) this.creatCompatibility = heroData.creatCompatibility;
    if (heroData.startingBond !== undefined) this.creatBond = heroData.startingBond;
    this.saveToLocalStorage();
  }

  // Update last scene
  setCurrentScene(sceneName: string) {
    this.lastScene = sceneName;
    this.saveToLocalStorage();
  }

  setHeroGender(gender: 'male' | 'female') {
    this.heroGender = gender;
    this.saveToLocalStorage();
  }

  // Update gold
  addGold(amount: number) {
    this.gold += amount;
    this.saveToLocalStorage();
  }

  setGold(amount: number) {
    this.gold = amount;
    this.saveToLocalStorage();
  }

  setSoulshards(amount: number) {
    this.soulshards = amount;
    this.saveToLocalStorage();
  }

  setGreenGems(amount: number) {
    this.greenGems = amount;
    this.saveToLocalStorage();
  }

  setRedGems(amount: number) {
    this.redGems = amount;
    this.saveToLocalStorage();
  }

  setEmberFruit(amount: number) {
    this.emberFruit = amount;
    this.saveToLocalStorage();
  }

  setCrownFragments(amount: number) {
    this.crownFragments = amount;
    this.saveToLocalStorage();
  }

  unlockSkill(skillId: string) {
    if (!skillId) return;
    if (this.unlockedSkills.includes(skillId)) return;
    this.unlockedSkills = [...this.unlockedSkills, skillId];
    this.saveToLocalStorage();
  }

  hasSkill(skillId: string): boolean {
    return this.unlockedSkills.includes(skillId);
  }

  markSkillLessonSeen(skillId: string) {
    if (!skillId) return;
    if (this.completedSkillLessons.includes(skillId)) return;
    this.completedSkillLessons = [...this.completedSkillLessons, skillId];
    this.saveToLocalStorage();
  }

  shouldPlaySkillLesson(skillId: string): boolean {
    return this.hasSkill(skillId) && !this.completedSkillLessons.includes(skillId);
  }

  // Clear all data (logout)
  clear() {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.currentUserId = null;
    this.currentUsername = null;
    this.guestIntroCompleted = false;
    this.havenPathsUnlocked = false;
    this.havenUnlocked = false;
    this.forestTrialsStarted = false;
    this.homeBaseUnlocked = false;
    this.kingdomArcUnlocked = false;
    this.homeBaseName = 'Sanctuary';
    this.homeBaseRegionName = 'Sanctuary Isle';
    this.homeBaseNameOptions = this.generateHomeBaseNameOptions();
    this.homeBaseNameChosen = false;
    this.homeBaseRestDays = 0;
    this.homeBaseStoryReady = false;
    this.homeBaseDay1Inspected = false;
    this.homeBaseDay1SuppliesGathered = false;
    this.homeBaseDay2Crafted = false;
    this.homeBaseDay2EggCared = false;
    this.currentHeroId = null;
    this.heroName = '';
    this.heroGender = '';
    this.heroClass = 'Knight';
    this.heroElement = 'Fire';
    this.heroRace = 'Human';
    this.heroSkinTone = 'tan';
    this.heroHairStyle = 'short';
    this.heroHairColor = 'brown';
    this.heroTattoo = '';
    this.heroOriginTrait = 'Realm-born';
    this.heroCombatDoctrine = 'Balanced';
    this.heroSelectedWeapons = [];
    this.lastScene = 'ForestZone';
    this.gold = 25;
    this.soulshards = 0;
    this.greenGems = 0;
    this.redGems = 0;
    this.emberFruit = 0;
    this.crownFragments = 0;
    this.inventory = [];
    this.unlockedSkills = [];
    this.completedSkillLessons = [];
    this.creatBond = 0;
    this.creatHunger = 100;
    this.creatElement = '';
    this.creatCompatibility = 'match';
    this.creatOffensePoints = 0;
    this.creatRunaway = false;
    this.creatCorrupted = false;
    this.creatTrackerTag = 'King\'s Sigil Band';
    this.creatLastSeenKingdom = 'Haven';
    this.creatLastFedAt = 0;
    this.creatLastCaredAt = 0;
    this.hasCreatEgg = false;
    this.hasHatchedCreat = false;
    this.creatStage = 'none';
    this.creatName = '';
    this.creatSpecies = '';
    this.heroLevel = 1;
    this.storyModeCompleted = false;
    this.creatInventory = [];
    localStorage.removeItem('gatherTheCrownRegistry');
  }

  // Persist to localStorage
  saveToLocalStorage() {
    const data = {
      accessToken: this.accessToken,
      tokenExpiresAt: this.tokenExpiresAt,
      currentUserId: this.currentUserId,
      currentUsername: this.currentUsername,
      guestIntroCompleted: this.guestIntroCompleted,
      havenPathsUnlocked: this.havenPathsUnlocked,
      havenUnlocked: this.havenUnlocked,
      forestTrialsStarted: this.forestTrialsStarted,
      homeBaseUnlocked: this.homeBaseUnlocked,
      kingdomArcUnlocked: this.kingdomArcUnlocked,
      homeBaseName: this.homeBaseName,
      homeBaseRegionName: this.homeBaseRegionName,
      homeBaseNameOptions: this.homeBaseNameOptions,
      homeBaseNameChosen: this.homeBaseNameChosen,
      homeBaseRestDays: this.homeBaseRestDays,
      homeBaseStoryReady: this.homeBaseStoryReady,
      homeBaseDay1Inspected: this.homeBaseDay1Inspected,
      homeBaseDay1SuppliesGathered: this.homeBaseDay1SuppliesGathered,
      homeBaseDay2Crafted: this.homeBaseDay2Crafted,
      homeBaseDay2EggCared: this.homeBaseDay2EggCared,
      currentHeroId: this.currentHeroId,
      heroName: this.heroName,
      heroGender: this.heroGender,
      heroClass: this.heroClass,
      heroElement: this.heroElement,
      heroRace: this.heroRace,
      heroSkinTone: this.heroSkinTone,
      heroHairStyle: this.heroHairStyle,
      heroHairColor: this.heroHairColor,
      heroTattoo: this.heroTattoo,
      heroOriginTrait: this.heroOriginTrait,
      heroCombatDoctrine: this.heroCombatDoctrine,
      heroSelectedWeapons: this.heroSelectedWeapons,
      lastScene: this.lastScene,
      gold: this.gold,
      soulshards: this.soulshards,
      greenGems: this.greenGems,
      redGems: this.redGems,
      emberFruit: this.emberFruit,
      crownFragments: this.crownFragments,
      inventory: this.inventory,
      unlockedSkills: this.unlockedSkills,
      completedSkillLessons: this.completedSkillLessons,
      creatBond: this.creatBond,
      creatHunger: this.creatHunger,
      creatElement: this.creatElement,
      creatCompatibility: this.creatCompatibility,
      creatOffensePoints: this.creatOffensePoints,
      creatRunaway: this.creatRunaway,
      creatCorrupted: this.creatCorrupted,
      creatTrackerTag: this.creatTrackerTag,
      creatLastSeenKingdom: this.creatLastSeenKingdom,
      creatLastFedAt: this.creatLastFedAt,
      creatLastCaredAt: this.creatLastCaredAt,
      hasCreatEgg: this.hasCreatEgg,
      hasHatchedCreat: this.hasHatchedCreat,
      creatStage: this.creatStage,
      creatName: this.creatName,
      creatSpecies: this.creatSpecies,
      heroLevel: this.heroLevel,
      storyModeCompleted: this.storyModeCompleted,
      creatInventory: this.creatInventory
    };
    localStorage.setItem('gatherTheCrownRegistry', JSON.stringify(data));
    // Schedule debounced cloud save whenever local state is flushed
    this.scheduleSyncToServer();
  }

  // Load from localStorage
  loadFromLocalStorage() {
    const data = localStorage.getItem('gatherTheCrownRegistry');
    if (data) {
      const parsed = JSON.parse(data);
      Object.assign(this, parsed);
    }
    // Discard expired tokens so stale sessions don't block sign-in
    if (this.tokenExpiresAt && Date.now() > this.tokenExpiresAt * 1000) {
      this.accessToken = null;
      this.tokenExpiresAt = 0;
    }
    if (!this.homeBaseNameOptions || this.homeBaseNameOptions.length < 10) {
      this.homeBaseNameOptions = this.generateHomeBaseNameOptions();
    }
    if (this.heroGender !== 'male' && this.heroGender !== 'female') {
      this.heroGender = '';
    }
    if (typeof this.homeBaseDay1Inspected !== 'boolean') {
      this.homeBaseDay1Inspected = false;
    }
    if (typeof this.homeBaseDay1SuppliesGathered !== 'boolean') {
      this.homeBaseDay1SuppliesGathered = false;
    }
    if (typeof this.homeBaseDay2Crafted !== 'boolean') {
      this.homeBaseDay2Crafted = false;
    }
    if (typeof this.homeBaseDay2EggCared !== 'boolean') {
      this.homeBaseDay2EggCared = false;
    }
    this.ensureHomeBaseStoryReadyState();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUserId !== null;
  }

  // Check if hero is forged
  isHeroForged(): boolean {
    return this.currentHeroId !== null && this.heroName !== '';
  }

  // ── Server autosave ────────────────────────────────────────────────
  /**
   * Schedule a debounced server sync.
   * Call this whenever meaningful state changes so progress is persisted
   * to the database without flooding the server on every tick.
   */
  scheduleSyncToServer(delayMs = 4000) {
    if (!this.isLoggedIn() || !this.currentHeroId || !this.accessToken) return;
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      this._syncTimer = null;
      this.syncToServer().catch(() => { /* silent — will retry on next change */ });
    }, delayMs);
  }

  /** Immediately push all registry hero state to the server. */
  async syncToServer(): Promise<void> {
    if (!this.isLoggedIn() || !this.currentHeroId || !this.accessToken) return;

    const payload = {
      currentScene: this.lastScene,
      gold: this.gold,
      level: this.heroLevel,
      soulshards: this.soulshards,
      greenGems: this.greenGems,
      redGems: this.redGems,
      emberFruit: this.emberFruit,
      crownFragments: this.crownFragments,
      heroGender: this.heroGender,
      creatElement: this.creatElement,
      creatName: this.creatName,
      creatSpecies: this.creatSpecies,
      creatCompatibility: this.creatCompatibility,
      creatBond: this.creatBond,
      creatHunger: this.creatHunger,
      creatOffensePoints: this.creatOffensePoints,
      creatRunaway: this.creatRunaway,
      creatCorrupted: this.creatCorrupted,
      creatStage: this.creatStage,
      hasCreatEgg: this.hasCreatEgg,
      hasHatchedCreat: this.hasHatchedCreat,
      creatInventory: JSON.stringify(this.creatInventory),
      creatTrackerTag: this.creatTrackerTag,
      creatLastSeenKingdom: this.creatLastSeenKingdom,
      creatLastFedAt: new Date(this.creatLastFedAt || Date.now()).toISOString(),
      creatLastCaredAt: new Date(this.creatLastCaredAt || Date.now()).toISOString(),
      storyModeCompleted: this.storyModeCompleted,
      havenPathsUnlocked: this.havenPathsUnlocked,
      havenUnlocked: this.havenUnlocked,
      forestTrialsStarted: this.forestTrialsStarted,
      homeBaseUnlocked: this.homeBaseUnlocked,
      kingdomArcUnlocked: this.kingdomArcUnlocked,
      unlockedSkills: JSON.stringify(this.unlockedSkills),
      completedSkillLessons: JSON.stringify(this.completedSkillLessons),
      homeBaseName: this.homeBaseName,
      homeBaseRegionName: this.homeBaseRegionName,
      homeBaseNameChosen: this.homeBaseNameChosen,
      homeBaseRestDays: this.homeBaseRestDays,
      homeBaseStoryReady: this.homeBaseStoryReady,
      homeBaseDay1Inspected: this.homeBaseDay1Inspected,
      homeBaseDay1SuppliesGathered: this.homeBaseDay1SuppliesGathered,
      homeBaseDay2Crafted: this.homeBaseDay2Crafted,
      homeBaseDay2EggCared: this.homeBaseDay2EggCared
    };

    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:2567';
    await fetch(`${API_BASE}/heroes/${this.currentHeroId}/state`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(payload)
    });
  }

  /**
   * Hydrate registry from a hero record returned by GET /auth/me.
   * Restores all server-persisted state into the local registry.
   */
  hydrateFromHero(hero: Record<string, any>) {
    this.currentHeroId = hero.id;
    this.heroName = hero.name;
    this.heroClass = hero.class;
    this.heroElement = hero.element;
    this.heroRace = hero.race;
    this.heroSkinTone = hero.skinTone;
    this.heroHairStyle = hero.hairStyle;
    this.heroHairColor = hero.hairColor;
    this.heroTattoo = hero.heroTattoo ?? '';
    this.heroGender = hero.heroGender ?? '';
    this.heroOriginTrait = hero.originTrait ?? 'Realm-born';
    this.heroCombatDoctrine = hero.combatDoctrine ?? 'Balanced';
    this.heroSelectedWeapons = typeof hero.selectedWeapons === 'string'
      ? JSON.parse(hero.selectedWeapons)
      : (hero.selectedWeapons ?? []);
    this.lastScene = hero.currentScene ?? 'ForestZone';
    this.heroLevel = hero.level ?? 1;
    this.gold = hero.gold ?? 25;
    this.soulshards = hero.soulshards ?? 0;
    this.greenGems = hero.greenGems ?? 0;
    this.redGems = hero.redGems ?? 0;
    this.emberFruit = hero.emberFruit ?? 0;
    this.crownFragments = hero.crownFragments ?? 0;
    this.creatElement = hero.creatElement ?? '';
    this.creatName = hero.creatName ?? '';
    this.creatSpecies = hero.creatSpecies ?? '';
    this.creatCompatibility = (hero.creatCompatibility ?? 'match') as 'match' | 'diverge';
    this.creatBond = hero.creatBond ?? 0;
    this.creatHunger = hero.creatHunger ?? 100;
    this.creatOffensePoints = hero.creatOffensePoints ?? 0;
    this.creatRunaway = hero.creatRunaway ?? false;
    this.creatCorrupted = hero.creatCorrupted ?? false;
    this.creatStage = hero.creatStage ?? 'none';
    this.hasCreatEgg = hero.hasCreatEgg ?? false;
    this.hasHatchedCreat = hero.hasHatchedCreat ?? false;
    this.creatInventory = typeof hero.creatInventory === 'string'
      ? JSON.parse(hero.creatInventory)
      : (hero.creatInventory ?? []);
    this.creatTrackerTag = hero.creatTrackerTag ?? "King's Sigil Band";
    this.creatLastSeenKingdom = hero.creatLastSeenKingdom ?? 'Haven';
    this.creatLastFedAt = hero.creatLastFedAt ? new Date(hero.creatLastFedAt).getTime() : 0;
    this.creatLastCaredAt = hero.creatLastCaredAt ? new Date(hero.creatLastCaredAt).getTime() : 0;
    this.storyModeCompleted = hero.storyModeCompleted ?? false;
    this.havenPathsUnlocked = hero.havenPathsUnlocked ?? false;
    this.havenUnlocked = hero.havenUnlocked ?? false;
    this.forestTrialsStarted = hero.forestTrialsStarted ?? false;
    this.homeBaseUnlocked = hero.homeBaseUnlocked ?? false;
    this.kingdomArcUnlocked = hero.kingdomArcUnlocked ?? false;
    this.unlockedSkills = typeof hero.unlockedSkills === 'string'
      ? JSON.parse(hero.unlockedSkills)
      : (hero.unlockedSkills ?? []);
    this.completedSkillLessons = typeof hero.completedSkillLessons === 'string'
      ? JSON.parse(hero.completedSkillLessons)
      : (hero.completedSkillLessons ?? []);
    this.homeBaseName = hero.homeBaseName ?? 'Sanctuary';
    this.homeBaseRegionName = hero.homeBaseRegionName ?? 'Sanctuary Isle';
    this.homeBaseNameChosen = hero.homeBaseNameChosen ?? false;
    this.homeBaseRestDays = hero.homeBaseRestDays ?? 0;
    this.homeBaseStoryReady = hero.homeBaseStoryReady ?? false;
    this.homeBaseDay1Inspected = hero.homeBaseDay1Inspected ?? false;
    this.homeBaseDay1SuppliesGathered = hero.homeBaseDay1SuppliesGathered ?? false;
    this.homeBaseDay2Crafted = hero.homeBaseDay2Crafted ?? false;
    this.homeBaseDay2EggCared = hero.homeBaseDay2EggCared ?? false;
    this.ensureHomeBaseStoryReadyState();
    this.saveToLocalStorage();
  }
}

export const gameRegistry = GameRegistry.getInstance();
