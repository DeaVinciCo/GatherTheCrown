import * as Colyseus from 'colyseus.js';
import { getRealtimeServerUrl } from './serverUrl';
// Using local message types

class GameClient {
  private client?: Colyseus.Client;
  private room?: Colyseus.Room;
  private chatOverlay: HTMLDivElement;

  constructor() {
    this.chatOverlay = document.createElement('div');
    this.chatOverlay.style.position = 'absolute';
    this.chatOverlay.style.bottom = '0';
    this.chatOverlay.style.left = '0';
    this.chatOverlay.style.width = '100%';
    this.chatOverlay.style.maxHeight = '150px';
    this.chatOverlay.style.overflowY = 'auto';
    this.chatOverlay.style.background = 'rgba(0, 0, 0, 0.5)';
    this.chatOverlay.style.color = '#fff';
    this.chatOverlay.style.fontFamily = 'sans-serif';
    this.chatOverlay.style.padding = '4px';
    document.body.appendChild(this.chatOverlay);
  }

  async joinLobby() {
    const realtimeServerUrl = getRealtimeServerUrl();

    if (!realtimeServerUrl) {
      this.displaySystemMessage('Multiplayer chat is offline on this host.');
      return;
    }

    try {
      this.client = new Colyseus.Client(realtimeServerUrl);
      this.room = await this.client.joinOrCreate('lobby');
      this.onChat((message) => this.displayChat(message));
    } catch (_error) {
      this.displaySystemMessage('Could not connect to multiplayer chat server.');
    }
  }

  send(message: ClientMessage) {
    this.room?.send(message.type, message);
  }

  sendChat(name: string, text: string) {
    this.send({ type: 'chat', name, text });
  }

  onChat(handler: (message: ChatMessage) => void) {
    this.room?.onMessage('chat', handler);
  }

  private displayChat(message: ChatMessage) {
    const line = document.createElement('div');
    line.textContent = `${message.name}: ${message.text}`;
    this.chatOverlay.appendChild(line);
  }

  private displaySystemMessage(text: string) {
    const line = document.createElement('div');
    line.textContent = text;
    line.style.opacity = '0.85';
    this.chatOverlay.appendChild(line);
  }
}

export const gameClient = new GameClient();
