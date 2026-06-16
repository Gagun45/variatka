import { Prisma } from "@prisma/client";

export const recipeArgs = {
  include: {
    ingredients: {
      include: {
        ingredient: true,
      },
    },
    recipeCategory: true,
  },
} satisfies Omit<Prisma.RecipeFindManyArgs, "where">;

export const ingredientArgs = {
  include: {
    _count: {
      select: {
        recipeIngredients: true,
      },
    },
    category: true,
  },
} satisfies Omit<Prisma.IngredientFindManyArgs, "where">;

export type IRecipe = Prisma.RecipeGetPayload<typeof recipeArgs>;
export type IIngredientCategory = Prisma.IngredientCategoryGetPayload<object>;
export type IRecipeCategory = Prisma.RecipeCategoryGetPayload<object>;
export type IIngredient = Prisma.IngredientGetPayload<typeof ingredientArgs>;
