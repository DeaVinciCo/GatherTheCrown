/**
 * DUNGEON CHECKPOINT SYSTEM
 * 
 * Manages savepoints during castle sweeps, dungeons, and multi-room encounters.
 * Allows heroes to save position, inventory, and progress at designated checkpoints.
 * Includes safety measures and progress tracking.
 * 
 * Used by: CastleSweep scenes, multi-floor dungeons, raid content
 */

import type { RegistryLike } from './PrepProgression';

export interface DungeonRoom {
  id: string;
  name: string;
  description: string;
  floor: number;
  connections: string[]; // IDs of adjacent rooms
  hasEnemies: boolean;
  enemyCount?: number;
  lootTable?: string[];
  hazards?: string[];
  checkpoint?: boolean;
}

export interface CheckpointSave {
  checkpointId: string;
  dungeonId: string;
  heroName: string;
  currentRoomId: string;
  heroHp: number;
  heroMaxHp: number;
  heroStamina: number;
  heroMaxStamina: number;
  creatName?: string;
  creatHp?: number;
  creatMaxHp?: number;
  inventory: {
    gold: number;
    items: Array<{ id: string; quantity: number }>;
    equipment?: Record<string, string>;
  };
  buffs: Array<{ name: string; remainingTurns: number }>;
  debuffs: Array<{ name: string; remainingTurns: number }>;
  roomsCleared: string[];
  enemiesDefeated: number;
  lootCollected: number;
  timeSinceEntry: number; // In seconds
  position: { x: number; y: number };
  difficulty: 'normal' | 'hard' | 'legendary';
  saveTime: number; // Timestamp
  checksumValid: boolean;
}

