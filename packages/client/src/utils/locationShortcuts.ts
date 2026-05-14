import Phaser from 'phaser';

interface LocationShortcutOptions {
  onMap?: () => void;
  onInventory?: () => void;
  onChat?: () => void;
  onAchievements?: () => void;
  onSettings?: () => void;
  extraHandlers?: Record<string, () => void>;
}

function isTypingTarget(target: EventTarget | null) {
  const node = target as HTMLElement | null;
  const tagName = node?.tagName?.toLowerCase() || '';
  return !!node && (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    node.isContentEditable
  );
}

// Shared location shortcut handler so I/M/Shift behavior stays consistent across scenes.
export function createLocationShortcutHandler(
  scene: Phaser.Scene,
  sceneKey: string,
  options: LocationShortcutOptions
) {
  return (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (!scene.scene.isActive(sceneKey)) return;
    if (isTypingTarget(event.target)) return;

    const key = event.key.toLowerCase();

    if (key === 'm' && options.onMap) {
      options.onMap();
      event.preventDefault();
      return;
    }

    if (key === 'i' && options.onInventory) {
      options.onInventory();
      event.preventDefault();
      return;
    }

    if ((key === 'shift' || key === 'c') && options.onChat) {
      options.onChat();
      event.preventDefault();
      return;
    }

    if (key === 'a' && options.onAchievements) {
      options.onAchievements();
      event.preventDefault();
      return;
    }

    if (key === 'o' && options.onSettings) {
      options.onSettings();
      event.preventDefault();
      return;
    }

    const extraHandler = options.extraHandlers?.[key];
    if (!extraHandler) return;

    extraHandler();
    event.preventDefault();
  };
}
