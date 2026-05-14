/**
 * GameConstants (server) — mirrors client/src/constants/GameConstants.ts.
 * Keep both in sync. Source of truth for all rule numbers.
 */
export const MAX_HEROES = 3;
export const CREAT_SLOTS_BASE = 1;
export const CREAT_SLOTS_MAX = 3;
export const CREAT_EXTRA_SLOTS_AFTER_STORY = 2;
export const CREAT_RENAME_UNLOCK_LEVEL = 20;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const DISPLAY_NAME_MAX_WORDS = 5;
export const DISPLAY_NAME_MAX_CHARS = 35;
export const HERO_RENAME_COST_GC = 30_000;
export const ACCOUNT_WIPE_COST_GC = 50_000_000;
export const BOND_START_MATCH = 85;
export const BOND_START_DIVERGE = 75;
