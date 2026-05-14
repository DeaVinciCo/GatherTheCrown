export interface RegistryLike {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
}

export interface PrepProgressSnapshot {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
}

export interface PrepGainResult extends PrepProgressSnapshot {
  gained: number;
  source: string;
  leveledUp: boolean;
}

interface PrepLogEntry {
  source: string;
  gained: number;
  totalXp: number;
  at: number;
}

function xpRequiredForLevel(level: number) {
  const safe = Math.max(1, Math.floor(level));
  return 20 + (safe - 1) * 10;
}

export function getPrepProgress(registry: RegistryLike): PrepProgressSnapshot {
  const totalXp = Math.max(0, Number(registry.get('prepXP') || 0));
  let level = 1;
  let remaining = totalXp;

  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }

  return {
    totalXp,
    level,
    xpIntoLevel: remaining,
    xpToNextLevel: xpRequiredForLevel(level),
  };
}

export function gainPrepXp(registry: RegistryLike, amount: number, source: string): PrepGainResult {
  const gained = Math.max(0, Math.floor(amount));
  const before = getPrepProgress(registry);
  const totalXp = before.totalXp + gained;
  registry.set('prepXP', totalXp);

  const after = getPrepProgress(registry);
  const leveledUp = after.level > before.level;
  registry.set('prepLevel', after.level);

  const rawLog = registry.get('prepXPLog');
  const log = Array.isArray(rawLog) ? (rawLog as PrepLogEntry[]) : [];
  log.push({ source, gained, totalXp, at: Date.now() });
  if (log.length > 50) log.shift();
  registry.set('prepXPLog', log);

  return {
    gained,
    source,
    leveledUp,
    ...after,
  };
}
