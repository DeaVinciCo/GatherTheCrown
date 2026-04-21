import { Room } from 'colyseus';
export class LobbyRoom extends Room {
    constructor() {
        super(...arguments);
        this.maxClients = 16;
    }
    onCreate() {
        this.setState({ clients: [] });
        this.onMessage('*', (client, message) => {
            if (message.type === 'join') {
                this.broadcast({ type: 'crown', fragmentId: 'welcome' });
            }
            if (message.type === 'chat') {
                this.broadcast(message);
            }
        });
    }
    onJoin(client) {
        this.state.clients.push(client.sessionId);
    }
    onLeave(client) {
        this.state.clients = this.state.clients.filter((c) => c !== client.sessionId);
    }
}
