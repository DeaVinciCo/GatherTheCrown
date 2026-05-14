import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { apiUrl } from '../utils/api';
// import { supabase, toAuthEmail } from '../utils/supabaseClient';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../constants/GameConstants';
import { validateUsername } from '../utils/nameValidation';

export default class CreateAccountScreen extends Phaser.Scene {
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private confirmPasswordInput!: HTMLInputElement;
  private container!: HTMLDivElement;
  private messageDiv!: HTMLDivElement;

  private async parseApiPayload(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.toLowerCase().includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    if (text.trim().startsWith('<')) {
      return { error: 'Account services are unavailable right now. Please try again in a little while.' };
    }

    return { error: text || 'Request failed' };
  }

  private protectTyping(input: HTMLInputElement) {
    const haltForGameControls = (event: KeyboardEvent) => {
      event.stopPropagation();
    };

    input.addEventListener('keydown', haltForGameControls);
    input.addEventListener('keyup', haltForGameControls);
    input.addEventListener('keypress', haltForGameControls);
  }

  constructor() {
    super('CreateAccountScreen');
  }

  create() {
    const { width, height } = this.scale;

    gameRegistry.loadFromLocalStorage();
    if (gameRegistry.isLoggedIn()) {
      this.scene.start('ForgeHero');
      return;
    }

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

    this.add.text(width / 2, 60, 'Create Account', {
      color: '#f3f4f6',
      fontSize: '32px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, 'Create your account to save progress and return later.', {
      color: '#94a3b8',
      fontSize: '14px',
      align: 'center',
      wordWrap: { width: 420 }
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
      gap: '16px',
      zIndex: '100',
      width: '340px'
    });

    // Username input
    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = 'Choose a username';
    this.usernameInput.minLength = USERNAME_MIN_LENGTH;
    this.usernameInput.maxLength = USERNAME_MAX_LENGTH;
    Object.assign(this.usernameInput.style, {
      fontSize: '16px',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '2px solid #22c55e',
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
    this.passwordInput.placeholder = 'Enter password';
    Object.assign(this.passwordInput.style, {
      fontSize: '16px',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '2px solid #22c55e',
      background: '#0f172a',
      color: '#fff',
      textAlign: 'left',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box'
    });

    // Confirm password input
    this.confirmPasswordInput = document.createElement('input');
    this.confirmPasswordInput.type = 'password';
    this.confirmPasswordInput.placeholder = 'Confirm password';
    Object.assign(this.confirmPasswordInput.style, {
      fontSize: '16px',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '2px solid #22c55e',
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

    // Create button
    const createBtn = document.createElement('button');
    createBtn.textContent = 'Create Account';
    Object.assign(createBtn.style, {
      fontSize: '16px',
      padding: '10px 24px',
      background: '#22c55e',
      color: '#08111f',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      width: '100%'
    });

    createBtn.addEventListener('click', () => this.handleCreateAccount());
    this.confirmPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleCreateAccount();
    });

    // Keep game movement bindings from intercepting text entry keys (WASD, etc.)
    this.protectTyping(this.usernameInput);
    this.protectTyping(this.passwordInput);
    this.protectTyping(this.confirmPasswordInput);

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
    this.container.appendChild(this.confirmPasswordInput);
    this.container.appendChild(this.messageDiv);
    this.container.appendChild(createBtn);
    this.container.appendChild(backBtn);

    const gameContainer = document.getElementById('game');
    if (gameContainer) {
      gameContainer.appendChild(this.container);
    }

    // This scene relies on DOM form input, not Phaser keybinds.
    if (this.input.keyboard) {
      this.input.keyboard.enabled = false;
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this._removeContainer());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this._removeContainer());

    this.usernameInput.focus();
  }

  private async handleCreateAccount() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value.trim();
    const confirmPassword = this.confirmPasswordInput.value.trim();

    if (!username || !password || !confirmPassword) {
      this.messageDiv.textContent = 'Please fill in all fields';
      this.messageDiv.style.color = '#ef4444';
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      this.messageDiv.textContent = usernameError;
      this.messageDiv.style.color = '#ef4444';
      return;
    }

    if (password !== confirmPassword) {
      this.messageDiv.textContent = 'Passwords do not match';
      this.messageDiv.style.color = '#ef4444';
      return;
    }

    if (password.length < 6) {
      this.messageDiv.textContent = 'Password must be at least 6 characters';
      this.messageDiv.style.color = '#ef4444';
      return;
    }

    try {
      // Backendless: call Netlify Function for signup
      const response = await fetch(apiUrl('/.netlify/functions/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await this.parseApiPayload(response);
      if (!response.ok) {
        this.messageDiv.textContent = data.error || 'Account creation failed';
        this.messageDiv.style.color = '#ef4444';
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
        this.messageDiv.textContent = meData.error || 'Account created. Please sign in.';
        this.messageDiv.style.color = '#f59e0b';
        return;
      }
      this._removeContainer();
      this.scene.start('ForgeHero');
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Unknown error';
      if (message.toLowerCase().includes('failed to fetch')) {
        this.messageDiv.textContent = 'Connection error: account service is offline or blocked. You can keep playing as guest and try account setup later.';
      } else {
        this.messageDiv.textContent = 'Connection error: ' + message;
      }
      this.messageDiv.style.color = '#ef4444';
    }
  }

  private _removeContainer() {
    this.container?.parentElement?.removeChild(this.container);
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true;
    }
  }

  shutdown() {
    this._removeContainer();
  }
}
