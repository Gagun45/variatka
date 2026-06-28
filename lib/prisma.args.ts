import { Prisma } from "@prisma/client";

export const recipeArgs = {
  include: {
    ingredients: {
      include: {
        ingredient: true,
      },
    },
  },
} satisfies Omit<Prisma.RecipeFindManyArgs, "where">;

export const ingredientArgs = {
  include: {
    _count: {
      select: {
        recipeIngredients: true,
      },
    },
  },
} satisfies Omit<Prisma.IngredientFindManyArgs, "where">;

export const stuffArgs = {} satisfies Omit<Prisma.StuffFindManyArgs, "where">;

export const userWithWishlistArgs = {
  include: {
    withlistItems: {
      include: {
        recipe: {
          include: { ingredients: { include: { ingredient: true } } },
        },
      },
    },
  },
} satisfies Omit<Prisma.UserFindManyArgs, "where">;

export type IRecipe = Prisma.RecipeGetPayload<typeof recipeArgs>;

export type IIngredient = Prisma.IngredientGetPayload<typeof ingredientArgs>;

export type IStuff = Prisma.StuffGetPayload<typeof stuffArgs>;

export type IUserWithWishlist = Prisma.UserGetPayload<
  typeof userWithWishlistArgs
>;
