import { Room } from 'colyseus';
import { basicEnemyAI } from '../sim/ai';
export class StoryRoom extends Room {
    constructor() {
        super(...arguments);
        this.maxClients = 8;
    }
    onCreate() {
        this.setState({
            players: {},
            enemies: {
                e1: { x: 0, y: 0, hp: 100, state: 'idle' }
            }
        });
        this.onMessage('input', (client, message) => {
            const player = this.state.players[client.sessionId];
            if (!player || message.type !== 'input')
                return;
            player.x += message.payload.x;
            player.y += message.payload.y;
        });
        this.onMessage('hit', (client, message) => {
            if (message.type !== 'hit')
                return;
            this.broadcast({
                type: 'damage',
                sourceId: client.sessionId,
                amount: message.damage
            });
        });
        this.setSimulationInterval(() => this.updateEnemies());
    }
    onJoin(client) {
        this.state.players[client.sessionId] = { x: 0, y: 0, hp: 100 };
    }
    onLeave(client) {
        delete this.state.players[client.sessionId];
    }
    updateEnemies() {
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
                    });
                    break;
            }
        }
    }
}
