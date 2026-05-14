import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { apiUrl } from '../utils/api';
// import { supabase, toAuthEmail } from '../utils/supabaseClient';
import { USERNAME_MAX_LENGTH } from '../constants/GameConstants';

export default class LoginScreen extends Phaser.Scene {
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private container!: HTMLDivElement;
  private messageDiv!: HTMLDivElement;

  private async parseApiPayload(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.toLowerCase().includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    if (text.trim().startsWith('<')) {
      return { error: 'Profile service is unavailable right now. Please try again later.' };
    }

    return { error: text || 'Request failed' };
  }

  constructor() {
    super('LoginScreen');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b1020, 0x111827, 0x1f2937, 0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Starfield background
    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0x9ca3af,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.8),
        duration: Phaser.Math.Between(1200, 2600),
        yoyo: true,
        repeat: -1
      });
    }

    this.add.text(width / 2, 60, 'Sign In', {
      color: '#f3f4f6',
      fontSize: '32px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 100, 'Enter your credentials to continue your journey', {
      color: '#94a3b8',
      fontSize: '14px'
    }).setOrigin(0.5);

    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      zIndex: '100',
      width: '320px'
    });

    // Username input
    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = 'Username';
    this.usernameInput.maxLength = USERNAME_MAX_LENGTH;
    Object.assign(this.usernameInput.style, {
      fontSize: '16px',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '2px solid #3b82f6',
      background: '#0f172a',
      color: '#fff',
      textAlign: 'left',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    });

    // Password input
    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.placeholder = 'Password';
    Object.assign(this.passwordInput.style, {
      fontSize: '16px',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '2px solid #3b82f6',
      background: '#0f172a',
      color: '#fff',
      textAlign: 'left',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    });

    // Message display
    this.messageDiv = document.createElement('div');
    Object.assign(this.messageDiv.style, {
      color: '#ef4444',
      fontSize: '12px',
      textAlign: 'center',
      minHeight: '16px',
      width: '100%'
    });

    // Sign In button
    const signInBtn = document.createElement('button');
    signInBtn.textContent = 'Sign In';
    Object.assign(signInBtn.style, {
      fontSize: '16px',
      padding: '10px 24px',
      background: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      width: '100%'
    });

    signInBtn.addEventListener('click', () => this.handleLogin());
    this.passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    // Back button
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back';
    Object.assign(backBtn.style, {
      fontSize: '14px',
      padding: '8px 16px',
      background: 'rgba(107, 114, 128, 0.5)',
      color: '#d1d5db',
      border: '1px solid #4b5563',
      borderRadius: '6px',
      cursor: 'pointer',
      width: '100%'
    });

    backBtn.addEventListener('click', () => {
      this._removeContainer();
      this.scene.start('MainMenu');
    });

    this.container.appendChild(this.usernameInput);
    this.container.appendChild(this.passwordInput);
    this.container.appendChild(this.messageDiv);
    this.container.appendChild(signInBtn);
    this.container.appendChild(backBtn);

    const gameContainer = document.getElementById('game');
    if (gameContainer) {
      gameContainer.appendChild(this.container);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this._removeContainer());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this._removeContainer());

    this.usernameInput.focus();
  }

  private async handleLogin() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value.trim();

    if (!username || !password) {
      this.messageDiv.textContent = 'Please enter both username and password';
      return;
    }

    try {
      // Backendless: call Netlify Function for login
      const response = await fetch(apiUrl('/.netlify/functions/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await this.parseApiPayload(response);
      if (!response.ok) {
        this.messageDiv.textContent = data.error || 'Login failed';
        return;
      }
      // Demo: use returned token and username
      gameRegistry.setSession(
        data.token,
        Date.now() / 1000 + 86400, // 1 day expiry
        data.user.username,
        data.user.username
      );
      // Fetch user info (me)
      const meResponse = await fetch(apiUrl('/.netlify/functions/me'), {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const meData = await this.parseApiPayload(meResponse);
      if (!meResponse.ok) {
        this.messageDiv.textContent = meData.error || 'Could not load profile';
        return;
      }
      this._removeContainer();
      this.scene.start('ForgeHero');
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Unknown error';
      if (message.toLowerCase().includes('failed to fetch')) {
        this.messageDiv.textContent = 'Connection error: sign-in service is offline or blocked right now.';
      } else {
        this.messageDiv.textContent = 'Connection error: ' + message;
      }
    }
  }

  private _removeContainer() {
    this.container?.parentElement?.removeChild(this.container);
  }

  shutdown() {
    this._removeContainer();
  }
}
