import Phaser from 'phaser';
import { setLanguage, resolveLanguage, LANGUAGE_STORAGE_KEY } from '../locale/i18n';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const lang = resolveLanguage(stored);
    setLanguage(lang);
    this.registry.set('language', lang);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4, height / 2, (width / 2) * value, 20);
    });

    this.load.image('hero', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABdElEQVRYR+2Xv0tCURjHv6dV1Fqqik1iU7GxoEX0LDZbWtBKItLkwMjUeRUCCKqYF1JBEMLJUMroFORQSJCqoUFBLWBGL8PivvdPOp6Z7c7szPPfd/55zvn/H4xjEwmA6HJ8HBeYwPfx8mswGQyWZeFVu1BKu1rtDsNoNvtMnvYpDJZDKi9XoZrGoNDoRBd13X2mKRRKJBI9m02u91WaTSaTSKYrFYL/f39Nu93u00qlUqlclmkwm40Go1sNns1+v18oVKpRdLpdIpFI5GI6oUCpFIp3G4XC7NpsNoVDodBgMx3E43m80Gg0IAqtVqtNptNpWq3W6XS6XRQKpVJp9Op1Vwux5msxmMwmEwmnU6nQjAYpFIJruu6dDodBYDP54vF4uFqtVqtYKkUikRCIRCKZTKZDJZDIajYajUZVKpVIpFIJDL5fL4/H4CB6PQQoFAoFAI9Ho9Go9EolEomEwmEwmkxQKBQCn081Go9Gocxms8mk0mkUgkEqlQqFQhGA6Hw+FwKBQKNRqNfr8flcpkMhlsNjs9nM5nU6nQ+A0+l0+n0+nUqlYq3W4XK5XILHMZDKZrMBgM13VdlmWZYzGax2u/3+/0ej0YjUajUajUajcYGBgYGmeCy+VSCQSCQSC4XK5TL+3u7v4P3+9Xqt9loNBp6IimB4PjoPAAAAAElFTkSuQmCC');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
