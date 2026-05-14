import * as THREE from 'three';
import { GameMode } from '../engine/GameMode';
import { Creat, CreatElement } from '../core/Creat';

export class CombatMode extends GameMode {
  private playerCreat: Creat | null = null;
  private enemyCreat: Creat | null = null;
  private arena: THREE.Group | null = null;
  private keys: Set<string> = new Set();
  private attackCooldown: number = 0;
  private moveSpeed: number = 8;
  private dodgeCooldown: number = 0;

  public init(): void {
    console.log('⚔️ Combat Mode Started!');
    
    // Create player's creat
    this.playerCreat = new Creat('Blaze', CreatElement.FIRE);
    this.playerCreat.position.set(-5, 0, 0);
    this.game.getScene().add(this.playerCreat.mesh);
    
    // Create enemy creat
    this.enemyCreat = new Creat('Aqua', CreatElement.WATER);
    this.enemyCreat.position.set(5, 0, 0);
    this.game.getScene().add(this.enemyCreat.mesh);
    
    // Create arena
    this.createArena();
    
    // Setup camera
    this.game.getCamera().position.set(0, 15, 20);
    this.game.getCamera().lookAt(0, 0, 0);
    
    // Setup controls
    this.setupControls();
    
    // Update HUD
    this.updateHUD();
  }

  private createArena(): void {
    this.arena = new THREE.Group();
    
    // Create arena floor
    const floorGeometry = new THREE.CircleGeometry(15, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.arena.add(floor);
    
    // Create arena walls
    const wallGeometry = new THREE.CylinderGeometry(15, 15, 3, 32, 1, true);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 1.5;
    this.arena.add(walls);
    
    this.game.getScene().add(this.arena);
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      
      // Attack on spacebar
      if (e.key === ' ' && this.attackCooldown <= 0) {
        this.performAttack();
      }
      
      // Dodge on Shift
      if (e.key === 'Shift' && this.dodgeCooldown <= 0) {
        this.performDodge();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  private performAttack(): void {
    if (!this.playerCreat || !this.enemyCreat) return;
    
    // Calculate damage
    const damage = this.playerCreat.stats.attack - this.enemyCreat.stats.defense * 0.5;
    const finalDamage = Math.max(10, damage);
    
    // Apply damage
    this.enemyCreat.takeDamage(finalDamage);
    
    // Visual feedback
    this.createAttackEffect();
    
    // Set cooldown
    this.attackCooldown = 1.0; // 1 second cooldown
    
    console.log(`⚔️ Attack! Dealt ${finalDamage} damage`);
    
    // Check if enemy defeated
    if (this.enemyCreat.stats.hp <= 0) {
      console.log('🏆 Victory!');
      setTimeout(() => {
        alert('Victory! Enemy defeated!');
      }, 100);
    }
  }

  private createAttackEffect(): void {
    if (!this.playerCreat || !this.enemyCreat) return;
    
    // Create projectile
    const projectileGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const projectileMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff4500,
      transparent: true,
      opacity: 0.8
    });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectile.position.copy(this.playerCreat.position);
    this.game.getScene().add(projectile);
    
    // Animate projectile
    const startPos = this.playerCreat.position.clone();
    const endPos = this.enemyCreat.position.clone();
    const duration = 0.5;
    let elapsed = 0;
    
    const animate = () => {
      elapsed += 0.016; // ~60fps
      const progress = Math.min(elapsed / duration, 1);
      
      projectile.position.lerpVectors(startPos, endPos, progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.game.getScene().remove(projectile);
      }
    };
    
    animate();
  }

  public update(deltaTime: number): void {
    if (!this.playerCreat || !this.enemyCreat) return;
    
    // Update cooldowns
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown -= deltaTime;
    }
    
    // Handle movement
    const moveDir = new THREE.Vector3();
    if (this.keys.has('w') || this.keys.has('arrowup')) {
      moveDir.z -= 1;
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      moveDir.z += 1;
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      moveDir.x -= 1;
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      moveDir.x += 1;
    }
    
    // Normalize and apply movement
    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.playerCreat.position.x += moveDir.x * this.moveSpeed * deltaTime;
      this.playerCreat.position.z += moveDir.z * this.moveSpeed * deltaTime;
      
      // Keep player in arena
      const maxDist = 12;
      const dist = Math.sqrt(
        this.playerCreat.position.x ** 2 + 
        this.playerCreat.position.z ** 2
      );
      if (dist > maxDist) {
        this.playerCreat.position.x = (this.playerCreat.position.x / dist) * maxDist;
        this.playerCreat.position.z = (this.playerCreat.position.z / dist) * maxDist;
      }
      
      // Face movement direction
      const angle = Math.atan2(moveDir.x, moveDir.z);
      this.playerCreat.mesh.rotation.y = angle;
    }
    
