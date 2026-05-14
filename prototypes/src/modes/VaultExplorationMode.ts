/**
 * Vault Exploration Mode - Explore kingdom vaults and collect treasure
 */

import * as THREE from 'three';
import { GameMode } from '../engine/GameMode';
import { GameEngine } from '../engine/GameEngine';
import { kingdomManager } from '../systems/KingdomManager';
import { Vault } from '../systems/VaultSystem';
import { dialogueManager } from '../systems/DialogueManager';

export class VaultExplorationMode extends GameMode {
  private currentVault: Vault | null = null;
  private player: THREE.Mesh;
  private camera: THREE.PerspectiveCamera;
  private coinsCollected: number = 0;
  private treasureChest: THREE.Mesh | null = null;
  private moveSpeed: number = 5;
  private keys: { [key: string]: boolean } = {};

  constructor(engine: GameEngine) {
    super('Vault Exploration', engine);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 1, 0);

    // Create player
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.position.set(0, 1, 5);

    this.setupControls();
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Collect treasure
      if (e.key === 'e' || e.key === 'E') {
        this.collectTreasure();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  public async enter(): Promise<void> {
    console.log('🏛️ Entering Vault Exploration Mode');
    
    // Get next kingdom to explore
    const nextKingdom = kingdomManager.getNextKingdom();
    if (nextKingdom) {
      kingdomManager.discoverKingdom(nextKingdom.id);
      kingdomManager.playCutscene(nextKingdom.id);
    }

    // Get first available vault
    const kingdoms = kingdomManager.getAllKingdoms();
    for (const kingdom of kingdoms) {
      if (kingdom.isAccessible() && !kingdom.vaultCleared) {
        const vault = kingdomManager.getVault(kingdom.id);
        if (vault) {
          this.currentVault = vault;
          break;
        }
      }
    }

    if (!this.currentVault) {
      console.log('⚠️ No vaults available to explore');
      dialogueManager.showSystemMessage('error', { 
        message: 'No vaults available. Discover more kingdoms!' 
      });
      return;
    }

    // Create vault scene
    const vaultScene = this.currentVault.create3DScene();
    this.engine.getScene().add(vaultScene);
    
    // Add player to scene
    this.engine.getScene().add(this.player);
    
    // Open vault
    this.currentVault.open();
    
    // Show navigation prompt
    dialogueManager.showNavigation('vaultEntered', {
      kingdomName: this.currentVault.kingdom.name
    });

    // Show tutorial
    dialogueManager.showTutorial('vaultExploration');
  }

  public exit(): void {
    console.log('🏛️ Exiting Vault Exploration Mode');
    
    // Clean up
    this.engine.getScene().remove(this.player);
    if (this.currentVault?.scene) {
      this.engine.getScene().remove(this.currentVault.scene);
    }
  }

  public update(deltaTime: number): void {
    if (!this.currentVault) return;

    // Update player movement
    this.updatePlayerMovement(deltaTime);

    // Animate treasure
    this.currentVault.animateTreasure(deltaTime);

    // Update camera to follow player
    this.camera.position.x = this.player.position.x;
    this.camera.position.z = this.player.position.z + 8;
    this.camera.lookAt(this.player.position);

    // Check if player is near treasure chest
    this.checkTreasureProximity();

    // Collect coins automatically when near them
    this.collectNearbyCoins();
  }

  private updatePlayerMovement(deltaTime: number): void {
    const moveDistance = this.moveSpeed * deltaTime;

    if (this.keys['w'] || this.keys['arrowup']) {
      this.player.position.z -= moveDistance;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      this.player.position.z += moveDistance;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.player.position.x -= moveDistance;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.player.position.x += moveDistance;
    }

    // Keep player within vault bounds
    this.player.position.x = Math.max(-9, Math.min(9, this.player.position.x));
    this.player.position.z = Math.max(-9, Math.min(9, this.player.position.z));
  }

  private collectNearbyCoins(): void {
    if (!this.currentVault || !this.currentVault.scene) return;

    // Check for coins near player
    this.currentVault.scene.children.forEach(child => {
      if (child instanceof THREE.Mesh && 
          child.geometry instanceof THREE.CylinderGeometry) {
        
        const distance = this.player.position.distanceTo(child.position);
        
        if (distance < 1.5) {
          // Collect coin
          const collected = this.currentVault!.collectCoins(1);
          if (collected > 0) {
            this.coinsCollected += collected;
            
            // Remove coin from scene
            this.currentVault!.scene!.remove(child);
            
            // Show collection effect
            if (this.coinsCollected % 50 === 0) {
              console.log(`💰 Collected ${this.coinsCollected} coins!`);
            }
          }
        }
      }
    });
  }

  private checkTreasureProximity(): void {
    if (!this.currentVault?.scene) return;

    // Find treasure chest
    this.currentVault.scene.children.forEach(child => {
      if (child instanceof THREE.Mesh && 
          child.geometry instanceof THREE.BoxGeometry &&
          child.position.y < 1) {
        
        this.treasureChest = child;
        const distance = this.player.position.distanceTo(child.position);
        
        if (distance < 2) {
          // Show prompt to collect
          if (!this.currentVault!.treasureCollected) {
            dialogueManager.showNavigation('treasureNearby');
          }
        }
      }
    });
  }

  private collectTreasure(): void {
    if (!this.currentVault || !this.treasureChest) return;

    const distance = this.player.position.distanceTo(this.treasureChest.position);
    
    if (distance < 2 && !this.currentVault.treasureCollected) {
      // Collect all treasure
      const loot = this.currentVault.collectTreasure();
      
      // Show loot
      console.log('👑 TREASURE COLLECTED!');
      console.log(`💰 Total coins: ${this.coinsCollected}`);
      console.log(`🎁 Items: ${loot.length}`);
      
      // Show system message
      dialogueManager.showSystemMessage('vaultCleared', {
        kingdomName: this.currentVault.kingdom.name,
        coinsCollected: this.coinsCollected,
        itemsCollected: loot.length
      });

      // Clear vault in kingdom manager
      kingdomManager.clearVault(this.currentVault.kingdom.id);

      // Start restoration
      kingdomManager.restoreKingdom(this.currentVault.kingdom.id, 33);

      // Show restoration message
      setTimeout(() => {
        dialogueManager.showSystemMessage('kingdomRestoring', {
          kingdomName: this.currentVault!.kingdom.name,
          progress: this.currentVault!.kingdom.restorationProgress
        });
      }, 2000);
    } else if (distance >= 2) {
      dialogueManager.showNavigation('tooFarFromTreasure');
    }
  }

  public render(): void {
    this.engine.getRenderer().render(this.engine.getScene(), this.camera);
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public handleInput(event: KeyboardEvent): void {
    // Handled in setupControls
  }

  public getHUDData(): any {
    return {
      mode: 'Vault Exploration',
      kingdom: this.currentVault?.kingdom.name || 'None',
      coinsCollected: this.coinsCollected,
      treasureCollected: this.currentVault?.treasureCollected || false,
      controls: {
        move: 'WASD',
        collect: 'E (near treasure)'
      }
    };
  }
}
