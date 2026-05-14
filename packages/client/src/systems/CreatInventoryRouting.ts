import type Phaser from 'phaser';

export type CreatInventoryType = 'food' | 'drink' | 'gear' | 'potion' | 'craft';

export interface CreatInventoryItem {
  id: string;
  name: string;
  quantity: number;
  type: CreatInventoryType;
}

export interface CreatActionPrompt {
  action: 'feed' | 'water' | 'equip' | 'heal' | 'store';
  label: string;
  message: string;
}

/**
 * Add an item to creat inventory if a creat is hatched.
 * Returns null when no creat exists and item should remain in hero inventory flow.
 */
export function routeToCreatInventory(
  registry: Phaser.Data.DataManager,
  item: Omit<CreatInventoryItem, 'id'> & { id?: string }
): { inventory: CreatInventoryItem[]; prompt: CreatActionPrompt } | null {
  const hasHatchedCreat = !!registry.get('hasHatchedCreat');
  if (!hasHatchedCreat) return null;

  const creatName = ((registry.get('creatName') as string) || 'your creat').trim() || 'your creat';
  const current = [
    ...((registry.get('creatInventory') || []) as CreatInventoryItem[])
  ];

  const existing = current.find((entry) => entry.name === item.name && entry.type === item.type);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    current.push({
      id: item.id || `${item.type}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: item.name,
      quantity: item.quantity,
      type: item.type
    });
  }

  registry.set('creatInventory', current);

  const prompt = getCreatActionPrompt(item.type, item.name, creatName);
  return { inventory: current, prompt };
}

export function getCreatActionPrompt(
  type: CreatInventoryType,
  itemName: string,
  creatName: string
): CreatActionPrompt {
  if (type === 'food') {
    return {
      action: 'feed',
      label: 'Feed',
      message: `Feed ${creatName} with ${itemName}`
    };
  }
  if (type === 'drink') {
    return {
      action: 'water',
      label: 'Find drink',
      message: `Find drink for ${creatName} (${itemName})`
    };
  }
  if (type === 'gear') {
    return {
      action: 'equip',
      label: 'Change armor',
      message: `Change armor for ${creatName} using ${itemName}`
    };
  }
  if (type === 'potion') {
    return {
      action: 'heal',
      label: 'Heal',
      message: `Heal ${creatName} with ${itemName}`
    };
  }

  return {
    action: 'store',
    label: 'Store',
    message: `Stored ${itemName} for ${creatName}`
  };
}
