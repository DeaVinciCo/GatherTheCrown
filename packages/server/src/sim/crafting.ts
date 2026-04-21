export interface CraftingMaterials {
  metal: number;
  shards: number;
  gem?: number;
}

export interface CraftingRecipe {
  id: string;
  materials: CraftingMaterials;
  baseDurability: number;
  durabilityPerShard: number;
  maxBonusDurability: number;
}

export interface CraftingResources {
  metal: number;
  shards: number;
  gem?: number;
}

export interface CraftingResult {
  id: string;
  durability: number;
}

export const craftingRecipes: Record<string, CraftingRecipe> = {
  crown: {
    id: 'crown',
    materials: { metal: 5, gem: 1, shards: 0 },
    baseDurability: 100,
    durabilityPerShard: 0,
    maxBonusDurability: 0,
  },
  sword: {
    id: 'sword',
    materials: { metal: 20, shards: 2 },
    baseDurability: 80,
    durabilityPerShard: 4,
    maxBonusDurability: 20,
  },
};

function getRequiredGem(recipe: CraftingRecipe): number {
  return recipe.materials.gem ?? 0;
}

export function canCraft(
  recipe: CraftingRecipe,
  resources: CraftingResources,
): boolean {
  return (
    resources.metal >= recipe.materials.metal &&
    resources.shards >= recipe.materials.shards &&
    (resources.gem ?? 0) >= getRequiredGem(recipe)
  );
}

export function calculateCraftingResult(
  recipe: CraftingRecipe,
  resources: CraftingResources,
): CraftingResult {
  const bonusShards = Math.max(0, resources.shards - recipe.materials.shards);
  const bonusDurability = Math.min(
    recipe.maxBonusDurability,
    bonusShards * recipe.durabilityPerShard,
  );

  return {
    id: recipe.id,
    durability: recipe.baseDurability + bonusDurability,
  };
}

export function craftFromRecipe(
  recipeId: string,
  resources: CraftingResources,
): CraftingResult | null {
  const recipe = craftingRecipes[recipeId];
  if (!recipe || !canCraft(recipe, resources)) {
    return null;
  }

  const result = calculateCraftingResult(recipe, resources);

  resources.metal -= recipe.materials.metal;
  resources.shards -= recipe.materials.shards;

  const requiredGem = getRequiredGem(recipe);
  if (requiredGem > 0) {
    resources.gem = (resources.gem ?? 0) - requiredGem;
  }

  return result;
}
