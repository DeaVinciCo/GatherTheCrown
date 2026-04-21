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

// Mobile-optimized Phaser configuration
const isMobile = window.innerWidth < 768;
const gameWidth = isMobile ? window.innerWidth : 800;
const gameHeight = isMobile ? window.innerHeight : 600;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: gameWidth,
  height: gameHeight,
  backgroundColor: '#1e1e1e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'parent',
    expandParent: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  dom: {
    createContainer: true
  },
  scene: [Boot, Preload, MainMenu, ForgeHero, Haven, ForestZone, District01, BattleArena, CrownTrial01],
  input: {
    mouse: {
      target: window,
      capture: true
    },
    touch: {
      target: window,
      enabled: true
    },
    gamepad: false
  }
};

const game = new Phaser.Game(config);

// Handle window resize for responsive gameplay
window.addEventListener('resize', () => {
  const newWidth = Math.min(window.innerWidth, 1200);
  const newHeight = Math.min(window.innerHeight, 900);
  game.scale.resize(newWidth, newHeight);
});
