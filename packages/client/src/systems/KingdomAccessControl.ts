import {
  KINGDOM_ACCESS_REQUIREMENTS,
  KINGDOM_BOSS_ARCHETYPES,
  type FourKingdomId,
  type KingdomAccessLockKind,
} from '@game/shared';
import { getCatalogBaseId } from './MasterItemCatalog';
import type { InventoryItem } from '../ui/InventoryMenu';

export interface LockCheckResult {
  granted: boolean;
  lockKind: KingdomAccessLockKind;
  lockLabel: string;
  missingItemIds: string[];
}

function toInventoryIdSet(inventory: InventoryItem[]): Set<string> {
  return new Set(inventory.map((entry) => getCatalogBaseId(entry.id)));
}

export function checkKingdomAccess(
  inventory: InventoryItem[],
  kingdomId: FourKingdomId,
  lockKind: KingdomAccessLockKind
): LockCheckResult {
  const requirement = KINGDOM_ACCESS_REQUIREMENTS.find((entry) => entry.kingdomId === kingdomId && entry.lockKind === lockKind);
  if (!requirement) {
    return {
      granted: true,
      lockKind,
      lockLabel: `${kingdomId} ${lockKind}`,
      missingItemIds: []
    };
  }

  const inventoryIds = toInventoryIdSet(inventory);
  const missing = requirement.requiredItemIds.filter((itemId) => !inventoryIds.has(itemId));

  return {
    granted: missing.length === 0,
    lockKind,
    lockLabel: requirement.lockLabel,
    missingItemIds: missing
  };
}

export function canOpenKingdomDoor(inventory: InventoryItem[], kingdomId: FourKingdomId): LockCheckResult {
  return checkKingdomAccess(inventory, kingdomId, 'door');
}

export function canOpenKingdomPortal(inventory: InventoryItem[], kingdomId: FourKingdomId): LockCheckResult {
  return checkKingdomAccess(inventory, kingdomId, 'portal');
}

export function getBossArchetypeByLock(kingdomId: FourKingdomId, lockKind: KingdomAccessLockKind) {
  const profile = KINGDOM_BOSS_ARCHETYPES[kingdomId];
  return lockKind === 'door' ? profile.doorBoss : profile.portalBoss;
}
