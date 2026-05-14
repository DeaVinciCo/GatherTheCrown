# 📖 Dialogue System Usage Guide

**Quick reference for implementing dialogues in Gather the Crown: Creats & Foes**

---

## 🚀 Quick Start

### 1. Import the Dialogue Manager
```typescript
import { dialogueManager } from './systems/DialogueManager';
```

### 2. Start a Dialogue
```typescript
// Start Elder Miriam's first dialogue
dialogueManager.startDialogue('elder_miriam_001');
```

### 3. Handle Player Choices
```typescript
// Player selects choice 1
dialogueManager.selectChoice(1);
```

---

## 📝 Adding New Dialogues

### Step 1: Add to dialogues.json
```json
{
  "your_dialogue_id": {
    "id": "your_dialogue_id",
    "speaker": "Character Name",
    "text": "What the character says",
    "emotion": "happy",
    "voiceFile": "audio/dialogue/your_file.mp3",
    "choices": [
      {
        "id": 1,
        "text": "Player response option 1",
        "next": "next_dialogue_id",
        "requirement": null,
        "bondChange": 5,
        "factionChange": null
      }
    ],
    "triggers": {
      "quest": "quest_id",
      "bondIncrease": 10,
      "goldReward": 500,
      "xpReward": 1000
    }
  }
}
```

### Step 2: Use in Code
```typescript
dialogueManager.startDialogue('your_dialogue_id');
```

---

## 🎭 Dialogue Types

### 1. Story Dialogue (with choices)
```typescript
// Player can choose responses
dialogueManager.startDialogue('elder_miriam_001');

// Listen for dialogue changes
dialogueManager.setOnDialogueChange((dialogue) => {
  if (dialogue) {
    console.log(`${dialogue.speaker}: ${dialogue.text}`);
    // Show choices in UI
    dialogue.choices.forEach(choice => {
      console.log(`[${choice.id}] ${choice.text}`);
    });
  }
});

// Handle choice selection
dialogueManager.selectChoice(1);
```

### 2. Tutorial Messages (no choices)
```typescript
// Show tutorial hint
dialogueManager.showTutorial('movement');
// Output: "Use WASD or Arrow Keys to move. Hold Shift to sprint."

dialogueManager.showTutorial('combat');
// Output: "Left Click or Space to attack. Right Click to block."
```

### 3. System Messages
```typescript
// Level up message
dialogueManager.showSystemMessage('levelUp', { level: 5 });

// Achievement unlocked
dialogueManager.showSystemMessage('achievementUnlocked', {
  achievementName: 'First Victory',
  achievementDescription: 'Win your first race',
  rewards: '500 XP, 200g'
});

// Quest complete
dialogueManager.showSystemMessage('questComplete', {
  questName: 'Cleanse the Forest',
  rewards: '5,000 XP, 2,000g, Druid\'s Crown'
});
```

### 4. Creat Emotions
```typescript
// Show creat emotion
dialogueManager.showCreatEmotion('happy', 'Ember');
// Output: "Ember seems very happy!"
// Triggers: bounce animation, happy sound

dialogueManager.showCreatEmotion('hungry', 'Spark');
// Output: "Spark is hungry! Feed it soon."
```

### 5. Navigation Prompts
```typescript
// Quest marker
dialogueManager.showNavigation('questMarker', {
  location: 'Sylvara Forest',
  distance: 250
});

// Checkpoint reached
dialogueManager.showNavigation('checkpointReached');

// Player lost
dialogueManager.showNavigation('playerLost');
```

### 6. Combat Instructions
```typescript
// Boss fight start
dialogueManager.showCombatInstruction('bossStart', {
  bossName: 'Shadow-Corrupted Treant'
});

// Low health warning
dialogueManager.showCombatInstruction('lowHealth');

// Enemy defeated
dialogueManager.showCombatInstruction('enemyDefeated', {
  xp: 500,
  gold: 200
});
```

### 7. Racing Instructions
```typescript
// Race countdown
dialogueManager.showRacingInstruction('raceStart');

// Perfect start
dialogueManager.showRacingInstruction('perfectStart');

// Drift tutorial
dialogueManager.showRacingInstruction('driftTutorial');

// Race complete
dialogueManager.showRacingInstruction('raceComplete', {
  position: '1st',
  time: '2:34.56',
  xp: 1000,
  gold: 500
});
```

---

## 🎯 Common Use Cases

### Use Case 1: NPC Conversation
```typescript
// Player talks to NPC
function talkToNPC(npcId: string) {
  // Start appropriate dialogue based on NPC
  if (npcId === 'elder_miriam') {
    dialogueManager.startDialogue('elder_miriam_001');
  } else if (npcId === 'kael') {
    dialogueManager.startDialogue('kael_rival_001');
  }
  
  // Show dialogue UI
  showDialogueUI();
}

// Handle player choice
function onPlayerChoice(choiceId: number) {
  dialogueManager.selectChoice(choiceId);
}
```

### Use Case 2: Quest Start
```typescript
function startQuest(questId: string) {
  // Show quest dialogue
  dialogueManager.startDialogue(`quest_${questId}_start`);
  
  // Listen for quest acceptance
  dialogueManager.setOnChoiceSelected((choice) => {
    if (choice.next.includes('accept')) {
      // Add quest to player's quest log
      addQuestToLog(questId);
    }
  });
}
```

