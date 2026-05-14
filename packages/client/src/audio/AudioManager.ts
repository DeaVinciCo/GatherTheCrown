import Phaser from 'phaser';

const SETTINGS_KEY = 'gtc_audio_settings';

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;  // 0–1
  sfxVolume: number;    // 0–1
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  reduceMotion: false,
};

class AudioManager {
  private scene?: Phaser.Scene;
  private music?: Phaser.Sound.BaseSound;
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };
  private lastSfxAt: Record<string, number> = {};

  readonly MENU_THEME = 'menu-theme';
  readonly CLICK_SFX = 'click-sfx';

  private loadSettings(): AudioSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch { /* ignore */ }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  setMusicEnabled(enabled: boolean) {
    this.settings.musicEnabled = enabled;
    this.saveSettings();
    if (this.music) {
      if (enabled) {
        try { (this.music as Phaser.Sound.WebAudioSound).setVolume(this.settings.musicVolume); } catch { /* ignore */ }
      } else {
        try { (this.music as Phaser.Sound.WebAudioSound).setVolume(0); } catch { /* ignore */ }
      }
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.settings.sfxEnabled = enabled;
    this.saveSettings();
  }

  setMusicVolume(volume: number) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    if (this.music && this.settings.musicEnabled) {
      try { (this.music as Phaser.Sound.WebAudioSound).setVolume(this.settings.musicVolume); } catch { /* ignore */ }
    }
  }

  setSfxVolume(volume: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setReduceMotion(enabled: boolean) {
    this.settings.reduceMotion = enabled;
    this.saveSettings();
  }

  get reduceMotion(): boolean { return this.settings.reduceMotion; }

  preload(_scene: Phaser.Scene) {
    // Audio files are optional in this repository snapshot.
    // Keep preload as a no-op so missing binaries do not emit runtime errors.
  }

  init(scene: Phaser.Scene) {
    this.scene = scene;
    this.settings = this.loadSettings();
  }

  attachScene(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private hasAudioKey(key: string): boolean {
    return !!this.scene && this.scene.cache.audio.exists(key);
  }

  playMusic(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (!this.scene || !this.hasAudioKey(key)) {
      return;
    }

    this.stopMusic();

    const vol = this.settings.musicEnabled ? this.settings.musicVolume : 0;
    try {
      this.music = this.scene.sound.add(key, { loop: true, volume: vol, ...config });
      this.music.play();
    } catch {
      // Missing/invalid audio should not block scene startup.
      this.music = undefined;
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = undefined;
    }
  }

  playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (!this.scene || !this.hasAudioKey(key) || !this.settings.sfxEnabled) {
      return;
    }

    try {
      this.scene.sound.play(key, { volume: this.settings.sfxVolume, ...config });
    } catch {
      // Ignore audio playback failures to keep gameplay responsive.
    }
  }

  private shouldPlay(name: string, minIntervalMs: number): boolean {
    const now = Date.now();
    const last = this.lastSfxAt[name] ?? 0;
    if (now - last < minIntervalMs) return false;
    this.lastSfxAt[name] = now;
    return true;
  }

  private getAudioContext(): AudioContext | undefined {
    const manager = (this.scene?.sound as unknown as { context?: AudioContext })?.context;
    return manager;
  }

  private playSynthTone(options: {
    name: string;
    frequency: number;
    durationMs: number;
    type?: OscillatorType;
    gain?: number;
    minIntervalMs?: number;
    channel?: 'sfx' | 'music';
  }) {
    const {
      name,
      frequency,
      durationMs,
      type = 'sine',
      gain = 0.04,
      minIntervalMs = 0,
      channel = 'sfx'
    } = options;

    if (channel === 'music' && !this.settings.musicEnabled) return;
    if (channel === 'sfx' && !this.settings.sfxEnabled) return;
    if (minIntervalMs > 0 && !this.shouldPlay(name, minIntervalMs)) return;

    const context = this.getAudioContext();
    if (!context) return;

    try {
      if (context.state === 'suspended') {
        void context.resume();
      }
      const osc = context.createOscillator();
      const amp = context.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      const now = context.currentTime;
      const outGain = channel === 'music' ? this.settings.musicVolume : this.settings.sfxVolume;
      const targetGain = Math.max(0.001, Math.min(0.12, gain * outGain));

      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(targetGain, now + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(amp);
      amp.connect(context.destination);
      osc.start(now);
      osc.stop(now + durationMs / 1000 + 0.02);
    } catch {
      // Silent fallback by design.
    }
  }

  playFootstep(surface: 'stone' | 'path' | 'debris' | 'water' = 'path') {
    if (!this.settings.sfxEnabled) return;
    const key = `footstep-${surface}`;
    if (this.hasAudioKey(key)) {
      if (!this.shouldPlay(key, 210)) return;
      this.playSound(key, { volume: this.settings.sfxVolume * 0.35 });
      return;
    }

    const tone = surface === 'stone' ? 156 : surface === 'debris' ? 142 : surface === 'water' ? 118 : 132;
    this.playSynthTone({ name: key, frequency: tone, durationMs: 55, type: 'triangle', gain: 0.05, minIntervalMs: 210, channel: 'sfx' });
  }

  playPickup(kind: 'coin' | 'material' | 'item' | 'quest' = 'item') {
    if (!this.settings.sfxEnabled) return;
    const key = `pickup-${kind}`;
    if (this.hasAudioKey(key)) {
      this.playSound(key, { volume: this.settings.sfxVolume * 0.5 });
      return;
    }

    const tone = kind === 'coin' ? 820 : kind === 'material' ? 690 : kind === 'quest' ? 920 : 760;
    this.playSynthTone({ name: key, frequency: tone, durationMs: 120, type: 'triangle', gain: 0.07, minIntervalMs: 90, channel: 'sfx' });
  }

  playFishing(action: 'cast' | 'catch' = 'catch') {
    if (!this.settings.sfxEnabled) return;
    const key = `fishing-${action}`;
    if (this.hasAudioKey(key)) {
      this.playSound(key, { volume: this.settings.sfxVolume * 0.45 });
      return;
    }

    const tone = action === 'cast' ? 220 : 420;
    this.playSynthTone({ name: key, frequency: tone, durationMs: action === 'cast' ? 150 : 190, type: action === 'cast' ? 'sine' : 'square', gain: 0.06, minIntervalMs: 130, channel: 'sfx' });
  }

  playCombatHit(weight: 'light' | 'heavy' = 'light') {
    if (!this.settings.sfxEnabled) return;
    const key = `combat-hit-${weight}`;
    if (this.hasAudioKey(key)) {
      this.playSound(key, { volume: this.settings.sfxVolume * (weight === 'heavy' ? 0.7 : 0.55) });
      return;
    }

    const tone = weight === 'heavy' ? 168 : 230;
    this.playSynthTone({ name: key, frequency: tone, durationMs: weight === 'heavy' ? 135 : 95, type: 'sawtooth', gain: 0.055, minIntervalMs: 90, channel: 'sfx' });
  }

  playDangerCue(level: 'low' | 'high' = 'low') {
    if (!this.settings.sfxEnabled) return;
    const key = `danger-cue-${level}`;
    if (this.hasAudioKey(key)) {
      this.playSound(key, { volume: this.settings.sfxVolume * 0.36 });
      return;
    }

    const tone = level === 'high' ? 128 : 152;
    this.playSynthTone({ name: key, frequency: tone, durationMs: 260, type: 'triangle', gain: 0.05, minIntervalMs: 1400, channel: 'sfx' });
  }

  playAmbientLoop(period: 'day' | 'night') {
    if (!this.settings.musicEnabled) return;
    const key = period === 'night' ? 'ambient-night-loop' : 'ambient-day-loop';
    if (this.hasAudioKey(key)) {
      this.playMusic(key, { loop: true, volume: Math.max(0.06, this.settings.musicVolume * 0.45) });
      return;
    }

    const base = period === 'night' ? 174 : 220;
    this.playSynthTone({ name: `ambient-${period}-a`, frequency: base, durationMs: 1800, type: 'sine', gain: 0.03, minIntervalMs: 4500, channel: 'music' });
    this.playSynthTone({ name: `ambient-${period}-b`, frequency: Math.round(base * 1.5), durationMs: 1500, type: 'triangle', gain: 0.02, minIntervalMs: 4500, channel: 'music' });
  }
}

export default new AudioManager();
