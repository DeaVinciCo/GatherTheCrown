import * as THREE from 'three';

export enum CreatElement {
  FIRE = 'fire',
  WATER = 'water',
  AIR = 'air',
  EARTH = 'earth',
  ICE = 'ice',
  POISON = 'poison',
  LIGHT = 'light',
  SHADOW = 'shadow'
}

export enum CreatStage {
  EGG = 'egg',
  HATCHLING = 'hatchling',
  JUVENILE = 'juvenile',
  ADULT = 'adult',
  ELDER = 'elder'
}

export interface CreatStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  stamina: number;
  elementPower: number;
}

export interface EvolutionInventory {
  elementalFruits?: number;
  rareCrystals?: number;
  primalEssence?: number;
  goldCoins?: number;
}

export type BondActivity =
  | 'battle_win'
  | 'feed_favorite'
  | 'pet'
  | 'training'
  | 'sync_victory'
  | 'faint'
  | 'neglect'
  | 'wrong_element';

export class Creat {
  public name: string;
  public element: CreatElement;
  public stage: CreatStage;
  public level: number;
  public bondLevel: number;
  public stats: CreatStats;
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;

  constructor(
    name: string,
    element: CreatElement,
    stage: CreatStage = CreatStage.HATCHLING
  ) {
    this.name = name;
    this.element = element;
    this.stage = stage;
    this.level = 1;
    this.bondLevel = 10;
    
    // Initialize stats based on element and stage
    this.stats = this.calculateStats();
    
    // Create 3D mesh
    this.mesh = this.createMesh();
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
  }

  private calculateStats(): CreatStats {
    const baseStats: Record<CreatElement, Partial<CreatStats>> = {
      [CreatElement.FIRE]: { attack: 80, speed: 180, defense: 40 },
      [CreatElement.WATER]: { attack: 60, speed: 160, defense: 70 },
      [CreatElement.AIR]: { attack: 70, speed: 200, defense: 30 },
      [CreatElement.EARTH]: { attack: 90, speed: 140, defense: 100 },
      [CreatElement.ICE]: { attack: 75, speed: 170, defense: 60 },
      [CreatElement.POISON]: { attack: 85, speed: 165, defense: 50 },
      [CreatElement.LIGHT]: { attack: 80, speed: 185, defense: 55 },
      [CreatElement.SHADOW]: { attack: 95, speed: 175, defense: 45 }
    };

    const base = baseStats[this.element];
    const stageMultiplier = this.getStageMultiplier();

    return {
      maxHp: 100 + (this.level * 10) * stageMultiplier,
      hp: 100 + (this.level * 10) * stageMultiplier,
      attack: (base.attack || 70) + (this.level * 3),
      defense: (base.defense || 50) + (this.level * 2),
      speed: (base.speed || 160) + (this.level * 2),
      stamina: 50 + (this.level * 5),
      elementPower: 10 + (this.level * 4)
    };
  }

  private getStageMultiplier(): number {
    const multipliers = {
      [CreatStage.EGG]: 0.5,
      [CreatStage.HATCHLING]: 1,
      [CreatStage.JUVENILE]: 1.5,
      [CreatStage.ADULT]: 2,
      [CreatStage.ELDER]: 3
    };
    return multipliers[this.stage];
  }

