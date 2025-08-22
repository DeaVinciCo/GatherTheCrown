import Phaser from 'phaser';
import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import MainMenu from './scenes/MainMenu';
import ForgeHero from './scenes/ForgeHero';
import Haven from './scenes/Haven';
import ForestZone from './scenes/ForestZone';
import District01 from './scenes/District01';
import BattleArena from './scenes/BattleArena';
import CrownTrial01 from './scenes/CrownTrial01';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#1e1e1e',
  scene: [Boot, Preload, MainMenu, ForgeHero, Haven, ForestZone, District01, BattleArena, CrownTrial01]
};

new Phaser.Game(config);
