import { Room, Client } from 'colyseus';
import { ClientMessage, ServerMessage } from '@game/shared';
import { basicEnemyAI, EnemyAIState } from '../sim/ai';

const ENEMY_ATTACK_COOLDOWN_MS = 1500;

interface StoryState {
  players: Record<string, { x: number; y: number; hp: number }>;
  enemies: Record<string, { x: number; y: number; hp: number; state: EnemyAIState }>;
}

interface EnemyMeta {
  attackCooldownMs: number;
  lastAttackAt: number;
}

export class StoryRoom extends Room<StoryState> {
  maxClients = 8;

  private enemyMeta: Record<string, EnemyMeta> = {};

  onCreate() {
    this.setState({
      players: {},
      enemies: {
        e1: { x: 0, y: 0, hp: 100, state: 'idle' }
      }
    });
    this.enemyMeta['e1'] = { attackCooldownMs: ENEMY_ATTACK_COOLDOWN_MS, lastAttackAt: 0 };

    this.onMessage('input', (client, message: ClientMessage) => {
      const player = this.state.players[client.sessionId];
      if (!player || message.type !== 'input') return;
      player.x += message.payload.x;
      player.y += message.payload.y;
    });
    this.onMessage('hit', (client, message: ClientMessage) => {
      if (message.type !== 'hit') return;
      this.broadcast({
        type: 'damage',
        sourceId: client.sessionId,
        amount: message.damage
      } as ServerMessage);
    });
    this.setSimulationInterval(() => this.updateEnemies());
  }

  onJoin(client: Client) {
    this.state.players[client.sessionId] = { x: 0, y: 0, hp: 100 };
  }

  onLeave(client: Client) {
    delete this.state.players[client.sessionId];
  }

  private updateEnemies() {
    const now = Date.now();
    const playerEntries = Object.entries(this.state.players);

    for (const [id, enemy] of Object.entries(this.state.enemies)) {
      if (playerEntries.length === 0) {
        enemy.state = 'idle';
        continue;
      }

      let targetId = playerEntries[0][0];
      let target = playerEntries[0][1];
      let dist = Math.hypot(target.x - enemy.x, target.y - enemy.y);

      for (const [pid, p] of playerEntries.slice(1)) {
        const d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (d < dist) {
          dist = d;
          target = p;
          targetId = pid;
        }
      }

      const meta = this.enemyMeta[id] ?? { attackCooldownMs: ENEMY_ATTACK_COOLDOWN_MS, lastAttackAt: 0 };
      const canAttack = now - meta.lastAttackAt >= meta.attackCooldownMs;

      const previousState = enemy.state;
      enemy.state = basicEnemyAI({ hp: enemy.hp, distance: dist, previousState, canAttack });

      switch (enemy.state) {
        case 'chase':
          enemy.x += Math.sign(target.x - enemy.x);
          enemy.y += Math.sign(target.y - enemy.y);
          break;
        case 'retreat':
          enemy.x -= Math.sign(target.x - enemy.x);
          enemy.y -= Math.sign(target.y - enemy.y);
          break;
        case 'attack':
          if (canAttack) {
            meta.lastAttackAt = now;
            this.enemyMeta[id] = meta;
            this.broadcast({
              type: 'damage',
              sourceId: id,
              targetId,
              amount: 10
            } as ServerMessage);
          }
          break;
      }
    }
  }
}

interface StoryState {
  players: Record<string, { x: number; y: number; hp: number }>;
  enemies: Record<string, { x: number; y: number; hp: number; state: EnemyAIState }>;
}

export class StoryRoom extends Room<StoryState> {
  maxClients = 8;

  onCreate() {
    this.setState({
      players: {},
      enemies: {
        e1: { x: 0, y: 0, hp: 100, state: 'idle' }
      }
    });
    this.onMessage('input', (client, message: ClientMessage) => {
      const player = this.state.players[client.sessionId];
      if (!player || message.type !== 'input') return;
      player.x += message.payload.x;
      player.y += message.payload.y;
    });
    this.onMessage('hit', (client, message: ClientMessage) => {
      if (message.type !== 'hit') return;
      this.broadcast({
        type: 'damage',
        sourceId: client.sessionId,
        amount: message.damage
      } as ServerMessage);
    });
    this.setSimulationInterval(() => this.updateEnemies());
  }

  onJoin(client: Client) {
    this.state.players[client.sessionId] = { x: 0, y: 0, hp: 100 };
  }

  onLeave(client: Client) {
    delete this.state.players[client.sessionId];
  }

  private updateEnemies() {
    for (const [id, enemy] of Object.entries(this.state.enemies)) {
      const players = Object.values(this.state.players);
      if (players.length === 0) {
        enemy.state = 'idle';
        continue;
      }
      let target = players[0];
      let dist = Math.hypot(target.x - enemy.x, target.y - enemy.y);
      for (const p of players.slice(1)) {
        const d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (d < dist) {
          dist = d;
          target = p;
        }
      }
      enemy.state = basicEnemyAI({ hp: enemy.hp, distance: dist });
      switch (enemy.state) {
        case 'chase':
          enemy.x += Math.sign(target.x - enemy.x);
          enemy.y += Math.sign(target.y - enemy.y);
          break;
        case 'retreat':
          enemy.x -= Math.sign(target.x - enemy.x);
          enemy.y -= Math.sign(target.y - enemy.y);
          break;
        case 'attack':
          this.broadcast({
            type: 'damage',
            sourceId: id,
            amount: 10
          } as ServerMessage);
          break;
      }
    }
  }
}
