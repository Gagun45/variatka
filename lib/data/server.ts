import "server-only";

import type { Session } from "next-auth";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ingredientArgs,
  orderArgs,
  publicRecipeWhere,
  recipeArgs,
} from "@/lib/prisma.args";
import { recipePresenter } from "@/lib/recipe.presenter";
import { orderPresenter } from "@/lib/presenters/order.presenter";
import type { Collection, Collections } from "./collections";

// Request-scoped only: never share a user's session or data across requests.
export const getDataSession = cache(auth);

export function availableCollections(session: Session | null): Collection[] {
  const collections: Collection[] = ["publicRecipes"];
  if (session?.user) collections.push("wishlistIds", "myOrders");
  if (session?.user.role === "ADMIN") {
    collections.push("recipes", "ingredients", "stuff", "allOrders");
  }
  return collections;
}

export function collectionLoaders(session: Session | null): {
  [K in Collection]: () => Promise<Collections[K]>;
} {
  // Authorization must be checked before calling a loader (including in GET).
  return {
    publicRecipes: async () => {
      const recipes = await prisma.recipe.findMany({
        where: publicRecipeWhere,
        ...recipeArgs,
      });
      return recipes.map(recipePresenter.toPublic);
    },
    recipes: () => prisma.recipe.findMany(recipeArgs),
    ingredients: () => prisma.ingredient.findMany(ingredientArgs),
    stuff: () => prisma.stuff.findMany(),
    wishlistIds: async () => {
      const items = await prisma.withlistItem.findMany({
        where: { userId: session!.user.pid, recipe: publicRecipeWhere },
        select: { recipeId: true },
      });
      return items.map(({ recipeId }) => recipeId);
    },
    myOrders: async () => {
      const orders = await prisma.order.findMany({
        where: { userId: session!.user.pid },
        orderBy: [{ createdAt: "desc" }],
        ...orderArgs,
      });
      return orders.map(orderPresenter.toPublic);
    },
    allOrders: async () => {
      const orders = await prisma.order.findMany({
        orderBy: [{ createdAt: "desc" }],
        ...orderArgs,
      });
      return orders.map(orderPresenter.toPublic);
    },
  };
}
