import {
  craftingRecipes,
  calculateCraftingResult,
} from './crafting';

export interface Salvage {
  metal: number;
  shards: number;
}

export function salvageItem(durability: number): Salvage {
  return { metal: Math.floor(durability / 10), shards: 1 };
}

export interface Resources {
  metal: number;
  shards: number;
  gem?: number;
}

export interface CraftedItem {
  id: string;
  durability: number;
}

export function craftItem(
  recipeId: string,
  resources: Resources,
): CraftedItem | null {
  const recipe = craftingRecipes[recipeId];
  if (!recipe) return null;

  const { materials } = recipe;
  if (
    resources.metal < materials.metal ||
    resources.shards < materials.shards ||
    (materials.gem ?? 0) > (resources.gem ?? 0)
  ) {
    return null;
  }

  resources.metal -= materials.metal;
  resources.shards -= materials.shards;
  if (materials.gem) {
    resources.gem = (resources.gem ?? 0) - materials.gem;
  }

  const durability = calculateCraftingResult(recipe);
  return { id: recipe.id, durability };
}
