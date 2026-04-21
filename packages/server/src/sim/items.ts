import { CraftingResources, CraftingResult, craftFromRecipe } from './crafting';

export type Resources = CraftingResources;
export type CraftedItem = CraftingResult;

export interface Salvage {
  metal: number;
  shards: number;
}

export function salvageItem(durability: number): Salvage {
  return { metal: Math.floor(durability / 10), shards: 1 };
}

export function craftItem(
  recipeId: string,
  resources: Resources,
): CraftedItem | null {
  return craftFromRecipe(recipeId, resources);
}