    this.playerCreat.mesh.position.copy(this.playerCreat.position);
    
    // Simple AI for enemy - move toward player
    const toPlayer = new THREE.Vector3()
      .subVectors(this.playerCreat.position, this.enemyCreat.position)
      .normalize();
    
    this.enemyCreat.position.x += toPlayer.x * 3 * deltaTime;
    this.enemyCreat.position.z += toPlayer.z * 3 * deltaTime;
    this.enemyCreat.mesh.position.copy(this.enemyCreat.position);
    
    // Enemy faces player
    const angleToPlayer = Math.atan2(toPlayer.x, toPlayer.z);
    this.enemyCreat.mesh.rotation.y = angleToPlayer;
    
    // Enemy attacks when close
    const distToPlayer = this.playerCreat.position.distanceTo(this.enemyCreat.position);
    if (distToPlayer < 3 && Math.random() < 0.02 && this.playerCreat.stats.hp > 0) {
      const damage = this.enemyCreat.stats.attack - this.playerCreat.stats.defense * 0.5;
      const finalDamage = Math.max(5, damage);
      this.playerCreat.takeDamage(finalDamage);
      console.log(`🔥 Enemy attacked! Took ${finalDamage} damage`);
      
      if (this.playerCreat.stats.hp <= 0) {
        console.log('💀 Defeated!');
        setTimeout(() => {
          alert('Defeated! Try again!');
        }, 100);
      }
    }
    
    // Update creats
    this.playerCreat.update(deltaTime);
    this.enemyCreat.update(deltaTime);
    
    // Update HUD
    this.updateHUD();
  }
  
  private performDodge(): void {
    if (!this.playerCreat) return;
    
    // Quick dash backward
    const backward = new THREE.Vector3(0, 0, 1);
    backward.applyQuaternion(this.playerCreat.mesh.quaternion);
    this.playerCreat.position.add(backward.multiplyScalar(3));
    
    this.dodgeCooldown = 2.0;
    console.log('💨 Dodge!');
  }

  private updateHUD(): void {
    const playerHpElement = document.getElementById('player-hp');
    const playerHpBar = document.getElementById('player-hp-bar');
    if (this.playerCreat && playerHpElement && playerHpBar) {
      playerHpElement.textContent = Math.round(this.playerCreat.stats.hp).toString();
      const hpPercent = (this.playerCreat.stats.hp / this.playerCreat.stats.maxHp) * 100;
      playerHpBar.style.width = `${hpPercent}%`;
    }
    
    const creatHpElement = document.getElementById('creat-hp');
    const creatHpBar = document.getElementById('creat-hp-bar');
    if (this.enemyCreat && creatHpElement && creatHpBar) {
      creatHpElement.textContent = Math.round(this.enemyCreat.stats.hp).toString();
      const hpPercent = (this.enemyCreat.stats.hp / this.enemyCreat.stats.maxHp) * 100;
      creatHpBar.style.width = `${hpPercent}%`;
    }
  }

  public cleanup(): void {
    if (this.playerCreat) {
      this.game.getScene().remove(this.playerCreat.mesh);
    }
    if (this.enemyCreat) {
      this.game.getScene().remove(this.enemyCreat.mesh);
    }
    if (this.arena) {
      this.game.getScene().remove(this.arena);
    }
    
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }
}
