/**
 * Minimal AudioManager using the Web Audio API to play procedurally
 * generated sounds without needing external assets.
 */
export class AudioManager {
  private static ctx?: AudioContext;
  private static menuThemeNode?: OscillatorNode;
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.initialized = true;
  }

  static playMenuTheme(): void {
    if (!this.ctx) return;
    this.stopMenuTheme();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(330, this.ctx.currentTime + 2);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    this.menuThemeNode = osc;
  }

  static stopMenuTheme(): void {
    if (this.menuThemeNode) {
      try {
        this.menuThemeNode.stop();
      } catch {
        // already stopped
      }
      this.menuThemeNode = undefined;
    }
  }

  static playClick(): void {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}