export interface DungeonProgress {
  dungeonId: string;
  heroName: string;
  startTime: number;
  currentRoom: string;
  roomsCleared: string[];
  enemiesDefeated: number;
  lootCollected: number;
  checkpointsSaved: number;
  maxFloorReached: number;
  bossDefeated?: boolean;
  abandoned: boolean;
  abandonReason?: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * CHECKPOINT CREATION & MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Create a checkpoint at current position
 */
export function createCheckpoint(
  registry: RegistryLike,
  dungeonId: string,
  currentRoomId: string,
  heroData: {
    name: string;
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    position: { x: number; y: number };
  },
  creatData?: {
    name: string;
    hp: number;
    maxHp: number;
  },
  inventory?: {
    gold: number;
    items: Array<{ id: string; quantity: number }>;
    equipment?: Record<string, string>;
  }
): CheckpointSave {
  // Prevent too-frequent checkpointing (minimum 30 seconds between saves)
  const lastCheckpointTime = registry.get(`lastCheckpointTime_${dungeonId}`) as number | undefined;
  const now = Date.now();
  if (lastCheckpointTime && now - lastCheckpointTime < 30000) {
    throw new Error('Cannot create checkpoint so soon. Rest a moment.');
  }

  const roomsCleared = (registry.get(`dungeonRoomsCleared_${dungeonId}`) as string[]) || [];
  const enemiesDefeated = (registry.get(`dungeonEnemiesDefeated_${dungeonId}`) as number) || 0;
  const lootCollected = (registry.get(`dungeonLootCollected_${dungeonId}`) as number) || 0;
  const entryTime = (registry.get(`dungeonStartTime_${dungeonId}`) as number) || now;

  const checkpoint: CheckpointSave = {
    checkpointId: `${dungeonId}_${now}`,
    dungeonId,
    heroName: heroData.name,
    currentRoomId,
    heroHp: heroData.hp,
    heroMaxHp: heroData.maxHp,
    heroStamina: heroData.stamina,
    heroMaxStamina: heroData.maxStamina,
    creatName: creatData?.name,
    creatHp: creatData?.hp,
    creatMaxHp: creatData?.maxHp,
    inventory: inventory || { gold: 0, items: [] },
    buffs: (registry.get(`activeBufsFc_${dungeonId}`) as Array<{ name: string; remainingTurns: number }>) || [],
    debuffs: (registry.get(`activeDebuffs_${dungeonId}`) as Array<{ name: string; remainingTurns: number }>) || [],
    roomsCleared,
    enemiesDefeated,
    lootCollected,
    timeSinceEntry: (now - entryTime) / 1000,
    position: heroData.position,
    difficulty: 'normal',
    saveTime: now,
    checksumValid: true
  };

  // Store checkpoint
  const checkpoints = (registry.get(`dungeonCheckpoints_${dungeonId}`) as CheckpointSave[]) || [];
  checkpoints.push(checkpoint);
  // Keep only last 5 checkpoints
  if (checkpoints.length > 5) checkpoints.shift();
  registry.set(`dungeonCheckpoints_${dungeonId}`, checkpoints);

  // Update checkpoint time
  registry.set(`lastCheckpointTime_${dungeonId}`, now);

  return checkpoint;
}

/**
 * Load from checkpoint and restore state
 */
export function restoreFromCheckpoint(
  registry: RegistryLike,
  checkpoint: CheckpointSave
): {
  success: boolean;
  message: string;
  restoredState?: Partial<CheckpointSave>;
} {
  try {
    // Validate checkpoint
    if (!checkpoint.checksumValid) {
      return {
        success: false,
        message: 'Checkpoint data corrupted. Cannot restore.'
      };
    }

    // Restore to registry
    registry.set(`dungeonCurrentRoom_${checkpoint.dungeonId}`, checkpoint.currentRoomId);
    registry.set(`heroHp_${checkpoint.dungeonId}`, checkpoint.heroHp);
    registry.set(`heroStamina_${checkpoint.dungeonId}`, checkpoint.heroStamina);
    if (checkpoint.creatHp) {
      registry.set(`creatHp_${checkpoint.dungeonId}`, checkpoint.creatHp);
    }

    return {
      success: true,
      message: `✓ Restored to Room ${checkpoint.currentRoomId}. Hero: ${checkpoint.heroHp}/${checkpoint.heroMaxHp} HP. Time: ${Math.floor(checkpoint.timeSinceEntry)}s`,
      restoredState: checkpoint
    };
  } catch (err) {
    return {
      success: false,
      message: `Error restoring checkpoint: ${String(err)}`
    };
  }
}

/**
 * List available checkpoints for a dungeon
 */
export function getCheckpoints(registry: RegistryLike, dungeonId: string): CheckpointSave[] {
  return (registry.get(`dungeonCheckpoints_${dungeonId}`) as CheckpointSave[]) || [];
}

/**
 * Delete a checkpoint
 */
export function deleteCheckpoint(registry: RegistryLike, dungeonId: string, checkpointId: string): void {
  const checkpoints = getCheckpoints(registry, dungeonId);
  const filtered = checkpoints.filter(cp => cp.checkpointId !== checkpointId);
  registry.set(`dungeonCheckpoints_${dungeonId}`, filtered);
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PROGRESS TRACKING
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Initialize dungeon progress tracking
 */
export function initializeDungeonProgress(
  registry: RegistryLike,
  dungeonId: string,
  heroName: string,
  difficulty: 'normal' | 'hard' | 'legendary' = 'normal'
): DungeonProgress {
  const now = Date.now();

  const progress: DungeonProgress = {
    dungeonId,
    heroName,
    startTime: now,
    currentRoom: 'entrance',
    roomsCleared: [],
    enemiesDefeated: 0,
    lootCollected: 0,
    checkpointsSaved: 0,
    maxFloorReached: 0,
    abandoned: false
  };

  registry.set(`dungeonProgress_${dungeonId}`, progress);
  registry.set(`dungeonStartTime_${dungeonId}`, now);
  registry.set(`dungeonRoomsCleared_${dungeonId}`, []);
  registry.set(`dungeonEnemiesDefeated_${dungeonId}`, 0);
  registry.set(`dungeonLootCollected_${dungeonId}`, 0);

  return progress;
}

/**
 * Update progress after clearing a room
 */
export function recordRoomCleared(
  registry: RegistryLike,
  dungeonId: string,
  roomId: string,
  enemyCount: number,
  lootValue: number
): DungeonProgress {
  const progress = (registry.get(`dungeonProgress_${dungeonId}`) as DungeonProgress) || {};
  const roomsCleared = (registry.get(`dungeonRoomsCleared_${dungeonId}`) as string[]) || [];
  const enemiesDefeated = ((registry.get(`dungeonEnemiesDefeated_${dungeonId}`) as number) || 0) + enemyCount;
  const lootCollected = ((registry.get(`dungeonLootCollected_${dungeonId}`) as number) || 0) + lootValue;

  if (!roomsCleared.includes(roomId)) {
    roomsCleared.push(roomId);
  }

  const updated: DungeonProgress = {
    ...progress,
    currentRoom: roomId,
    roomsCleared,
    enemiesDefeated,
    lootCollected
  };

  registry.set(`dungeonProgress_${dungeonId}`, updated);
  registry.set(`dungeonRoomsCleared_${dungeonId}`, roomsCleared);
  registry.set(`dungeonEnemiesDefeated_${dungeonId}`, enemiesDefeated);
  registry.set(`dungeonLootCollected_${dungeonId}`, lootCollected);

  return updated;
}

/**
 * Complete the dungeon run
 */
export function completeDungeonRun(
  registry: RegistryLike,
  dungeonId: string,
  bossDefeated: boolean = false
): {
  duration: number;
  roomsCleared: number;
  enemiesDefeated: number;
  lootCollected: number;
  baseXp: number;
} {
  const progress = (registry.get(`dungeonProgress_${dungeonId}`) as DungeonProgress) || {};
  const startTime = (registry.get(`dungeonStartTime_${dungeonId}`) as number) || Date.now();
  const now = Date.now();
  const duration = (now - startTime) / 1000; // In seconds

  const stats = {
    duration,
    roomsCleared: progress.roomsCleared?.length || 0,
    enemiesDefeated: progress.enemiesDefeated || 0,
    lootCollected: progress.lootCollected || 0,
    baseXp: (progress.roomsCleared?.length || 0) * 50 + (progress.enemiesDefeated || 0) * 10 + (bossDefeated ? 100 : 0)
  };

  // Archive run
  const completedRuns = (registry.get('completedDungeonRuns') as any[]) || [];
  completedRuns.push({
    dungeonId,
    heroName: progress.heroName,
    ...stats,
    bossDefeated,
    completedAt: now
  });
  registry.set('completedDungeonRuns', completedRuns);

  return stats;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * SAFETY & RECOVERY
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Abandon dungeon run (saves final state for retreat)
 */
export function abandonDungeonRun(
  registry: RegistryLike,
  dungeonId: string,
  reason: string = 'player_retreat'
): void {
  const progress = (registry.get(`dungeonProgress_${dungeonId}`) as DungeonProgress) || {};
  const updated = {
    ...progress,
    abandoned: true,
    abandonReason: reason
  };
  registry.set(`dungeonProgress_${dungeonId}`, updated);
}

/**
 * Check for crashed/incomplete runs
 */
export function checkForUnfinishedRuns(registry: RegistryLike): string[] {
  const unfinished: string[] = [];
  // Scan for dungeons with progress but no completion record
  // This is application-specific, but the pattern is to look for
  // dungeonProgress_* keys without corresponding completion records
  return unfinished;
}

/**
 * Get dungeon run summary for display
 */
export function getDungeonRunSummary(registry: RegistryLike, dungeonId: string): string {
  const progress = (registry.get(`dungeonProgress_${dungeonId}`) as DungeonProgress) || {};
  const startTime = (registry.get(`dungeonStartTime_${dungeonId}`) as number) || 0;
  const duration = startTime ? ((Date.now() - startTime) / 1000).toFixed(0) : '0';

  return `${progress.roomsCleared?.length || 0} rooms cleared | ${progress.enemiesDefeated || 0} foes | ${progress.lootCollected || 0}g | ${duration}s elapsed`;
}
