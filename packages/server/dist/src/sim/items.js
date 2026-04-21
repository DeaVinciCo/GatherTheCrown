import { craftingRecipes, calculateCraftingResult, } from './crafting';
export function salvageItem(durability) {
    return { metal: Math.floor(durability / 10), shards: 1 };
}
export function craftItem(recipeId, resources) {
    const recipe = craftingRecipes[recipeId];
    if (!recipe)
        return null;
    const { materials } = recipe;
    if (resources.metal < materials.metal ||
        resources.shards < materials.shards ||
        (materials.gem ?? 0) > (resources.gem ?? 0)) {
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
