/**
 * DOCK WELCOME SIGN SYSTEM
 * 
 * Displays at dock arrival with directional wooden sign pointers to major locations.
 * "Welcome to Sanctuary Isle - You are *here*" with arrows pointing to:
 * LEFT: Training, Trading Post, Market, Tavern, Inn, Home
 * RIGHT: Fishing Areas, Other Docks
 */

import Phaser from 'phaser';

interface SignDirection {
  label: string;
  direction: 'left' | 'right';
  description?: string;
  distance?: string;
}

export class DockWelcomeSign {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Create the welcome sign UI
   */
  public create(x: number, y: number) {
    if (this.container) {
      this.container.destroy();
    }

    // Main container at dock location
    this.container = this.scene.add.container(x, y).setDepth(100);

    // ─── BACKGROUND SIGN POST ──────────────────────────────────────
    // Vertical wooden post
    const postHeight = 200;
    const postWidth = 120;
    const post = this.scene.add.rectangle(0, -20, postWidth, postHeight, 0x6b4423, 1);
    post.setStrokeStyle(3, 0x3d2414);
    this.container.add(post);

    // Add some wood grain texture with lines
    for (let i = 0; i < 5; i++) {
      const line = this.scene.add.line(
        -postWidth / 2 + Phaser.Math.Between(10, postWidth - 10),
        -100 + i * 40,
        0,
        0,
        0,
        20,
        0x5a3520
      );
      line.setLineWidth(2);
      line.setAlpha(0.4);
      this.container.add(line);
    }

    // ─── MAIN SIGN BOARD ───────────────────────────────────────────
    const signWidth = 280;
    const signHeight = 110;
    const signBoard = this.scene.add.rectangle(0, -100, signWidth, signHeight, 0x8b7355, 1);
    signBoard.setStrokeStyle(4, 0x3d2414);
    this.container.add(signBoard);

    // Welcome text
    const welcomeText = this.scene.add.text(0, -125, 'Welcome to Sanctuary Isle', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f5deb3',
      align: 'center',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5).setLineSpacing(4);
    this.container.add(welcomeText);

    // You are here marker
    const hereText = this.scene.add.text(0, -105, 'You are ★ HERE ★', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
      align: 'center',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5);
    this.container.add(hereText);

    // Decorative divider line
    const divider = this.scene.add.line(
      -signWidth / 2 + 20,
      -88,
      0,
      0,
      signWidth - 40,
      0,
      0x3d2414
    );
    divider.setLineWidth(2);
    this.container.add(divider);

    // ─── LEFT POINTER (WESTWARD) ───────────────────────────────────
    this.createDirectionalPointer(
      -140,    // x offset (left side)
      -30,     // y offset (top)
      'left',
      [
        { label: 'Training', description: 'Ring Path' },
        { label: 'Trading Post' },
        { label: 'Market' },
        { label: 'Tavern', description: 'Ye Wandering Hearth' },
        { label: 'Inn' },
        { label: 'Home', description: 'Greenwood Clearing' }
      ]
    );

    // ─── CENTER DIVIDER ───────────────────────────────────────────
    const centerDot = this.scene.add.circle(0, -30, 4, 0x3d2414, 1);
    this.container.add(centerDot);

    // ─── RIGHT POINTER (EASTWARD) ──────────────────────────────────
    this.createDirectionalPointer(
      140,     // x offset (right side)
      -30,     // y offset (top)
      'right',
      [
        { label: 'Landgate Crossing', description: 'Curved monthly trek route' },
        { label: 'Fishing Spots', description: 'Fisher\'s Walk' },
        { label: 'Driftwood Wharf' },
        { label: 'Quiet Pier' }
      ]
    );

    // ─── GROUND ANCHOR POSTS ──────────────────────────────────────
    this.createGroundPost(-postWidth / 2 - 15, 100);
    this.createGroundPost(postWidth / 2 + 15, 100);

    this.visible = true;
  }

