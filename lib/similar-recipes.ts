import { IRecipe } from "@/lib/prisma.args";

const getIngredientSet = (recipe: IRecipe) => {
  return new Set(recipe.ingredients.map((i) => i.ingredientId));
};

const jaccardSimilarity = (a: Set<number>, b: Set<number>) => {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);

  return intersection.size / union.size;
};

const categoryBoost = (a: IRecipe, b: IRecipe) => {
  return a.recipeCategoryId === b.recipeCategoryId ? 0.2 : 0;
};

const scoreRecipe = (base: IRecipe, candidate: IRecipe) => {
  const baseSet = getIngredientSet(base);
  const candSet = getIngredientSet(candidate);

  const ingredientScore = jaccardSimilarity(baseSet, candSet);
  const categoryScore = categoryBoost(base, candidate);

  return ingredientScore + categoryScore;
};

export const getSimilarRecipes = (
  current: IRecipe,
  all: IRecipe[],
  limit = 5,
): IRecipe[] => {
  return all
    .filter((r) => r.id !== current.id)
    .map((r) => ({
      recipe: r,
      score: scoreRecipe(current, r),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.recipe);
};
