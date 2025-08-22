export interface Salvage {
  metal: number;
  shards: number;
}

export function salvageItem(durability: number): Salvage {
  return { metal: Math.floor(durability / 10), shards: 1 };
}
