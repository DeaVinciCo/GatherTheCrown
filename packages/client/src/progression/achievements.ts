import Phaser from 'phaser';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progressText?: string;
}

interface ProgressSnapshot {
  storyIntroSeen: boolean;
  forestTrialsCleared: number;
  volcanoClears: number;
  crownsForged: number;
  bossesDefeated: number;
  racesWon: number;
}

function readProgress(registry: Phaser.Data.DataManager): ProgressSnapshot {
  return {
    storyIntroSeen: !!registry.get('storyIntroSeen'),
    forestTrialsCleared: (registry.get('forestTrialsCleared') as number) || 0,
    volcanoClears: (registry.get('volcanoClears') as number) || 0,
    crownsForged: (registry.get('crownsForged') as number) || 0,
    bossesDefeated: (registry.get('bossesDefeated') as number) || 0,
    racesWon: (registry.get('racesWon') as number) || 0,
  };
}

export function getAchievementsFromRegistry(registry: Phaser.Data.DataManager): Achievement[] {
  const p = readProgress(registry);

  const forestGuardianComplete = p.forestTrialsCleared >= 1;
  const forgeMasterComplete = p.crownsForged >= 1 || p.volcanoClears >= 1;
  const bossSlayerComplete = p.bossesDefeated >= 10;

  return [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete Act I: The Awakening.',
      completed: p.storyIntroSeen,
      progressText: p.storyIntroSeen ? 'Complete' : 'Not started',
    },
    {
      id: 'forest-guardian',
      title: 'Forest Guardian',
      description: 'Clear one Forest Trial route.',
      completed: forestGuardianComplete,
      progressText: `${Math.min(p.forestTrialsCleared, 1)}/1`,
    },
    {
      id: 'forge-master',
      title: 'Forge Master',
      description: 'Forge your first crown or clear the Volcano route.',
      completed: forgeMasterComplete,
      progressText: forgeMasterComplete ? 'Complete' : `${Math.min(p.crownsForged + p.volcanoClears, 1)}/1`,
    },
    {
      id: 'boss-slayer',
      title: 'Boss Slayer',
      description: 'Defeat 10 bosses.',
      completed: bossSlayerComplete,
      progressText: `${Math.min(p.bossesDefeated, 10)}/10`,
    },
    {
      id: 'first-victory',
      title: 'First Victory',
      description: 'Win your first Race Circuit run.',
      completed: p.racesWon >= 1,
      progressText: `${Math.min(p.racesWon, 1)}/1`,
    },
  ];
}

export function updateAchievementRegistryFlags(registry: Phaser.Data.DataManager): void {
  const achievements = getAchievementsFromRegistry(registry);
  const completed = achievements.filter((a) => a.completed).map((a) => a.id);
  registry.set('achievementsCompleted', completed);
  registry.set('achievementCount', completed.length);
}