  /**
   * Create a directional pointer with arrow-shaped wood and location labels
   */
  private createDirectionalPointer(
    containerX: number,
    containerY: number,
    direction: 'left' | 'right',
    locations: SignDirection[]
  ) {
    const pointerContainer = this.scene.add.container(containerX, containerY);
    this.container?.add(pointerContainer);

    // Wooden arrow/pointer shape
    const arrowLength = 65;
    const arrowWidth = 20;
    const arrowHeadSize = 12;

    // Calculate arrow direction
    const arrowX = direction === 'left' ? -arrowLength : arrowLength;
    const headOffsetX = direction === 'left' ? -arrowHeadSize : arrowHeadSize;

    // Arrow shaft (wooden beam)
    const shaft = this.scene.add.rectangle(
      arrowX / 2,
      0,
      arrowLength,
      arrowWidth,
      0x9d8b6f,
      1
    );
    shaft.setStrokeStyle(2, 0x3d2414);
    pointerContainer.add(shaft);

    // Arrow head (triangle pointing direction)
    const headX = arrowX + headOffsetX;
    const triangle = this.scene.add.triangle(
      headX,
      0,
      direction === 'left' ? 0 : arrowHeadSize,
      -arrowHeadSize,
      direction === 'left' ? arrowHeadSize : 0,
      arrowHeadSize,
      headX - (direction === 'left' ? 0 : arrowHeadSize),
      0,
      0xa39b8c
    );
    triangle.setStrokeStyle(2, 0x3d2414);
    pointerContainer.add(triangle);

    // Location labels on and below the arrow
    let yOffset = 0;
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const labelX = (direction === 'left' ? -80 : 80);

      // Primary location name
      const primaryText = this.scene.add.text(labelX, yOffset, loc.label, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#2d1810',
        align: direction === 'left' ? 'right' : 'left',
        fontFamily: 'Georgia, serif'
      }).setOrigin(direction === 'left' ? 1 : 0, 0.5);
      pointerContainer.add(primaryText);

      // Secondary description (smaller, lighter)
      if (loc.description) {
        const descText = this.scene.add.text(
          labelX + (direction === 'left' ? -8 : 8),
          yOffset + 12,
          `(${loc.description})`,
          {
            fontSize: '9px',
            color: '#4a3728',
            align: direction === 'left' ? 'right' : 'left',
            fontFamily: 'Georgia, serif'
          }
        ).setOrigin(direction === 'left' ? 1 : 0, 0).setAlpha(0.85);
        pointerContainer.add(descText);

        yOffset += 28;
      } else {
        yOffset += 18;
      }
    }
  }

  /**
   * Create ground anchor posts for the sign post
   */
  private createGroundPost(x: number, y: number) {
    const post = this.scene.add.rectangle(x, y, 10, 30, 0x5a4e3e, 1);
    post.setStrokeStyle(1, 0x3d2414);
    this.container?.add(post);

    // Soil mound effect
    const mound = this.scene.add.ellipse(x, y + 20, 20, 10, 0x4a3e2f, 0.6);
    this.container?.add(mound);
  }

  /**
   * Toggle visibility
   */
  public setVisible(visible: boolean) {
    if (this.container) {
      this.container.setVisible(visible);
      this.visible = visible;
    }
  }

  /**
   * Check if sign is visible
   */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * Destroy the sign
   */
  public destroy() {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }

  /**
   * Add animation - gentle sway effect
   */
  public addSwayAnimation(duration = 3000) {
    if (this.container && this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.container,
        angle: { from: -2, to: 2 },
        yoyo: true,
        repeat: -1,
        duration: duration,
        ease: 'Sine.inout'
      });

      // Slight vertical bob
      this.scene.tweens.add({
        targets: this.container,
        y: { from: this.container.y - 3, to: this.container.y + 3 },
        yoyo: true,
        repeat: -1,
        duration: duration * 0.7,
        ease: 'Sine.inout'
      });
    }
  }

  /**
   * Show welcome text notification
   */
  public showWelcomeMessage() {
    const message = this.scene.add.text(
      this.container?.x || 0,
      (this.container?.y || 0) + 150,
      'Press [E] to explore nearby locations',
      {
        fontSize: '12px',
        color: '#a7f3d0',
        align: 'center',
        backgroundColor: '#1a1a1a',
        padding: { x: 10, y: 6 }
      }
    ).setOrigin(0.5).setDepth(101);

    this.scene.tweens.add({
      targets: message,
      alpha: { from: 1, to: 0.5 },
      yoyo: true,
      repeat: -1,
      duration: 2000
    });

    // Remove after 8 seconds
    this.scene.time.delayedCall(8000, () => {
      message.destroy();
    });
  }
}

/**
 * INTEGRATION HELPER
 * 
 * In SanctuaryIsleOverworld.create(), after hero initialization:
 * 
 *   const welcomeSign = new DockWelcomeSign(this);
 *   welcomeSign.create(2140, 600);  // x: dock x position, y: above dock on screen
 *   welcomeSign.addSwayAnimation(4000);
 *   
 *   // Show welcome message on first arrival
 *   if (!registry.get('dockSignSeen')) {
 *     welcomeSign.showWelcomeMessage();
 *     registry.set('dockSignSeen', true);
 *   }
 *   
 * To toggle visibility based on proximity:
 * 
 *   if (Phaser.Math.Distance.Between(hero.x, hero.y, 2140, 980) < 200) {
 *     welcomeSign.setVisible(true);
 *   } else {
 *     welcomeSign.setVisible(false);
 *   }
 */
