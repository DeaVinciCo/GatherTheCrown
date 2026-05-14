/**
 * GameConstants — single source of truth for all roster limits, unlock gates, and costs.
 * Do NOT duplicate these values anywhere else. Import from here.
 */

// ── Hero Roster ──────────────────────────────────────────────────────────────
/** Max hero slots per account. Third slot requires no gate — any account can have 3. */
export const MAX_HEROES = 3;

// ── Creat Roster ─────────────────────────────────────────────────────────────
/** Starting creat slots per hero (one main creat). */
export const CREAT_SLOTS_BASE = 1;
/** Total creat slots per hero after story completion unlock. */
export const CREAT_SLOTS_MAX = 3;
/** Additional slots unlocked after completing Story Mode / first full game. */
export const CREAT_EXTRA_SLOTS_AFTER_STORY = 2;

// ── Egg / Hatch Rules ─────────────────────────────────────────────────────────
/** Hero levels before creat egg can be found in Forest Trials. */
export const CREAT_EGG_MIN_HERO_LEVEL = 1;
/** Creat rename (via Haven panel) unlocks at this hero level. */
export const CREAT_RENAME_UNLOCK_LEVEL = 20;

// ── Naming Rules ─────────────────────────────────────────────────────────────
/** Username minimum length. */
export const USERNAME_MIN_LENGTH = 3;
/** Username maximum length. */
export const USERNAME_MAX_LENGTH = 20;
/** Hero / Creat display name maximum words. */
export const DISPLAY_NAME_MAX_WORDS = 5;
/** Hero / Creat display name maximum characters. */
export const DISPLAY_NAME_MAX_CHARS = 35;

// ── Name Change Costs ─────────────────────────────────────────────────────────
/** Gold cost to rename hero (can be done at any level). */
export const HERO_RENAME_COST_GC = 30_000;
/** Gold cost for a full account / stat wipe. */
export const ACCOUNT_WIPE_COST_GC = 50_000_000;

// ── Bond Mechanics ────────────────────────────────────────────────────────────
/** Starting bond % when hero element matches creat element at hatch. */
export const BOND_START_MATCH = 85;
/** Starting bond % when hero element diverges from creat element at hatch. */
export const BOND_START_DIVERGE = 75;

// ── Inventory Routing ────────────────────────────────────────────────────────
/** Item types that auto-route to creat inventory (not hero inventory). */
export const CREAT_ITEM_TYPES = ['creat-food', 'creat-drink', 'creat-gear', 'creat-potion', 'creat-craft'] as const;
export type CreatItemType = typeof CREAT_ITEM_TYPES[number];
