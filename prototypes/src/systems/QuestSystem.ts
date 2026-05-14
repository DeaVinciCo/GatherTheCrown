/**
 * Quest System - Main quests, side quests, and progression
 */

export enum QuestType {
  MAIN = 'main',
  SIDE = 'side',
  FACTION = 'faction',
  KINGDOM_RESTORATION = 'kingdom_restoration',
  CREAT = 'creat',
  LEGENDARY = 'legendary',
  MYSTERY = 'mystery',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

export enum QuestStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'reach' | 'talk' | 'escort' | 'survive' | 'race' | 'craft';
  target: string;
  current: number;
  required: number;
  optional: boolean;
}

export interface QuestReward {
  xp: number;
  gold: number;
  items?: string[];
  crownShards?: number;
  factionRep?: { faction: string; amount: number };
  bondIncrease?: number;
  unlocks?: string[];
}

export class Quest {
  public id: string;
  public name: string;
  public description: string;
  public type: QuestType;
  public status: QuestStatus;
  public level: number;
  public objectives: QuestObjective[];
  public rewards: QuestReward;
  public giver: string;
  public location: string;
  public timeLimit?: number; // seconds
  public prerequisites: string[];
  public nextQuest?: string;
  public choices?: QuestChoice[];

  constructor(data: Partial<Quest>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.type = data.type || QuestType.SIDE;
    this.status = data.status || QuestStatus.LOCKED;
    this.level = data.level || 1;
    this.objectives = data.objectives || [];
    this.rewards = data.rewards || { xp: 0, gold: 0 };
    this.giver = data.giver || '';
    this.location = data.location || '';
    this.timeLimit = data.timeLimit;
    this.prerequisites = data.prerequisites || [];
    this.nextQuest = data.nextQuest;
    this.choices = data.choices;
  }

  /**
   * Check if quest can be started
   */
  public canStart(completedQuests: string[], playerLevel: number): boolean {
    if (this.status !== QuestStatus.AVAILABLE) return false;
    if (playerLevel < this.level) return false;
    
    // Check prerequisites
    return this.prerequisites.every(prereq => completedQuests.includes(prereq));
  }

  /**
   * Start the quest
   */
  public start(): void {
    if (this.status === QuestStatus.AVAILABLE) {
      this.status = QuestStatus.ACTIVE;
      console.log(`📜 Quest Started: ${this.name}`);
    }
  }

  /**
   * Update objective progress
   */
  public updateObjective(objectiveId: string, amount: number = 1): void {
    const objective = this.objectives.find(obj => obj.id === objectiveId);
    if (objective) {
      objective.current = Math.min(objective.current + amount, objective.required);
      console.log(`✓ ${objective.description}: ${objective.current}/${objective.required}`);
      
      // Check if quest is complete
      if (this.isComplete()) {
        this.complete();
      }
    }
  }

  /**
   * Check if all objectives are complete
   */
  public isComplete(): boolean {
    return this.objectives
      .filter(obj => !obj.optional)
      .every(obj => obj.current >= obj.required);
  }

  /**
   * Complete the quest
   */
  public complete(): void {
    if (this.status === QuestStatus.ACTIVE && this.isComplete()) {
      this.status = QuestStatus.COMPLETED;
      console.log(`🎉 Quest Completed: ${this.name}`);
      console.log(`Rewards: ${this.rewards.xp} XP, ${this.rewards.gold}g`);
    }
  }

  /**
   * Fail the quest
   */
  public fail(): void {
    this.status = QuestStatus.FAILED;
    console.log(`❌ Quest Failed: ${this.name}`);
  }

  /**
   * Get progress percentage
   */
  public getProgress(): number {
    const totalRequired = this.objectives.reduce((sum, obj) => sum + obj.required, 0);
    const totalCurrent = this.objectives.reduce((sum, obj) => sum + obj.current, 0);
    return totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 0;
  }
}

export interface QuestChoice {
  id: string;
  text: string;
  consequence: string;
  rewards?: Partial<QuestReward>;
  nextQuest?: string;
}

/**
 * Quest Manager - Manages all quests in the game
 */
