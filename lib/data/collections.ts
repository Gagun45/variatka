import type { IIngredient, IRecipe, IStuff } from "@/lib/prisma.args";
import type { IPublicRecipe } from "@/lib/types";
import type { IPublicOrder } from "@/lib/types.order";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { stuffKeys } from "@/features/stuff/stuff.keys";
import { orderKeys } from "@/features/order/order.keys";

export interface Collections {
  publicRecipes: IPublicRecipe[];
  recipes: IRecipe[];
  ingredients: IIngredient[];
  stuff: IStuff[];
  wishlistIds: number[];
  myOrders: IPublicOrder[];
  allOrders: IPublicOrder[];
}

export const collectionKeys = {
  publicRecipes: recipeKeys.public,
  recipes: recipeKeys.recipes,
  ingredients: ingredientKeys.ingredients,
  stuff: stuffKeys.stuff,
  wishlistIds: recipeKeys.wishlistIds,
  myOrders: orderKeys.myOrders,
  allOrders: orderKeys.allOrders,
} as const;

export type Collection = keyof Collections;
