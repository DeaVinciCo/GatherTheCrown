/**
 * Story Progression System - Tracks player's journey through the story
 */

import { questManager, QuestType } from './QuestSystem';
import { kingdomManager } from './KingdomManager';
import { dialogueManager } from './DialogueManager';

export enum StoryAct {
  ACT_1_AWAKENING = 'act_1',
  ACT_2_ELEMENTAL_TRIALS = 'act_2',
  ACT_3_SHADOWS_AND_LIGHT = 'act_3',
  ACT_4_CROWN_CONVERGENCE = 'act_4'
}

export enum StoryChoice {
  // Forest Trials
  HOME_BASE_FIRST = 'home_base_first',
  SYLVARA_DIRECT = 'sylvara_direct',
  
  // Sylvara
  PURIFY_CORRUPTION = 'purify_corruption',
  BURN_CORRUPTION = 'burn_corruption',
  
  // Pyrrathia
  JOIN_PURIFIERS = 'join_purifiers',
  STAY_NEUTRAL_FIRE = 'stay_neutral_fire',
  
  // Frostvale
  THAW_DRAGON = 'thaw_dragon',
  LEAVE_DRAGON_FROZEN = 'leave_dragon_frozen',
  KILL_DRAGON = 'kill_dragon',
  
  // Zerath Dunes
  DESTROY_SUN_LEGACY = 'destroy_sun_legacy',
  PRESERVE_SUN_LEGACY = 'preserve_sun_legacy',
  
  // Mor'gahl Fen
  ACCEPT_POISON_MAGIC = 'accept_poison_magic',
  REFUSE_POISON_MAGIC = 'refuse_poison_magic',
  
  // Luminaris
  FREE_EMPRESS = 'free_empress',
  LEAVE_EMPRESS_CRYSTALLIZED = 'leave_empress_crystallized',
  
  // Umbral Reach
  MERCY_KILL_SHADOW_KING = 'mercy_kill_shadow_king',
  LET_SHADOW_KING_SEAL = 'let_shadow_king_seal',
  
  // Crown Convergence
  REDEEM_KAEL = 'redeem_kael',
  CONDEMN_KAEL = 'condemn_kael',
  
  // Final Choice
  RESTORE_CROWN = 'restore_crown',
  DESTROY_CROWN = 'destroy_crown',
  CLAIM_CROWN_SOLO = 'claim_crown_solo',
  GIVE_CROWN_TO_CREAT = 'give_crown_to_creat'
}

export interface StoryMilestone {
  id: string;
  name: string;
  description: string;
  act: StoryAct;
  unlocked: boolean;
  timestamp?: Date;
}

export class StoryProgression {
  private currentAct: StoryAct = StoryAct.ACT_1_AWAKENING;
  private choices: Map<StoryChoice, boolean> = new Map();
  private milestones: Map<string, StoryMilestone> = new Map();
  private playerAlignment: number = 0; // -100 (evil) to +100 (good)

  constructor() {
    this.initializeMilestones();
  }

