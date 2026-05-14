import { GameEngine } from './GameEngine';

export abstract class GameMode {
  protected game: GameEngine;

  constructor(game: GameEngine) {
    this.game = game;
  }

  abstract init(): void;
  abstract update(deltaTime: number): void;
  abstract cleanup(): void;
}
