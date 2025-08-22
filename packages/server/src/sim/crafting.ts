export interface CraftingMaterials {
  metal: number;
  shards: number;
  gem?: number;
}

export interface CraftingRecipe {
  id: string;
  materials: CraftingMaterials;
  durability: number;
}

export const craftingRecipes: Record<string, CraftingRecipe> = {
  crown: {
    id: 'crown',
    materials: { metal: 5, gem: 1, shards: 0 },
    durability: 100,
  },
  sword: {
    id: 'sword',
    materials: { metal: 20, shards: 2 },
    durability: 80,
  },
};

export function calculateCraftingResult(recipe: CraftingRecipe): number {
  return recipe.durability;
}
