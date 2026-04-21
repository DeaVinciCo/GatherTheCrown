/**
 * Babylon.js 3D Engine - Foundation for Future 3D Transition
 * This is a standalone engine that can eventually replace Phaser
 */

import * as BABYLON from 'babylon.js';

export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface GameState3D {
  playerPosition: Vector3Like;
  playerHealth: number;
  playerMaxHealth: number;
  creatures: Creature3D[];
  items: Item3D[];
  weather?: string;
}

export interface Creature3D {
  id: string;
  name: string;
  position: Vector3Like;
  health: number;
  maxHealth: number;
  mesh?: BABYLON.Mesh;
  isAlive: boolean;
}

export interface Item3D {
  id: string;
  name: string;
  position: Vector3Like;
  type: 'gold' | 'item' | 'equipment';
  mesh?: BABYLON.Mesh;
}

export class BabylonGameEngine {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.UniversalCamera;
  private playerMesh: BABYLON.Mesh | null = null;
  private lightManager: LightManager;
  private skybox: BABYLON.Mesh | null = null;
  private gameState: GameState3D = {
    playerPosition: { x: 0, y: 1, z: 0 },
    playerHealth: 100,
    playerMaxHealth: 100,
    creatures: [],
    items: [],
  };

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.scene = this.createScene();
    this.lightManager = new LightManager(this.scene);
    this.camera = this.setupCamera();
    this.setupPhysics();
    this.createEnvironment();
    this.setupEventListeners();
  }

  private createScene(): BABYLON.Scene {
    const scene = new BABYLON.Scene(this.engine);

    // Scene settings
    scene.clearColor = new BABYLON.Color3(15 / 255, 20 / 255, 25 / 255); // Dark blue
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

    // Enable optimizations
    scene.onBeforeRenderObservable.add(() => {
      // Update game logic here
    });

    return scene;
  }

  private setupCamera(): BABYLON.UniversalCamera {
    const camera = new BABYLON.UniversalCamera('playerCamera', new BABYLON.Vector3(0, 5, -10), this.scene);

    camera.attachControl(this.canvas, true);
    camera.speed = 0.3;
    camera.angularSensibility = 1000;
    camera.inertia = 0.7;
    camera.checkCollisions = true;
    camera.collisionRadius = new BABYLON.Vector3(0.2, 0.9, 0.2);

    // Set camera bounds
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI * 0.9;
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 50;

    return camera;
  }

  private setupPhysics(): void {
    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    this.scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());
  }

  private createEnvironment(): void {
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 200, height: 200, subdivisions: 100 },
      this.scene
    );

    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuse = new BABYLON.Color3(40 / 255, 80 / 255, 100 / 255); // Dark blue-gray
    groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    ground.material = groundMaterial;

    // Add physics
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 0.5 },
      this.scene
    );

    // Skybox
    this.createSkybox();

    // Sample terrain features
    this.createTerrainFeatures();
  }

  private createSkybox(): void {
    this.skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000 }, this.scene);

    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
    skyboxMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.4, 0.6);
    skyboxMaterial.backFaceCulling = false;

    this.skybox.material = skyboxMaterial;
  }

  private createTerrainFeatures(): void {
    // Add some trees/rocks for visual interest
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 100 - 50;
      const z = Math.random() * 100 - 50;

      // Tree
      const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk' + i, { height: 4, diameter: 1 }, this.scene);
      trunk.position = new BABYLON.Vector3(x, 2, z);

      const trunkMaterial = new BABYLON.StandardMaterial('trunkMat' + i, this.scene);
      trunkMaterial.diffuse = new BABYLON.Color3(101 / 255, 67 / 255, 33 / 255); // Brown
      trunk.material = trunkMaterial;

      // Foliage
      const foliage = BABYLON.MeshBuilder.CreateSphere('foliage' + i, { diameter: 4 }, this.scene);
      foliage.position = new BABYLON.Vector3(x, 6, z);

      const foliageMaterial = new BABYLON.StandardMaterial('foliageMat' + i, this.scene);
      foliageMaterial.diffuse = new BABYLON.Color3(34 / 255, 139 / 255, 34 / 255); // Forest green
      foliage.material = foliageMaterial;
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    // Keyboard input for testing
    this.setupInputControls();
  }

  private setupInputControls(): void {
    const inputMap: { [key: string]: boolean } = {};

    window.addEventListener('keydown', (e) => {
      inputMap[e.key.toUpperCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      inputMap[e.key.toUpperCase()] = false;
    });

    // Update game state based on input
    this.scene.onBeforeRenderObservable.add(() => {
      if (this.playerMesh) {
        const moveForce = 0.2;

        if (inputMap['W']) this.playerMesh.position.z += moveForce;
        if (inputMap['S']) this.playerMesh.position.z -= moveForce;
        if (inputMap['A']) this.playerMesh.position.x -= moveForce;
        if (inputMap['D']) this.playerMesh.position.x += moveForce;
      }
    });
  }

  /**
   * Create a 3D player character
   */
  public createPlayer(position?: Vector3Like): BABYLON.Mesh {
    if (this.playerMesh) {
      this.playerMesh.dispose();
    }

    const pos = position || this.gameState.playerPosition;

    // Create a simple capsule shape for player
    const player = BABYLON.MeshBuilder.CreateCapsule('player', { radius: 0.5, height: 1.8 }, this.scene);
    player.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);

    const playerMaterial = new BABYLON.StandardMaterial('playerMaterial', this.scene);
    playerMaterial.diffuse = new BABYLON.Color3(108 / 255, 92 / 255, 231 / 255); // Purple (primary color)
    playerMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    player.material = playerMaterial;

    // Add physics
    player.physicsImpostor = new BABYLON.PhysicsImpostor(
      player,
      BABYLON.PhysicsImpostor.CylinderImpostor,
      { mass: 1, friction: 0.3, restitution: 0 },
      this.scene
    );

    this.playerMesh = player;
    this.gameState.playerPosition = pos;

    return player;
  }

  /**
   * Create a 3D creature/enemy
   */
  public createCreature(creature: Creature3D): BABYLON.Mesh {
    const mesh = BABYLON.MeshBuilder.CreateBox(
      `creature_${creature.id}`,
      { size: 1 },
      this.scene
    );

    mesh.position = new BABYLON.Vector3(creature.position.x, creature.position.y, creature.position.z);

    const material = new BABYLON.StandardMaterial(`creatureMat_${creature.id}`, this.scene);
    material.diffuse = new BABYLON.Color3(255 / 255, 107 / 255, 107 / 255); // Red
    material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    mesh.material = material;

    // Add physics
    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      mesh,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0.5, friction: 0.5, restitution: 0.1 },
      this.scene
    );

    creature.mesh = mesh;
    this.gameState.creatures.push(creature);

    return mesh;
  }

  /**
   * Create a 3D item/loot
   */
  public createItem(item: Item3D): BABYLON.Mesh {
    const mesh = BABYLON.MeshBuilder.CreateSphere(
      `item_${item.id}`,
      { diameter: 0.5 },
      this.scene
    );

    mesh.position = new BABYLON.Vector3(item.position.x, item.position.y, item.position.z);

    const material = new BABYLON.StandardMaterial(`itemMat_${item.id}`, this.scene);

    switch (item.type) {
      case 'gold':
        material.emissiveColor = new BABYLON.Color3(255 / 255, 215 / 255, 0); // Gold
        break;
      case 'equipment':
        material.diffuse = new BABYLON.Color3(192 / 255, 192 / 255, 192 / 255); // Silver
        break;
      case 'item':
      default:
        material.diffuse = new BABYLON.Color3(100 / 255, 200 / 255, 100 / 255); // Green
    }

    mesh.material = material;

    // Make it rotate for visual effect
    this.scene.onBeforeRenderObservable.add(() => {
      mesh.rotation.y += 0.01;
    });

    item.mesh = mesh;
    this.gameState.items.push(item);

    return mesh;
  }

  /**
   * Update player position (from server/input)
   */
  public updatePlayerPosition(position: Vector3Like): void {
    if (this.playerMesh) {
      this.playerMesh.position = new BABYLON.Vector3(position.x, position.y, position.z);
      this.gameState.playerPosition = position;
    }
  }

  /**
   * Update creature position
   */
  public updateCreaturePosition(creatureId: string, position: Vector3Like): void {
    const creature = this.gameState.creatures.find((c) => c.id === creatureId);
    if (creature && creature.mesh) {
      creature.mesh.position = new BABYLON.Vector3(position.x, position.y, position.z);
      creature.position = position;
    }
  }

  /**
   * Remove a creature (after defeat)
   */
  public removeCreature(creatureId: string): void {
    const index = this.gameState.creatures.findIndex((c) => c.id === creatureId);
    if (index !== -1) {
      const creature = this.gameState.creatures[index];
      if (creature.mesh) {
        creature.mesh.dispose();
      }
      this.gameState.creatures.splice(index, 1);
    }
  }

  /**
   * Start the render loop
   */
  public start(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  /**
   * Stop the render loop and cleanup
   */
  public stop(): void {
    this.engine.stopRenderLoop();
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    this.scene.dispose();
    this.engine.dispose();
  }

  /**
   * Get the Babylon scene (for advanced manipulation)
   */
  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  /**
   * Get game state
   */
  public getGameState(): GameState3D {
    return this.gameState;
  }

  /**
   * Get the engine
   */
  public getEngine(): BABYLON.Engine {
    return this.engine;
  }
}

/**
 * Light management for dynamic lighting
 */
class LightManager {
  private scene: BABYLON.Scene;
  private hemLight: BABYLON.HemisphericLight;
  private pointLight: BABYLON.PointLight;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;

    // Hemisphere light (ambient)
    this.hemLight = new BABYLON.HemisphericLight('hemLight', new BABYLON.Vector3(0, 1, 0), scene);
    this.hemLight.intensity = 0.6;
    this.hemLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Point light (like a sun or torch)
    this.pointLight = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(50, 50, 50), scene);
    this.pointLight.intensity = 0.8;
    this.pointLight.range = 500;

    // Shadow generator
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, this.pointLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
  }

  /**
   * Update light position (for day/night cycles)
   */
  public setLightPosition(x: number, y: number, z: number): void {
    this.pointLight.position = new BABYLON.Vector3(x, y, z);
  }

  /**
   * Update light intensity
   */
  public setIntensity(intensity: number): void {
    this.pointLight.intensity = Math.max(0, Math.min(1, intensity));
  }
}

export { LightManager };
