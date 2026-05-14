import dialogueData from '../data/dialogues.json';

export interface DialogueChoice {
  id: number;
  text: string;
  next: string;
  requirement: any;
  bondChange: number;
  factionChange: any;
}

export interface Dialogue {
  id: string;
  speaker: string;
  text: string;
  emotion: string;
  voiceFile: string;
  choices: DialogueChoice[];
  triggers: any;
}

export class DialogueManager {
  private currentDialogue: Dialogue | null = null;
  private dialogueHistory: string[] = [];
  private onDialogueChange: ((dialogue: Dialogue | null) => void) | null = null;
  private onChoiceSelected: ((choice: DialogueChoice) => void) | null = null;

  constructor() {
    console.log('💬 Dialogue Manager initialized');
  }

  /**
   * Start a dialogue by ID
   */
  public startDialogue(dialogueId: string): void {
    const dialogue = this.getDialogue(dialogueId);
    if (!dialogue) {
      console.error(`Dialogue not found: ${dialogueId}`);
      return;
    }

    this.currentDialogue = dialogue;
    this.dialogueHistory.push(dialogueId);
    
    console.log(`💬 Starting dialogue: ${dialogue.speaker}: "${dialogue.text}"`);
    
    if (this.onDialogueChange) {
      this.onDialogueChange(dialogue);
    }

    // Trigger any dialogue effects
    this.processTriggers(dialogue.triggers);
  }

  /**
   * Select a dialogue choice
   */
  public selectChoice(choiceId: number): void {
    if (!this.currentDialogue) {
      console.error('No active dialogue');
      return;
    }

    const choice = this.currentDialogue.choices.find(c => c.id === choiceId);
    if (!choice) {
      console.error(`Choice not found: ${choiceId}`);
      return;
    }

    console.log(`💬 Selected: "${choice.text}"`);

    // Process choice effects
    if (choice.bondChange !== 0) {
      console.log(`💝 Bond change: ${choice.bondChange > 0 ? '+' : ''}${choice.bondChange}`);
    }

    if (choice.factionChange) {
      console.log(`🏛️ Faction change:`, choice.factionChange);
    }

    if (this.onChoiceSelected) {
      this.onChoiceSelected(choice);
    }

    // Move to next dialogue
    if (choice.next) {
      this.startDialogue(choice.next);
    } else {
      this.endDialogue();
    }
  }

  /**
   * End current dialogue
   */
  public endDialogue(): void {
    console.log('💬 Dialogue ended');
    this.currentDialogue = null;
    
    if (this.onDialogueChange) {
      this.onDialogueChange(null);
    }
  }

  /**
   * Get dialogue by ID
   */
  private getDialogue(dialogueId: string): Dialogue | null {
    const dialogues = dialogueData.dialogues as Record<string, Dialogue>;
    return dialogues[dialogueId] || null;
  }

  /**
   * Process dialogue triggers (quests, rewards, etc.)
   */
  private processTriggers(triggers: any): void {
    if (!triggers) return;

    if (triggers.quest) {
      console.log(`📜 Quest triggered: ${triggers.quest}`);
    }

    if (triggers.bondIncrease) {
      console.log(`💝 Bond increased: +${triggers.bondIncrease}`);
    }

    if (triggers.goldReward) {
      console.log(`💰 Gold reward: +${triggers.goldReward}g`);
    }

    if (triggers.xpReward) {
      console.log(`⭐ XP reward: +${triggers.xpReward} XP`);
    }
  }

  /**
   * Show system message
   */
  public showSystemMessage(messageType: string, variables: Record<string, any> = {}): void {
    const messages = dialogueData.systemMessages as Record<string, any>;
    const message = messages[messageType];

    if (!message) {
      console.error(`System message not found: ${messageType}`);
      return;
    }

    let text = message.text;
    
    // Replace variables in text
    Object.keys(variables).forEach(key => {
      text = text.replace(`{${key}}`, variables[key]);
    });

    console.log(`📢 ${message.title}`);
    console.log(text);

    // Play sound if available
    if (message.sound) {
      console.log(`🔊 Playing sound: ${message.sound}`);
    }
  }

  /**
   * Show tutorial message
   */
  public showTutorial(tutorialKey: string): void {
    const tutorials = dialogueData.tutorialMessages as Record<string, string>;
    const message = tutorials[tutorialKey];

    if (!message) {
      console.error(`Tutorial not found: ${tutorialKey}`);
      return;
    }

    console.log(`🎓 Tutorial: ${message}`);
  }

  /**
   * Show creat emotion
   */
  public showCreatEmotion(emotion: string, creatName: string): void {
    const emotions = dialogueData.creatEmotions as Record<string, any>;
    const emotionData = emotions[emotion];

    if (!emotionData) {
      console.error(`Emotion not found: ${emotion}`);
      return;
    }

    const text = emotionData.text.replace('{creatName}', creatName);
    console.log(`🐉 ${text}`);
    console.log(`🎬 Animation: ${emotionData.animation}`);
    console.log(`🔊 Sound: ${emotionData.sound}`);
  }

  /**
   * Show navigation prompt
   */
  public showNavigation(promptType: string, variables: Record<string, any> = {}): void {
    const prompts = dialogueData.navigationPrompts as Record<string, string>;
    let message = prompts[promptType];

    if (!message) {
      console.error(`Navigation prompt not found: ${promptType}`);
      return;
    }

    // Replace variables
    Object.keys(variables).forEach(key => {
      message = message.replace(`{${key}}`, variables[key]);
    });

    console.log(`🗺️ ${message}`);
  }

  /**
   * Show combat instruction
   */
  public showCombatInstruction(instructionType: string, variables: Record<string, any> = {}): void {
    const instructions = dialogueData.combatInstructions as Record<string, string>;
    let message = instructions[instructionType];

    if (!message) {
      console.error(`Combat instruction not found: ${instructionType}`);
      return;
    }

    // Replace variables
    Object.keys(variables).forEach(key => {
      message = message.replace(`{${key}}`, variables[key]);
    });

    console.log(`⚔️ ${message}`);
  }

  /**
   * Show racing instruction
   */
  public showRacingInstruction(instructionType: string, variables: Record<string, any> = {}): void {
    const instructions = dialogueData.racingInstructions as Record<string, string>;
    let message = instructions[instructionType];

    if (!message) {
      console.error(`Racing instruction not found: ${instructionType}`);
      return;
    }

    // Replace variables
    Object.keys(variables).forEach(key => {
      message = message.replace(`{${key}}`, variables[key]);
    });

    console.log(`🏁 ${message}`);
  }

  /**
   * Get current dialogue
   */
  public getCurrentDialogue(): Dialogue | null {
    return this.currentDialogue;
  }

  /**
   * Get dialogue history
   */
  public getHistory(): string[] {
    return [...this.dialogueHistory];
  }

  /**
   * Set callback for dialogue changes
   */
  public setOnDialogueChange(callback: (dialogue: Dialogue | null) => void): void {
    this.onDialogueChange = callback;
  }

  /**
   * Set callback for choice selection
   */
  public setOnChoiceSelected(callback: (choice: DialogueChoice) => void): void {
    this.onChoiceSelected = callback;
  }

  /**
   * Check if dialogue is active
   */
  public isActive(): boolean {
    return this.currentDialogue !== null;
  }

  /**
   * Clear dialogue history
   */
  public clearHistory(): void {
    this.dialogueHistory = [];
  }
}

// Singleton instance
export const dialogueManager = new DialogueManager();