  /**
   * Initialize story milestones
   */
  private initializeMilestones(): void {
    const milestones: StoryMilestone[] = [
      // Act 1
      { id: 'egg_discovered', name: 'The Egg', description: 'Found the mysterious egg', act: StoryAct.ACT_1_AWAKENING, unlocked: false },
      { id: 'creat_hatched', name: 'First Bond', description: 'Your creat hatched', act: StoryAct.ACT_1_AWAKENING, unlocked: false },
      { id: 'village_destroyed', name: 'Home Lost', description: 'Village destroyed by corruption', act: StoryAct.ACT_1_AWAKENING, unlocked: false },
      { id: 'forest_trials_complete', name: 'Trials Complete', description: 'Completed Forest Trials', act: StoryAct.ACT_1_AWAKENING, unlocked: false },
      { id: 'sylvara_discovered', name: 'Forest Kingdom', description: 'Discovered Sylvara ruins', act: StoryAct.ACT_1_AWAKENING, unlocked: false },
      { id: 'first_fragment', name: 'Crown Fragment', description: 'Recovered first Crown fragment', act: StoryAct.ACT_1_AWAKENING, unlocked: false },
      
      // Act 2
      { id: 'pyrrathia_cleared', name: 'Flames Conquered', description: 'Cleared Pyrrathia vault', act: StoryAct.ACT_2_ELEMENTAL_TRIALS, unlocked: false },
      { id: 'frostvale_cleared', name: 'Ice Broken', description: 'Cleared Frostvale vault', act: StoryAct.ACT_2_ELEMENTAL_TRIALS, unlocked: false },
      { id: 'zerath_cleared', name: 'Desert Reclaimed', description: 'Cleared Zerath Dunes vault', act: StoryAct.ACT_2_ELEMENTAL_TRIALS, unlocked: false },
      { id: 'four_fragments', name: 'Half Complete', description: 'Collected 4 Crown fragments', act: StoryAct.ACT_2_ELEMENTAL_TRIALS, unlocked: false },
      
      // Act 3
      { id: 'morgahl_cleared', name: 'Swamp Cleansed', description: 'Cleared Mor\'gahl Fen vault', act: StoryAct.ACT_3_SHADOWS_AND_LIGHT, unlocked: false },
      { id: 'luminaris_cleared', name: 'Light Restored', description: 'Cleared Luminaris vault', act: StoryAct.ACT_3_SHADOWS_AND_LIGHT, unlocked: false },
      { id: 'umbral_cleared', name: 'Darkness Embraced', description: 'Cleared Umbral Reach vault', act: StoryAct.ACT_3_SHADOWS_AND_LIGHT, unlocked: false },
      { id: 'void_revealed', name: 'True Enemy', description: 'Discovered the Void Entity', act: StoryAct.ACT_3_SHADOWS_AND_LIGHT, unlocked: false },
      
      // Act 4
      { id: 'convergence_unlocked', name: 'Sky Islands', description: 'Unlocked Crown Convergence', act: StoryAct.ACT_4_CROWN_CONVERGENCE, unlocked: false },
      { id: 'kael_confronted', name: 'Rival\'s Fall', description: 'Confronted Kael', act: StoryAct.ACT_4_CROWN_CONVERGENCE, unlocked: false },
      { id: 'eight_fragments', name: 'Crown Complete', description: 'Collected all 8 fragments', act: StoryAct.ACT_4_CROWN_CONVERGENCE, unlocked: false },
      { id: 'void_defeated', name: 'Void Vanquished', description: 'Defeated the Void Entity', act: StoryAct.ACT_4_CROWN_CONVERGENCE, unlocked: false },
      { id: 'ending_reached', name: 'Destiny Fulfilled', description: 'Completed the story', act: StoryAct.ACT_4_CROWN_CONVERGENCE, unlocked: false }
    ];

    milestones.forEach(m => this.milestones.set(m.id, m));
  }

  /**
   * Make a story choice
   */
  public makeChoice(choice: StoryChoice): void {
    this.choices.set(choice, true);
    console.log(`📖 Story Choice: ${choice}`);
    
    // Update alignment based on choice
    this.updateAlignment(choice);
    
    // Trigger consequences
    this.triggerChoiceConsequences(choice);
  }

  /**
   * Update player alignment based on choice
   */
  private updateAlignment(choice: StoryChoice): void {
    const alignmentChanges: Partial<Record<StoryChoice, number>> = {
      [StoryChoice.PURIFY_CORRUPTION]: 10,
      [StoryChoice.BURN_CORRUPTION]: -10,
      [StoryChoice.THAW_DRAGON]: 15,
      [StoryChoice.KILL_DRAGON]: -20,
      [StoryChoice.PRESERVE_SUN_LEGACY]: 10,
      [StoryChoice.DESTROY_SUN_LEGACY]: -5,
      [StoryChoice.ACCEPT_POISON_MAGIC]: -15,
      [StoryChoice.REFUSE_POISON_MAGIC]: 5,
      [StoryChoice.FREE_EMPRESS]: 10,
      [StoryChoice.MERCY_KILL_SHADOW_KING]: 5,
      [StoryChoice.LET_SHADOW_KING_SEAL]: 10,
      [StoryChoice.REDEEM_KAEL]: 20,
      [StoryChoice.CONDEMN_KAEL]: -20,
      [StoryChoice.RESTORE_CROWN]: 25,
      [StoryChoice.DESTROY_CROWN]: 0,
      [StoryChoice.CLAIM_CROWN_SOLO]: -30,
      [StoryChoice.GIVE_CROWN_TO_CREAT]: 30
    };

    const change = alignmentChanges[choice] || 0;
    this.playerAlignment = Math.max(-100, Math.min(100, this.playerAlignment + change));
    
    console.log(`⚖️ Alignment: ${this.playerAlignment} (${this.getAlignmentText()})`);
  }

  /**
   * Get alignment text
   */
  public getAlignmentText(): string {
    if (this.playerAlignment >= 75) return 'Paragon';
    if (this.playerAlignment >= 50) return 'Hero';
    if (this.playerAlignment >= 25) return 'Good';
    if (this.playerAlignment >= -25) return 'Neutral';
    if (this.playerAlignment >= -50) return 'Selfish';
    if (this.playerAlignment >= -75) return 'Villain';
    return 'Tyrant';
  }