export class QuestManager {
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();
  private playerLevel: number = 1;

  constructor() {
    this.initializeQuests();
  }

  /**
   * Initialize all quests
   */
  private initializeQuests(): void {
    // MAIN STORY QUESTS
    this.addQuest(new Quest({
      id: 'main_001',
      name: 'The Egg',
      description: 'Discover the mysterious egg in the forest and bring it to Elder Miriam.',
      type: QuestType.MAIN,
      status: QuestStatus.AVAILABLE,
      level: 1,
      giver: 'Elder Miriam',
      location: 'Home Village',
      objectives: [
        {
          id: 'find_egg',
          description: 'Find the mysterious egg',
          type: 'reach',
          target: 'forest_shrine',
          current: 0,
          required: 1,
          optional: false
        },
        {
          id: 'return_egg',
          description: 'Return to Elder Miriam',
          type: 'talk',
          target: 'elder_miriam',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 500,
        gold: 100,
        unlocks: ['creat_hatching']
      },
      prerequisites: [],
      nextQuest: 'main_002'
    }));

    this.addQuest(new Quest({
      id: 'main_002',
      name: 'The Hatching',
      description: 'Perform the hatching ritual and bond with your creat.',
      type: QuestType.MAIN,
      status: QuestStatus.LOCKED,
      level: 1,
      giver: 'Elder Miriam',
      location: 'Home Village',
      objectives: [
        {
          id: 'hatch_egg',
          description: 'Complete the hatching ritual',
          type: 'reach',
          target: 'hatching_altar',
          current: 0,
          required: 1,
          optional: false
        },
        {
          id: 'name_creat',
          description: 'Name your creat',
          type: 'talk',
          target: 'creat',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 1000,
        gold: 200,
        bondIncrease: 10,
        unlocks: ['creat_bonding', 'combat_training']
      },
      prerequisites: ['main_001'],
      nextQuest: 'main_003'
    }));

    this.addQuest(new Quest({
      id: 'main_003',
      name: 'Village Under Attack',
      description: 'Defend the village from corrupted creats!',
      type: QuestType.MAIN,
      status: QuestStatus.LOCKED,
      level: 2,
      giver: 'Elder Miriam',
      location: 'Home Village',
      objectives: [
        {
          id: 'defeat_corrupted',
          description: 'Defeat corrupted creats',
          type: 'kill',
          target: 'corrupted_wolf',
          current: 0,
          required: 5,
          optional: false
        },
        {
          id: 'save_villagers',
          description: 'Save villagers',
          type: 'escort',
          target: 'villagers',
          current: 0,
          required: 3,
          optional: true
        }
      ],
      rewards: {
        xp: 2000,
        gold: 500,
        items: ['leather_saddle', 'basic_sword']
      },
      prerequisites: ['main_002'],
      nextQuest: 'main_004'
    }));

    // FOREST TRIALS
    this.addQuest(new Quest({
      id: 'forest_trial_001',
      name: 'Forest Trials: Movement',
      description: 'Complete the movement trial to prove your riding skills.',
      type: QuestType.MAIN,
      status: QuestStatus.LOCKED,
      level: 3,
      giver: 'Trainer Kael',
      location: 'Forest Trials',
      objectives: [
        {
          id: 'complete_course',
          description: 'Complete the obstacle course',
          type: 'race',
          target: 'forest_course',
          current: 0,
          required: 1,
          optional: false
        },
        {
          id: 'time_bonus',
          description: 'Complete in under 2 minutes',
          type: 'race',
          target: 'forest_course_time',
          current: 0,
          required: 1,
          optional: true
        }
      ],
      rewards: {
        xp: 1500,
        gold: 300,
        unlocks: ['sprint_ability']
      },
      prerequisites: ['main_003']
    }));

    this.addQuest(new Quest({
      id: 'forest_trial_002',
      name: 'Forest Trials: Combat',
      description: 'Defeat the training dummies and prove your combat prowess.',
      type: QuestType.MAIN,
      status: QuestStatus.LOCKED,
      level: 4,
      giver: 'Trainer Kael',
      location: 'Forest Trials',
      objectives: [
        {
          id: 'defeat_dummies',
          description: 'Defeat training dummies',
          type: 'kill',
          target: 'training_dummy',
          current: 0,
          required: 10,
          optional: false
        },
        {
          id: 'perfect_combo',
          description: 'Land a 10-hit combo',
          type: 'kill',
          target: 'combo',
          current: 0,
          required: 1,
          optional: true
        }
      ],
      rewards: {
        xp: 1800,
        gold: 400,
        unlocks: ['heavy_attack']
      },
      prerequisites: ['forest_trial_001']
    }));

    this.addQuest(new Quest({
      id: 'forest_trial_003',
      name: 'Forest Trials: Bonding',
      description: 'Strengthen your bond with your creat through care and training.',
      type: QuestType.MAIN,
      status: QuestStatus.LOCKED,
      level: 5,
      giver: 'Caretaker Elara',
      location: 'Forest Trials',
      objectives: [
        {
          id: 'pet_creat',
          description: 'Pet your creat',
          type: 'talk',
          target: 'creat',
          current: 0,
          required: 5,
          optional: false
        },
        {
          id: 'feed_creat',
          description: 'Feed your creat',
          type: 'talk',
          target: 'creat',
          current: 0,
          required: 3,
          optional: false
        },
        {
          id: 'play_creat',
          description: 'Play with your creat',
          type: 'talk',
          target: 'creat',
          current: 0,
          required: 2,
          optional: false
        }
      ],
      rewards: {
        xp: 2000,
        gold: 500,
        bondIncrease: 20,
        unlocks: ['telepathy']
      },
      prerequisites: ['forest_trial_002'],
      nextQuest: 'choice_home_or_sylvara'
    }));

    // CHOICE QUEST: Home Base or Sylvara
    this.addQuest(new Quest({
      id: 'choice_home_or_sylvara',
      name: 'The Path Forward',
      description: 'Choose your next destination: establish a home base or head straight to Sylvara.',
      type: QuestType.MAIN,
      status: QuestStatus.LOCKED,
      level: 6,
      giver: 'Zara',
      location: 'Forest Trials Exit',
      objectives: [
        {
          id: 'make_choice',
          description: 'Choose your path',
          type: 'talk',
          target: 'zara',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 1000,
        gold: 0
      },
      prerequisites: ['forest_trial_003'],
      choices: [
        {
          id: 'go_home_base',
          text: 'Establish a home base first',
          consequence: 'Unlock home base, crafting, and preparation quests',
          rewards: { unlocks: ['home_base', 'crafting_station'] },
          nextQuest: 'home_base_001'
        },
        {
          id: 'go_sylvara',
          text: 'Head straight to Sylvara',
          consequence: 'Skip home base, go directly to first kingdom',
          rewards: { xp: 500 },
          nextQuest: 'sylvara_001'
        }
      ]
    }));

    // HOME BASE QUESTS
    this.addQuest(new Quest({
      id: 'home_base_001',
      name: 'Establishing Home',
      description: 'Find a suitable location and establish your home base.',
      type: QuestType.SIDE,
      status: QuestStatus.LOCKED,
      level: 6,
      giver: 'Zara',
      location: 'Between Forest Trials and Sylvara',
      objectives: [
        {
          id: 'find_location',
          description: 'Scout for home base location',
          type: 'reach',
          target: 'home_base_site',
          current: 0,
          required: 1,
          optional: false
        },
        {
          id: 'clear_area',
          description: 'Clear corrupted creats from area',
          type: 'kill',
          target: 'corrupted_creat',
          current: 0,
          required: 8,
          optional: false
        },
        {
          id: 'build_shelter',
          description: 'Gather materials and build shelter',
          type: 'collect',
          target: 'wood',
          current: 0,
          required: 20,
          optional: false
        }
      ],
      rewards: {
        xp: 3000,
        gold: 1000,
        unlocks: ['home_base', 'storage', 'rest_area']
      },
      prerequisites: ['choice_home_or_sylvara'],
      nextQuest: 'home_base_002'
    }));

    this.addQuest(new Quest({
      id: 'home_base_002',
      name: 'Crafting Station',
      description: 'Build a crafting station to create gear and items.',
      type: QuestType.SIDE,
      status: QuestStatus.LOCKED,
      level: 7,
      giver: 'Wandering Smith',
      location: 'Home Base',
      objectives: [
        {
          id: 'gather_iron',
          description: 'Gather iron ore',
          type: 'collect',
          target: 'iron_ore',
          current: 0,
          required: 15,
          optional: false
        },
        {
          id: 'build_forge',
          description: 'Build the forge',
          type: 'craft',
          target: 'forge',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 2500,
        gold: 800,
        unlocks: ['crafting', 'weapon_upgrades']
      },
      prerequisites: ['home_base_001'],
      nextQuest: 'sylvara_001'
    }));

    // SYLVARA KINGDOM QUESTS
    this.addQuest(new Quest({
      id: 'sylvara_001',
      name: 'The Forest Kingdom',
      description: 'Travel to Sylvara and investigate the corruption.',
      type: QuestType.MAIN,
      status: QuestStatus.LOCKED,
      level: 8,
      giver: 'Zara',
      location: 'Sylvara Entrance',
      objectives: [
        {
          id: 'reach_sylvara',
          description: 'Reach Sylvara ruins',
          type: 'reach',
          target: 'sylvara_entrance',
          current: 0,
          required: 1,
          optional: false
        },
        {
          id: 'meet_druid',
          description: 'Find Druid Elara',
          type: 'talk',
          target: 'druid_elara',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 4000,
        gold: 1500,
        unlocks: ['sylvara_map']
      },
      prerequisites: ['choice_home_or_sylvara'],
      nextQuest: 'sylvara_002'
    }));

    // SIDE QUESTS
    this.addSideQuests();
    this.addFactionQuests();
    this.addKingdomRestorationQuests();
  }

  /**
   * Add side quests
   */
  private addSideQuests(): void {
    // Lost Creat
    this.addQuest(new Quest({
      id: 'side_lost_creat',
      name: 'Lost Creat',
      description: 'A farmer has lost their creat. Help find it.',
      type: QuestType.SIDE,
      status: QuestStatus.AVAILABLE,
      level: 3,
      giver: 'Worried Farmer',
      location: 'Home Village',
      objectives: [
        {
          id: 'find_creat',
          description: 'Find the lost creat',
          type: 'reach',
          target: 'lost_creat_location',
          current: 0,
          required: 1,
          optional: false
        },
        {
          id: 'return_creat',
          description: 'Return creat to farmer',
          type: 'escort',
          target: 'farmer',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 500,
        gold: 300,
        items: ['creat_food_x5'],
        bondIncrease: 5
      },
      prerequisites: []
    }));

    // Bandit Camp
    this.addQuest(new Quest({
      id: 'side_bandit_camp',
      name: 'Bandit Trouble',
      description: 'Clear out the bandit camp threatening travelers.',
      type: QuestType.SIDE,
      status: QuestStatus.AVAILABLE,
      level: 10,
      giver: 'Village Guard',
      location: 'Forest Road',
      objectives: [
        {
          id: 'defeat_bandits',
          description: 'Defeat bandits',
          type: 'kill',
          target: 'bandit',
          current: 0,
          required: 12,
          optional: false
        },
        {
          id: 'defeat_leader',
          description: 'Defeat bandit leader',
          type: 'kill',
          target: 'bandit_leader',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 3000,
        gold: 2000,
        items: ['bandit_armor', 'stolen_goods']
      },
      prerequisites: []
    }));
  }

  /**
   * Add faction quests
   */
  private addFactionQuests(): void {
    // Watchers Initiation
    this.addQuest(new Quest({
      id: 'faction_watchers_001',
      name: 'Watcher Initiation',
      description: 'Prove your discipline to join the Watchers.',
      type: QuestType.FACTION,
      status: QuestStatus.AVAILABLE,
      level: 15,
      giver: 'Captain Frost',
      location: 'Watcher Headquarters',
      objectives: [
        {
          id: 'combat_trial',
          description: 'Complete combat trial',
          type: 'kill',
          target: 'training_opponent',
          current: 0,
          required: 5,
          optional: false
        },
        {
          id: 'discipline_test',
          description: 'Pass discipline test',
          type: 'survive',
          target: 'discipline_chamber',
          current: 0,
          required: 1,
          optional: false
        }
      ],
      rewards: {
        xp: 5000,
        gold: 3000,
        factionRep: { faction: 'watchers', amount: 50 },
        items: ['watcher_tabard'],
        unlocks: ['watcher_rank_1']
      },
      prerequisites: []
    }));
  }

  /**
   * Add kingdom restoration quests
   */
  private addKingdomRestorationQuests(): void {
    // Sylvara Restoration
    this.addQuest(new Quest({
      id: 'restore_sylvara_smithy',
      name: 'Rebuild the Smithy',
      description: 'Gather materials to rebuild Sylvara smithy.',
      type: QuestType.KINGDOM_RESTORATION,
      status: QuestStatus.LOCKED,
      level: 12,
      giver: 'Druid Elara',
      location: 'Sylvara',
      objectives: [
        {
          id: 'gather_wood',
          description: 'Gather ancient wood',
          type: 'collect',
          target: 'ancient_wood',
          current: 0,
          required: 30,
          optional: false
        },
        {
          id: 'gather_stone',
          description: 'Gather stone blocks',
          type: 'collect',
          target: 'stone_block',
          current: 0,
          required: 20,
          optional: false
        },
        {
          id: 'pay_gold',
          description: 'Pay construction costs',
          type: 'collect',
          target: 'gold',
          current: 0,
          required: 5000,
          optional: false
        }
      ],
      rewards: {
        xp: 8000,
        gold: 0,
        unlocks: ['sylvara_smithy', 'nature_weapon_crafting']
      },
      prerequisites: ['sylvara_vault_cleared']
    }));
  }

  /**
   * Add a quest to the manager
   */
  public addQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
  }

  /**
   * Get quest by ID
   */
  public getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Start a quest
   */
  public startQuest(questId: string): boolean {
    const quest = this.getQuest(questId);
    if (quest && quest.canStart(Array.from(this.completedQuests), this.playerLevel)) {
      quest.start();
      this.activeQuests.add(questId);
      return true;
    }
    return false;
  }

  /**
   * Update quest objective
   */
  public updateQuestObjective(questId: string, objectiveId: string, amount: number = 1): void {
    const quest = this.getQuest(questId);
    if (quest && this.activeQuests.has(questId)) {
      quest.updateObjective(objectiveId, amount);
      
      if (quest.status === QuestStatus.COMPLETED) {
        this.completeQuest(questId);
      }
    }
  }

  /**
   * Complete a quest
   */
  public completeQuest(questId: string): void {
    const quest = this.getQuest(questId);
    if (quest) {
      this.activeQuests.delete(questId);
      this.completedQuests.add(questId);
      
      // Unlock next quest
      if (quest.nextQuest) {
        const nextQuest = this.getQuest(quest.nextQuest);
        if (nextQuest) {
          nextQuest.status = QuestStatus.AVAILABLE;
        }
      }
    }
  }

  /**
   * Get all active quests
   */
  public getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests)
      .map(id => this.getQuest(id))
      .filter(q => q !== undefined) as Quest[];
  }

  /**
   * Get available quests
   */
  public getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values())
      .filter(q => q.status === QuestStatus.AVAILABLE && 
                   q.canStart(Array.from(this.completedQuests), this.playerLevel));
  }

  /**
   * Get quests by type
   */
  public getQuestsByType(type: QuestType): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.type === type);
  }

  /**
   * Set player level
   */
  public setPlayerLevel(level: number): void {
    this.playerLevel = level;
  }

  /**
   * Get quest statistics
   */
  public getStats(): {
    total: number;
    active: number;
    completed: number;
    available: number;
  } {
    return {
      total: this.quests.size,
      active: this.activeQuests.size,
      completed: this.completedQuests.size,
      available: this.getAvailableQuests().length
    };
  }
}

// Singleton instance
export const questManager = new QuestManager();
