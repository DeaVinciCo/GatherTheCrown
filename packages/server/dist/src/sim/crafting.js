export const craftingRecipes = {
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
export function calculateCraftingResult(recipe) {
    return recipe.durability;
}
