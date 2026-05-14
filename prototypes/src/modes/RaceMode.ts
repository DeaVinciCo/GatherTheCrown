import * as THREE from 'three';
import { GameMode } from '../engine/GameMode';
import { Creat, CreatElement } from '../core/Creat';

export class RaceMode extends GameMode {
  private creat: Creat | null = null;
  private track: THREE.Group | null = null;
  private speed: number = 0;
  private maxSpeed: number = 800; // Increased from 300
  private acceleration: number = 200; // Increased from 50
  private keys: Set<string> = new Set();
  private jumpVelocity: number = 0;
  private isGrounded: boolean = true;
  private gravity: number = -20;

  public init(): void {
    console.log('🏁 Race Mode Started!');
    
    // Create player's creat
    this.creat = new Creat('Ember', CreatElement.FIRE);
    this.game.getScene().add(this.creat.mesh);
    
    // Create race track
    this.createTrack();
    
    // Setup camera
    this.game.getCamera().position.set(0, 10, 15);
    this.game.getCamera().lookAt(0, 0, 0);
    
    // Setup controls
    this.setupControls();
    
    // Update HUD
    this.updateHUD();
  }

  private createTrack(): void {
    this.track = new THREE.Group();
    
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228b22,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.track.add(ground);
    
    // Create track path
    const trackGeometry = new THREE.PlaneGeometry(20, 200);
    const trackMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.9
    });
    const trackPath = new THREE.Mesh(trackGeometry, trackMaterial);
    trackPath.rotation.x = -Math.PI / 2;
    trackPath.position.y = 0.01;
    trackPath.receiveShadow = true;
    this.track.add(trackPath);
    
    // Add track markers
    for (let i = 0; i < 20; i++) {
      const markerGeometry = new THREE.BoxGeometry(2, 0.5, 0.5);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: i % 2 === 0 ? 0xff0000 : 0xffffff
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(-11, 0.25, -90 + i * 10);
      marker.castShadow = true;
      this.track.add(marker);
      
      const marker2 = marker.clone();
      marker2.position.x = 11;
      this.track.add(marker2);
    }
    
    this.game.getScene().add(this.track);
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  public update(deltaTime: number): void {
    if (!this.creat) return;
    
    // Handle input
    let targetSpeed = 0;
    let turnSpeed = 0;
    
    if (this.keys.has('w') || this.keys.has('arrowup')) {
      targetSpeed = this.maxSpeed;
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      targetSpeed = -this.maxSpeed * 0.5;
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      turnSpeed = 3; // Increased turn speed
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      turnSpeed = -3; // Increased turn speed
    }
    
    // Jump
    if ((this.keys.has(' ') || this.keys.has('space')) && this.isGrounded) {
      this.jumpVelocity = 15;
      this.isGrounded = false;
    }
    
    // Boost with Shift
    if (this.keys.has('shift')) {
      targetSpeed *= 1.8;
    }
    
    // Update speed with acceleration
    if (targetSpeed > this.speed) {
      this.speed = Math.min(targetSpeed, this.speed + this.acceleration * deltaTime);
    } else {
      this.speed = Math.max(targetSpeed, this.speed - this.acceleration * deltaTime);
    }
    
    // Update creat rotation
    this.creat.mesh.rotation.y += turnSpeed * deltaTime;
    
    // Apply gravity and jump
    this.jumpVelocity += this.gravity * deltaTime;
    this.creat.position.y += this.jumpVelocity * deltaTime;
    
    // Ground collision
    if (this.creat.position.y <= 0) {
      this.creat.position.y = 0;
      this.jumpVelocity = 0;
      this.isGrounded = true;
    }
    
    // Update creat position (forward/backward movement)
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.creat.mesh.quaternion);
    forward.multiplyScalar(this.speed * deltaTime);
    this.creat.position.x += forward.x;
    this.creat.position.z += forward.z;
    
    this.creat.mesh.position.copy(this.creat.position);
    
    // Update camera to follow creat smoothly
    const cameraOffset = new THREE.Vector3(0, 8, 12);
    cameraOffset.applyQuaternion(this.creat.mesh.quaternion);
    const targetCameraPos = this.creat.position.clone().add(cameraOffset);
    
    this.game.getCamera().position.lerp(targetCameraPos, deltaTime * 8);
    
    // Look slightly ahead of the creat
    const lookTarget = this.creat.position.clone();
    lookTarget.y += 2;
    this.game.getCamera().lookAt(lookTarget);
    
    // Update HUD
    this.updateHUD();
  }

  private updateHUD(): void {
    const speedElement = document.getElementById('speed');
    if (speedElement) {
      speedElement.textContent = Math.abs(Math.round(this.speed)).toString();
    }
    
    const creatHpElement = document.getElementById('creat-hp');
    const creatHpBar = document.getElementById('creat-hp-bar');
    if (this.creat && creatHpElement && creatHpBar) {
      creatHpElement.textContent = Math.round(this.creat.stats.hp).toString();
      const hpPercent = (this.creat.stats.hp / this.creat.stats.maxHp) * 100;
      creatHpBar.style.width = `${hpPercent}%`;
    }
  }

  public cleanup(): void {
    if (this.creat) {
      this.game.getScene().remove(this.creat.mesh);
    }
    if (this.track) {
      this.game.getScene().remove(this.track);
    }
    
    // Remove event listeners
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }
}
