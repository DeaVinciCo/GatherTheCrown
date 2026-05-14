/**
 * HealingSystem - Standardized healing mechanics
 * Supports both outdoor (grove trees with regen) and indoor (consumable potions/first-aid)
 */

export interface HealingTreeCluster {
  sprites: Phaser.Physics.Arcade.Sprite[];
  centerX: number;
  centerY: number;
  radiusMeters: number;
}

export function createOutdoorHealingClusters(
  scene: Phaser.Scene,
  numClusters: number,
  positions: Array<{ x: number; y: number }>
): HealingTreeCluster[] {
  const clusters: HealingTreeCluster[] = [];

  positions.slice(0, numClusters).forEach((pos) => {
    const cluster: HealingTreeCluster = {
      sprites: [],
      centerX: pos.x,
      centerY: pos.y,
      radiusMeters: 60
    };

    // Create 6-tree circular cluster around center
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = pos.x + Math.cos(angle) * 60;
      const y = pos.y + Math.sin(angle) * 60;
      
      const tree = scene.add.sprite(x, y, 'heal-tree');
      tree.setDepth(4).setScale(1);
      
      // Idle animation (sway)
      scene.tweens.add({
        targets: tree,
        y: y - 3,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inout'
      });

      cluster.sprites.push(tree as Phaser.Physics.Arcade.Sprite);
    }

    clusters.push(cluster);
  });

  return clusters;
}

export function updateOutdoorHealing(
  heroX: number,
  heroY: number,
  heroHp: number,
  heroMaxHp: number,
  clusters: HealingTreeCluster[]
): { newHp: number; inHealing: boolean; message: string } {
  let inHealing = false;
  let newHp = heroHp;
  let message = '';

  for (const cluster of clusters) {
    const distX = heroX - cluster.centerX;
    const distY = heroY - cluster.centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < 80) {
      inHealing = true;
      if (newHp < heroMaxHp) {
        newHp = Math.min(heroMaxHp, newHp + 2); // 2 hp per frame
        message = 'Healing Grove active: health restoring over time.';
      }
      break;
    }
  }

  return { newHp, inHealing, message };
}

export function createIndoorHealingPotion(
  scene: Phaser.Scene,
  x: number,
  y: number,
  healAmount: number = 25
): { sprite: Phaser.Physics.Arcade.Sprite; onCollect: () => void } {
  const potion = scene.add.sprite(x, y, 'potion');
  potion.setDepth(5).setScale(1);

  // Idle bounce animation
  scene.tweens.add({
    targets: potion,
    y: y - 5,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inout'
  });

  // Glow effect
  const glow = scene.add.sprite(x, y, 'potion');
  glow.setAlpha(0.3).setDepth(4).setScale(1.2);

  scene.tweens.add({
    targets: glow,
    alpha: 0,
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inout'
  });

  const onCollect = () => {
    potion.destroy();
    glow.destroy();
  };

  return { sprite: potion as Phaser.Physics.Arcade.Sprite, onCollect };
}

export function createIndoorFirstAidPack(
  scene: Phaser.Scene,
  x: number,
  y: number,
  healAmount: number = 20
): { sprite: Phaser.Physics.Arcade.Sprite; onCollect: () => void } {
  const pack = scene.add.sprite(x, y, 'first-aid-pack');
  pack.setDepth(5).setScale(1);

  // Idle bounce animation
  scene.tweens.add({
    targets: pack,
    y: y - 4,
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inout'
  });

  const onCollect = () => {
    pack.destroy();
  };

  return { sprite: pack as Phaser.Physics.Arcade.Sprite, onCollect };
}