  private createMesh(): THREE.Group {
    const group = new THREE.Group();
    
    // Get element color
    const color = this.getElementColor();
    
    // Create body (simple for prototype)
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color,
      roughness: 0.7,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Add elemental effect
    const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color,
      transparent: true,
      opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1;
    group.add(glow);

    // Add rider (hero character)
    const riderGroup = new THREE.Group();
    
    // Rider body
    const riderBodyGeometry = new THREE.CapsuleGeometry(0.2, 0.6, 8, 16);
    const riderBodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a90e2,
      roughness: 0.6
    });
    const riderBody = new THREE.Mesh(riderBodyGeometry, riderBodyMaterial);
    riderBody.castShadow = true;
    riderGroup.add(riderBody);
    
    // Rider head
    const riderHeadGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const riderHeadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffdbac,
      roughness: 0.8
    });
    const riderHead = new THREE.Mesh(riderHeadGeometry, riderHeadMaterial);
    riderHead.position.y = 0.5;
    riderHead.castShadow = true;
    riderGroup.add(riderHead);
    
    // Position rider on top of creat
    riderGroup.position.y = 2;
    group.add(riderGroup);

    return group;
  }

  private getElementColor(): number {
    const colors: Record<CreatElement, number> = {
      [CreatElement.FIRE]: 0xff4500,
      [CreatElement.WATER]: 0x1e90ff,
      [CreatElement.AIR]: 0x87ceeb,
      [CreatElement.EARTH]: 0x8b4513,
      [CreatElement.ICE]: 0x00ffff,
      [CreatElement.POISON]: 0x9400d3,
      [CreatElement.LIGHT]: 0xffd700,
      [CreatElement.SHADOW]: 0x4b0082
    };
    return colors[this.element];
  }

  public update(deltaTime: number): void {
    // Update position based on velocity
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.mesh.position.copy(this.position);

    // Animate glow
    const glow = this.mesh.children[1] as THREE.Mesh;
    if (glow) {
      glow.rotation.y += deltaTime;
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
      glow.scale.set(scale, scale, scale);
    }
  }

  public takeDamage(amount: number): void {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
  }

  public heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  public increaseBond(amount: number): void {
    this.bondLevel = Math.min(100, this.bondLevel + amount);
  }

  public applyBondActivity(activity: BondActivity): void {
    const gains: Record<BondActivity, number> = {
      battle_win: 2,
      feed_favorite: 1,
      pet: 0.5,
      training: 1,
      sync_victory: 5,
      faint: -3,
      neglect: -5,
      wrong_element: -10
    };

    this.bondLevel = Math.max(0, Math.min(100, this.bondLevel + gains[activity]));
  }

  public getBondMilestones(): string[] {
    const milestones: string[] = [];
    if (this.bondLevel >= 25) milestones.push('name_unlocked');
    if (this.bondLevel >= 50) milestones.push('combo_attacks');
    if (this.bondLevel >= 75) milestones.push('auto_block_once');
    if (this.bondLevel >= 100) milestones.push('perfect_bond');
    return milestones;
  }

  public levelUp(): void {
    this.level++;
    this.stats = this.calculateStats();
  }

  public canEvolve(inventory: EvolutionInventory = {}): boolean {
    if (this.stage === CreatStage.EGG) {
      return this.level >= 1;
    }

    if (this.stage === CreatStage.HATCHLING) {
      return this.level >= 11 && this.bondLevel >= 40 && (inventory.elementalFruits ?? 0) >= 10 && (inventory.goldCoins ?? 0) >= 500;
    }

    if (this.stage === CreatStage.JUVENILE) {
      return this.level >= 26 && this.bondLevel >= 70 && (inventory.rareCrystals ?? 0) >= 5 && (inventory.goldCoins ?? 0) >= 5000;
    }

    if (this.stage === CreatStage.ADULT) {
      return this.level >= 46 && this.bondLevel >= 95 && (inventory.primalEssence ?? 0) >= 1 && (inventory.goldCoins ?? 0) >= 50000;
    }

    return false;
  }

  public evolve(inventory: EvolutionInventory = {}): boolean {
    if (!this.canEvolve(inventory)) {
      return false;
    }

    const stages = [CreatStage.EGG, CreatStage.HATCHLING, CreatStage.JUVENILE, CreatStage.ADULT, CreatStage.ELDER];
    const currentIndex = stages.indexOf(this.stage);

    if (currentIndex < stages.length - 1) {
      this.stage = stages[currentIndex + 1];
      this.stats = this.calculateStats();
      return true;
    }

    return false;
  }
}
