export interface GamepadMoveEvent {
  x: number;
  y: number;
}

export interface GamepadActionEvent {
  action: 'confirm' | 'cancel' | 'menu' | 'attack';
}

const DEADZONE = 0.2;

const ACTION_MAP: Record<number, GamepadActionEvent['action']> = {
  0: 'confirm',
  1: 'cancel',
  2: 'attack',
  9: 'menu',
};

export class GamepadManager {
  private animFrameId?: number;
  private previousButtons: boolean[] = [];

  start(): void {
    this.loop();
  }

  stop(): void {
    if (this.animFrameId !== undefined) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = undefined;
    }
  }

  private loop(): void {
    this.animFrameId = requestAnimationFrame(() => this.loop());
    this.poll();
  }

  private poll(): void {
    const gamepads = navigator.getGamepads?.();
    if (!gamepads) return;

    for (const gp of gamepads) {
      if (!gp) continue;
      this.processAxes(gp);
      this.processButtons(gp);
    }
  }

  private processAxes(gp: Gamepad): void {
    let x = 0;
    let y = 0;

    // Left stick axes
    const axisX = gp.axes[0] ?? 0;
    const axisY = gp.axes[1] ?? 0;

    if (Math.abs(axisX) > DEADZONE) x = axisX;
    if (Math.abs(axisY) > DEADZONE) y = axisY;

    // D-pad buttons (12=up, 13=down, 14=left, 15=right)
    if (gp.buttons[12]?.pressed) y = -1;
    if (gp.buttons[13]?.pressed) y = 1;
    if (gp.buttons[14]?.pressed) x = -1;
    if (gp.buttons[15]?.pressed) x = 1;

    if (x !== 0 || y !== 0) {
      // Normalize diagonal movement
      const len = Math.sqrt(x * x + y * y);
      const nx = x / len;
      const ny = y / len;

      window.dispatchEvent(
        new CustomEvent<GamepadMoveEvent>('gamepad:move', { detail: { x: nx, y: ny } })
      );
    }
  }

  private processButtons(gp: Gamepad): void {
    for (const [indexStr, action] of Object.entries(ACTION_MAP)) {
      const index = Number(indexStr);
      const pressed = gp.buttons[index]?.pressed ?? false;
      const wasPressed = this.previousButtons[index] ?? false;

      if (pressed && !wasPressed) {
        window.dispatchEvent(
          new CustomEvent<GamepadActionEvent>('gamepad:action', { detail: { action } })
        );
      }

      this.previousButtons[index] = pressed;
    }
  }
}
