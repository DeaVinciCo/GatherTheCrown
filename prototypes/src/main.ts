import { GameEngine } from './engine/GameEngine';
import { RaceMode } from './modes/RaceMode';
import { CombatMode } from './modes/CombatMode';
import { CreatBondingMode } from './modes/CreatBondingMode';
import { VaultExplorationMode } from './modes/VaultExplorationMode';
import { kingdomManager } from './systems/KingdomManager';
import { dialogueManager } from './systems/DialogueManager';
import { questManager } from './systems/QuestSystem';
import { storyProgression } from './systems/StoryProgression';
import { lootSystem } from './systems/LootSystem';

// Initialize game engine
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const game = new GameEngine(canvas);

// Initialize all systems
console.log('🎮 Initializing Game Systems...');
console.log('🏰 Kingdom System: 8 kingdoms loaded');
console.log('💬 Dialogue System: Ready');
console.log('📜 Quest System: ' + questManager.getStats().total + ' quests loaded');
console.log('📖 Story Progression: Act 1 - Awakening');
console.log('💰 Loot System: ' + lootSystem.getStats().totalItems + ' items loaded');

// Start first quest
questManager.startQuest('main_001');
console.log('📜 Quest Started: The Egg');

// Menu system
const menu = document.getElementById('menu')!;
const hud = document.getElementById('hud')!;

document.getElementById('start-race')?.addEventListener('click', () => {
  menu.classList.add('hidden');
  hud.classList.remove('hidden');
  game.startMode(new RaceMode(game));
});

document.getElementById('start-combat')?.addEventListener('click', () => {
  menu.classList.add('hidden');
  hud.classList.remove('hidden');
  game.startMode(new CombatMode(game));
});

document.getElementById('start-creat-bond')?.addEventListener('click', () => {
  menu.classList.add('hidden');
  hud.classList.remove('hidden');
  game.startMode(new CreatBondingMode(game));
});

document.getElementById('start-vault')?.addEventListener('click', () => {
  menu.classList.add('hidden');
  hud.classList.remove('hidden');
  game.startMode(new VaultExplorationMode(game));
});

// Show kingdom stats
document.getElementById('show-kingdoms')?.addEventListener('click', () => {
  const kingdomStats = kingdomManager.getStats();
  const questStats = questManager.getStats();
  const storyStats = storyProgression.getStats();
  const lootStats = lootSystem.getStats();
  
  console.log('═══════════════════════════════════════');
  console.log('👑 GATHER THE CROWN: GAME STATISTICS');
  console.log('═══════════════════════════════════════');
  
  console.log('\n🏰 KINGDOMS:');
  console.log(`  Discovered: ${kingdomStats.discovered}/${kingdomStats.total}`);
  console.log(`  Vaults Cleared: ${kingdomStats.vaultsCleared}/${kingdomStats.total}`);
  console.log(`  Restored: ${kingdomStats.restored}/${kingdomStats.total}`);
  console.log(`  Progress: ${kingdomStats.progress.toFixed(1)}%`);
  
  console.log('\n📜 QUESTS:');
  console.log(`  Total: ${questStats.total}`);
  console.log(`  Active: ${questStats.active}`);
  console.log(`  Completed: ${questStats.completed}`);
  console.log(`  Available: ${questStats.available}`);
  
  console.log('\n📖 STORY:');
  console.log(`  Current Act: ${storyStats.currentAct}`);
  console.log(`  Progress: ${storyStats.progress.toFixed(1)}%`);
  console.log(`  Milestones: ${storyStats.milestonesUnlocked}/${storyStats.totalMilestones}`);
  console.log(`  Alignment: ${storyStats.alignment} (${storyStats.alignmentText})`);
  console.log(`  Choices Made: ${storyStats.choicesMade}`);
  console.log(`  Ending: ${storyStats.availableEnding}`);
  
  console.log('\n💰 LOOT:');
  console.log(`  Total Items: ${lootStats.totalItems}`);
  console.log(`  Loot Tables: ${lootStats.totalLootTables}`);
  
  console.log('\n═══════════════════════════════════════\n');
});

// Start game loop
game.start();

console.log('\n═══════════════════════════════════════');
console.log('👑 Gather the Crown: Creats & Foes');
console.log('   Prototype v0.4 - Enhanced Controls');
console.log('═══════════════════════════════════════');
console.log('🎮 Controls:');
console.log('   WASD/Arrows = Move');
console.log('   Space = Jump (Race) / Attack (Combat)');
console.log('   Shift = Boost (Race) / Dodge (Combat)');
console.log('🏁 Race Mode: Fast-paced racing with jumps');
console.log('⚔️  Combat Mode: Battle enemies with movement');
console.log('🐉 Creat Bonding: Bond with your creature');
console.log('🏛️  Vault Mode: Explore ancient vaults');
console.log('═══════════════════════════════════════\n');