  /**
   * Trigger choice consequences
   */
  private triggerChoiceConsequences(choice: StoryChoice): void {
    switch (choice) {
      case StoryChoice.HOME_BASE_FIRST:
        questManager.startQuest('home_base_001');
        dialogueManager.showSystemMessage('choiceMade', {
          choice: 'Establish Home Base',
          consequence: 'Unlocked crafting and preparation quests'
        });
        break;
        
      case StoryChoice.SYLVARA_DIRECT:
        questManager.startQuest('sylvara_001');
        dialogueManager.showSystemMessage('choiceMade', {
          choice: 'Head to Sylvara',
          consequence: 'Skipped home base, gained bonus XP'
        });
        break;
        
      case StoryChoice.THAW_DRAGON:
        dialogueManager.showSystemMessage('choiceMade', {
          choice: 'Thaw the Dragon',
          consequence: 'Dragon becomes ally, reveals tragic backstory'
        });
        break;
        
      case StoryChoice.REDEEM_KAEL:
        dialogueManager.showSystemMessage('choiceMade', {
          choice: 'Redeem Kael',
          consequence: 'Kael joins you for the final battle'
        });
        break;
        
      // Add more consequences as needed
    }
  }

  /**
   * Unlock milestone
   */
  public unlockMilestone(milestoneId: string): void {
    const milestone = this.milestones.get(milestoneId);
    if (milestone && !milestone.unlocked) {
      milestone.unlocked = true;
      milestone.timestamp = new Date();
      console.log(`🏆 Milestone Unlocked: ${milestone.name}`);
      
      dialogueManager.showSystemMessage('milestoneUnlocked', {
        milestoneName: milestone.name,
        description: milestone.description
      });
      
      // Check if act is complete
      this.checkActCompletion();
    }
  }

  /**
   * Check if current act is complete
   */
  private checkActCompletion(): void {
    const actMilestones = Array.from(this.milestones.values())
      .filter(m => m.act === this.currentAct);
    
    const allUnlocked = actMilestones.every(m => m.unlocked);
    
    if (allUnlocked) {
      this.completeAct();
    }
  }

  /**
   * Complete current act
   */
  private completeAct(): void {
    console.log(`🎬 Act Complete: ${this.currentAct}`);
    
    // Move to next act
    const actOrder = [
      StoryAct.ACT_1_AWAKENING,
      StoryAct.ACT_2_ELEMENTAL_TRIALS,
      StoryAct.ACT_3_SHADOWS_AND_LIGHT,
      StoryAct.ACT_4_CROWN_CONVERGENCE
    ];
    
    const currentIndex = actOrder.indexOf(this.currentAct);
    if (currentIndex < actOrder.length - 1) {
      this.currentAct = actOrder[currentIndex + 1];
      console.log(`📖 Starting: ${this.currentAct}`);
    }
  }

  /**
   * Check if choice was made
   */
  public hasChoice(choice: StoryChoice): boolean {
    return this.choices.get(choice) === true;
  }

  /**
   * Get current act
   */
  public getCurrentAct(): StoryAct {
    return this.currentAct;
  }

  /**
   * Get player alignment
   */
  public getAlignment(): number {
    return this.playerAlignment;
  }

  /**
   * Get unlocked milestones
   */
  public getUnlockedMilestones(): StoryMilestone[] {
    return Array.from(this.milestones.values()).filter(m => m.unlocked);
  }

  /**
   * Get story progress percentage
   */
  public getProgress(): number {
    const total = this.milestones.size;
    const unlocked = this.getUnlockedMilestones().length;
    return (unlocked / total) * 100;
  }

  /**
   * Get available ending based on choices
   */
  public getAvailableEnding(): string {
    // Check for secret best ending
    if (this.hasChoice(StoryChoice.GIVE_CROWN_TO_CREAT) && this.playerAlignment >= 50) {
      return 'Bond Ending (Secret Best Ending)';
    }
    
    // Check for other endings
    if (this.hasChoice(StoryChoice.RESTORE_CROWN)) {
      return 'Unity Ending';
    }
    
    if (this.hasChoice(StoryChoice.DESTROY_CROWN)) {
      return 'Freedom Ending';
    }
    
    if (this.hasChoice(StoryChoice.CLAIM_CROWN_SOLO)) {
      if (this.playerAlignment >= 0) {
        return 'Dominion Ending (Benevolent)';
      } else {
        return 'Dominion Ending (Tyrant)';
      }
    }
    
    return 'Undecided';
  }

  /**
   * Get story statistics
   */
  public getStats(): {
    currentAct: string;
    progress: number;
    milestonesUnlocked: number;
    totalMilestones: number;
    alignment: number;
    alignmentText: string;
    choicesMade: number;
    availableEnding: string;
  } {
    return {
      currentAct: this.currentAct,
      progress: this.getProgress(),
      milestonesUnlocked: this.getUnlockedMilestones().length,
      totalMilestones: this.milestones.size,
      alignment: this.playerAlignment,
      alignmentText: this.getAlignmentText(),
      choicesMade: this.choices.size,
      availableEnding: this.getAvailableEnding()
    };
  }
}

// Singleton instance
export const storyProgression = new StoryProgression();
