import * as THREE from 'three';
import { GameMode } from '../engine/GameMode';
import { Creat, CreatElement, CreatStage } from '../core/Creat';

export class CreatBondingMode extends GameMode {
  private creat: Creat | null = null;
  private environment: THREE.Group | null = null;
  private keys: Set<string> = new Set();
  private interactionCooldown: number = 0;
  private hearts: THREE.Mesh[] = [];

  public init(): void {
    console.log('💝 Creat Bonding Mode Started!');
    
    // Create player's creat (start as hatchling)
    this.creat = new Creat('Spark', CreatElement.LIGHT, CreatStage.HATCHLING);
    this.creat.position.set(0, 0, 0);
    this.game.getScene().add(this.creat.mesh);
    
    // Create peaceful environment
    this.createEnvironment();
    
    // Setup camera
    this.game.getCamera().position.set(0, 5, 10);
    this.game.getCamera().lookAt(0, 0, 0);
    
    // Setup controls
    this.setupControls();
    
    // Update HUD
    this.updateHUD();
    
    // Show instructions
    this.showInstructions();
  }

  private createEnvironment(): void {
    this.environment = new THREE.Group();
    
    // Create grass ground
    const groundGeometry = new THREE.CircleGeometry(20, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x90ee90,
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.environment.add(ground);
    
    // Add some flowers
    for (let i = 0; i < 20; i++) {
      const flowerGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
      const flowerMaterial = new THREE.MeshStandardMaterial({ 
        color: Math.random() > 0.5 ? 0xff69b4 : 0xffff00
      });
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 10;
      flower.position.set(
        Math.cos(angle) * radius,
        0.25,
        Math.sin(angle) * radius
      );
      flower.castShadow = true;
      this.environment.add(flower);
    }
    
    // Add a tree
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(8, 1.5, 0);
    trunk.castShadow = true;
    this.environment.add(trunk);
    
    const leavesGeometry = new THREE.SphereGeometry(2, 16, 16);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(8, 4, 0);
    leaves.castShadow = true;
    this.environment.add(leaves);
    
    this.game.getScene().add(this.environment);
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      
      // Pet creat (P key)
      if (e.key.toLowerCase() === 'p' && this.interactionCooldown <= 0) {
        this.petCreat();
      }
      
      // Feed creat (F key)
      if (e.key.toLowerCase() === 'f' && this.interactionCooldown <= 0) {
        this.feedCreat();
      }
      
      // Play with creat (Space)
      if (e.key === ' ' && this.interactionCooldown <= 0) {
        this.playWithCreat();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  private petCreat(): void {
    if (!this.creat) return;
    
    this.creat.increaseBond(3);
    this.interactionCooldown = 1.0;
    this.createHeartEffect();
    
    console.log(`💝 Pet creat! Bond: ${this.creat.bondLevel}/100`);
  }

  private feedCreat(): void {
    if (!this.creat) return;
    
    this.creat.heal(20);
    this.creat.increaseBond(5);
    this.interactionCooldown = 2.0;
    this.createHeartEffect();
    
    console.log(`🍖 Fed creat! Bond: ${this.creat.bondLevel}/100`);
  }

  private playWithCreat(): void {
    if (!this.creat) return;
    
    this.creat.increaseBond(10);
    this.interactionCooldown = 3.0;
    
    // Make creat jump
    const jumpHeight = 2;
    const jumpDuration = 0.5;
    let elapsed = 0;
    
    const animate = () => {
      elapsed += 0.016;
      const progress = elapsed / jumpDuration;
      
      if (progress < 1) {
        const height = Math.sin(progress * Math.PI) * jumpHeight;
        this.creat!.mesh.position.y = height;
        requestAnimationFrame(animate);
      } else {
        this.creat!.mesh.position.y = 0;
      }
    };
    
    animate();
    this.createHeartEffect();
    
    console.log(`🎮 Played with creat! Bond: ${this.creat.bondLevel}/100`);
    
    // Check for evolution
    if (this.creat.bondLevel >= 25 && this.creat.stage === CreatStage.HATCHLING) {
      setTimeout(() => {
        alert('Your creat is ready to evolve to Juvenile stage!');
        this.creat?.evolve();
      }, 1000);
    }
  }

  private createHeartEffect(): void {
    if (!this.creat) return;
    
    const heartGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const heartMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff69b4,
      transparent: true,
      opacity: 1
    });
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    heart.position.copy(this.creat.position);
    heart.position.y += 2;
    this.game.getScene().add(heart);
    this.hearts.push(heart);
    
    // Animate heart floating up
    const startY = heart.position.y;
    const duration = 1.5;
    let elapsed = 0;
    
    const animate = () => {
      elapsed += 0.016;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        heart.position.y = startY + progress * 3;
        heart.material.opacity = 1 - progress;
        requestAnimationFrame(animate);
      } else {
        this.game.getScene().remove(heart);
        const index = this.hearts.indexOf(heart);
        if (index > -1) this.hearts.splice(index, 1);
      }
    };
    
    animate();
  }

  private showInstructions(): void {
    console.log(`
💝 Creat Bonding Controls:
- P: Pet your creat (+3 bond)
- F: Feed your creat (+5 bond, heals)
- Space: Play with creat (+10 bond)
- Goal: Reach bond level 25 to evolve!
    `);
  }

  public update(deltaTime: number): void {
    if (!this.creat) return;
    
    // Update cooldown
    if (this.interactionCooldown > 0) {
      this.interactionCooldown -= deltaTime;
    }
    
    // Make creat look at camera
    this.creat.mesh.lookAt(this.game.getCamera().position);
    
    // Update creat
    this.creat.update(deltaTime);
    
    // Update HUD
    this.updateHUD();
  }

  private updateHUD(): void {
    const creatHpElement = document.getElementById('creat-hp');
    const creatHpBar = document.getElementById('creat-hp-bar');
    if (this.creat && creatHpElement && creatHpBar) {
      creatHpElement.textContent = Math.round(this.creat.stats.hp).toString();
      const hpPercent = (this.creat.stats.hp / this.creat.stats.maxHp) * 100;
      creatHpBar.style.width = `${hpPercent}%`;
    }
    
    // Show bond level in stamina display
    const staminaElement = document.getElementById('stamina');
    if (this.creat && staminaElement) {
      staminaElement.textContent = `${this.creat.bondLevel}/100 Bond`;
    }
  }

  public cleanup(): void {
    if (this.creat) {
      this.game.getScene().remove(this.creat.mesh);
    }
    if (this.environment) {
      this.game.getScene().remove(this.environment);
    }
    
    // Remove hearts
    this.hearts.forEach(heart => this.game.getScene().remove(heart));
    this.hearts = [];
    
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }
}
