import Phaser from 'phaser';

class AudioManager {
  private scene?: Phaser.Scene;
  private music?: Phaser.Sound.BaseSound;

  readonly MENU_THEME = 'menu-theme';
  readonly CLICK_SFX = 'click-sfx';

  preload(scene: Phaser.Scene) {
    // Assets are expected to be served by the hosting environment; they are
    // not bundled with the repository to avoid binary files.
    scene.load.audio(this.MENU_THEME, 'assets/audio/menu.wav');
    scene.load.audio(this.CLICK_SFX, 'assets/audio/click.wav');
  }

  init(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playMusic(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (!this.scene) {
      return;
    }
    this.stopMusic();
    this.music = this.scene.sound.add(key, { loop: true, volume: 0.5, ...config });
    this.music.play();
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = undefined;
    }
  }

  playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (!this.scene) {
      return;
    }
    this.scene.sound.play(key, config);
  }
}

export default new AudioManager();