### Use Case 3: Tutorial Sequence
```typescript
function startTutorial() {
  // Show movement tutorial
  dialogueManager.showTutorial('movement');
  
  // Wait for player to move
  waitForPlayerMovement().then(() => {
    dialogueManager.showTutorial('combat');
    
    // Continue tutorial...
  });
}
```

### Use Case 4: Creat Interaction
```typescript
function petCreat(creat: Creat) {
  // Increase bond
  creat.increaseBond(3);
  
  // Show emotion
  dialogueManager.showCreatEmotion('happy', creat.name);
  
  // Show system message
  dialogueManager.showSystemMessage('bondIncrease', {
    creatName: creat.name,
    bondLevel: creat.bondLevel
  });
}
```

### Use Case 5: Combat Feedback
```typescript
function onEnemyHit(damage: number, isCritical: boolean) {
  if (isCritical) {
    dialogueManager.showCombatInstruction('criticalHit', { damage });
  }
}

function onPlayerLowHealth(currentHp: number, maxHp: number) {
  if (currentHp < maxHp * 0.25) {
    dialogueManager.showCombatInstruction('lowHealth');
  }
}
```

---

## 🔧 Advanced Features

### Conditional Dialogues
```json
{
  "choices": [
    {
      "id": 1,
      "text": "Join the Watchers",
      "next": "watchers_join",
      "requirement": { "level": 5 },
      "bondChange": 0,
      "factionChange": { "watchers": 10 }
    }
  ]
}
```

### Branching Paths
```typescript
// Different dialogue based on player choices
if (playerKilledBoss) {
  dialogueManager.startDialogue('npc_impressed');
} else if (playerSparedBoss) {
  dialogueManager.startDialogue('npc_grateful');
} else {
  dialogueManager.startDialogue('npc_disappointed');
}
```

### Dialogue History
```typescript
// Check if player has seen dialogue before
const history = dialogueManager.getHistory();
if (history.includes('elder_miriam_001')) {
  // Show different dialogue for repeat visit
  dialogueManager.startDialogue('elder_miriam_repeat');
} else {
  // Show first-time dialogue
  dialogueManager.startDialogue('elder_miriam_001');
}
```

### Dynamic Text
```typescript
// Replace variables in dialogue text
const dialogue = dialogueManager.getCurrentDialogue();
if (dialogue) {
  let text = dialogue.text;
  text = text.replace('{playerName}', player.name);
  text = text.replace('{creatName}', player.creat.name);
  console.log(text);
}
```

---

## 🎨 UI Integration

### Example Dialogue UI Component
```typescript
class DialogueUI {
  private container: HTMLElement;
  
  constructor() {
    this.container = document.getElementById('dialogue-ui')!;
    
    // Listen for dialogue changes
    dialogueManager.setOnDialogueChange((dialogue) => {
      if (dialogue) {
        this.show(dialogue);
      } else {
        this.hide();
      }
    });
  }
  
  private show(dialogue: Dialogue) {
    // Show speaker name
    const speakerElement = this.container.querySelector('.speaker')!;
    speakerElement.textContent = dialogue.speaker;
    
    // Show dialogue text
    const textElement = this.container.querySelector('.text')!;
    textElement.textContent = dialogue.text;
    
    // Show choices
    const choicesContainer = this.container.querySelector('.choices')!;
    choicesContainer.innerHTML = '';
    
    dialogue.choices.forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice.text;
      button.onclick = () => dialogueManager.selectChoice(choice.id);
      choicesContainer.appendChild(button);
    });
    
    // Show container
    this.container.classList.remove('hidden');
  }
  
  private hide() {
    this.container.classList.add('hidden');
  }
}
```

---

## 📊 Best Practices

### 1. Keep Dialogues Short
- Max 2-3 sentences per dialogue node
- Break long conversations into multiple nodes
- Use choices to let players control pacing

### 2. Provide Clear Choices
- Make choice outcomes obvious
- Use [brackets] for non-verbal actions
- Limit to 3-4 choices per node

### 3. Use Emotions
- Set appropriate emotion for each dialogue
- Emotions affect voice acting and animations
- Common emotions: happy, sad, angry, scared, wise, stern

### 4. Test Branching Paths
- Ensure all choices lead somewhere
- Avoid dead ends
- Test all possible paths

### 5. Localization-Friendly
- Keep text simple and clear
- Avoid idioms and slang
- Use variables for names and numbers
- Provide context in comments

---

## 🐛 Debugging

### Check Current Dialogue
```typescript
const current = dialogueManager.getCurrentDialogue();
console.log('Current dialogue:', current);
```

### View History
```typescript
const history = dialogueManager.getHistory();
console.log('Dialogue history:', history);
```

### Test Dialogue Flow
```typescript
// Test a dialogue sequence
dialogueManager.startDialogue('test_dialogue_001');
dialogueManager.selectChoice(1);
dialogueManager.selectChoice(2);
// Check if flow works as expected
```

---

## 📝 Checklist for New Dialogues

- [ ] Added to dialogues.json
- [ ] Unique ID assigned
- [ ] Speaker name correct
- [ ] Text is clear and concise
- [ ] Emotion set appropriately
- [ ] Voice file path specified
- [ ] Choices lead to valid next dialogues
- [ ] Requirements checked (level, bond, etc.)
- [ ] Triggers configured (quests, rewards)
- [ ] Tested in-game
- [ ] Localization strings added

---

**This dialogue system provides a flexible, data-driven approach to all narrative content in Gather the Crown: Creats & Foes!**

💬👑🐉
