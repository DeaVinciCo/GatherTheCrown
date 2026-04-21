import Phaser from 'phaser';

/**
 * LayoutManager scales the entire game container to fit the
 * available window size while keeping the original aspect
 * ratio defined by the game's base resolution.
 */
export default class LayoutManager {
  private static baseWidth: number;
  private static baseHeight: number;
  private static root: HTMLElement | null = null;
  private static initialized = false;
  private static sceneHooks = new Set<Phaser.Scene>();

  /**
   * Initialise layout scaling for the given scene. The first call
   * sets up resize listeners and applies the initial scale. Subsequent
   * scenes are registered to receive per-scene hooks.
   */
  static init(scene: Phaser.Scene): void {
    this.hookSceneCreate(scene);

    if (this.initialized) return;
    this.initialized = true;

    this.baseWidth = scene.scale.gameSize.width;
    this.baseHeight = scene.scale.gameSize.height;
    this.root = document.getElementById('game');

    if (!this.root) return;

    // Ensure origin for transforms
    this.root.style.transformOrigin = 'top left';
    this.updateScale();

    window.addEventListener('resize', () => this.updateScale());
  }

  private static hookSceneCreate(scene: Phaser.Scene): void {
    if (this.sceneHooks.has(scene)) return;
    this.sceneHooks.add(scene);

    scene.events.once(Phaser.Core.Events.DESTROY, () => {
      this.sceneHooks.delete(scene);
    });
  }

  private static updateScale(): void {
    if (!this.root) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scale = Math.min(windowWidth / this.baseWidth, windowHeight / this.baseHeight);
    const x = (windowWidth - this.baseWidth * scale) / 2;
    const y = (windowHeight - this.baseHeight * scale) / 2;

    this.root.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    document.documentElement.style.setProperty('--ui-scale', String(scale.toFixed(3)));
  }
}
