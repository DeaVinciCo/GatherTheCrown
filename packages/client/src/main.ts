import Phaser from 'phaser';
import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import MainMenu from './scenes/MainMenu';
import LoginScreen from './scenes/LoginScreen';
import CreateAccountScreen from './scenes/CreateAccountScreen';
import ForgeHero from './scenes/ForgeHero';
import Haven from './scenes/Haven';
import HavenGrounds from './scenes/HavenGrounds';
import ChooseBeginning from './scenes/ChooseBeginning';
import HavenIntro from './scenes/HavenIntro';
import ForestZone from './scenes/ForestZone';
import ForestTrialsGate from './scenes/ForestTrialsGate';
import SanctuaryHomeBase from './scenes/SanctuaryHomeBase';
import SanctuaryTrail from './scenes/SanctuaryTrail';
import SanctuaryTown from './scenes/SanctuaryTown';
import District01 from './scenes/District01';
import BattleArena from './scenes/BattleArena';
import CrownTrial01 from './scenes/CrownTrial01';
import StoryIntro from './scenes/StoryIntro';
import CrownForge from './scenes/CrownForge';
import VolcanoZone from './scenes/VolcanoZone';
import RaceCircuit from './scenes/RaceCircuit';
import RouteTestHarness from './scenes/RouteTestHarness';
import CameraShowcase from './scenes/CameraShowcase';
import PlayerGuide from './scenes/PlayerGuide';
import SanctuaryIsleOverworld from './scenes/SanctuaryIsleOverworld';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#1e1e1e',
  dom: { createContainer: true },
  scene: [Boot, Preload, MainMenu, LoginScreen, CreateAccountScreen, ForgeHero, ChooseBeginning, Haven, HavenGrounds, HavenIntro, ForestZone, ForestTrialsGate, SanctuaryHomeBase, SanctuaryTrail, SanctuaryTown, SanctuaryIsleOverworld, District01, BattleArena, CrownTrial01, StoryIntro, CrownForge, VolcanoZone, RaceCircuit, RouteTestHarness, CameraShowcase, PlayerGuide]
};

const game = new Phaser.Game(config);

if (import.meta.env.DEV) {
  (window as any).__GTC_GAME = game;
}
