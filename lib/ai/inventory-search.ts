import type { Prisma } from "@prisma/client";
import type { InventorySearch } from "@/zod/ai-search.schema";

// Prisma's contains uses LIKE: escape wildcard characters for literal text searches.
const contains = (value: string) => ({
  contains: value.replace(/[\\%_]/g, "\\$&"),
  mode: "insensitive" as const,
});

const textWhere = (text: string | null) => text
  ? { OR: [{ title: contains(text) }, { description: contains(text) }] }
  : {};

export function ingredientWhere(search: Extract<InventorySearch, { entity: "ingredient" }>): Prisma.IngredientWhereInput {
  return {
    ...textWhere(search.text),
    ...(search.category !== null && { category: search.category }),
    ...(search.isInStock !== null && { isInStock: search.isInStock }),
    ...(search.isSaved !== null && { isSaved: search.isSaved }),
  };
}

export function stuffWhere(search: Extract<InventorySearch, { entity: "stuff" }>): Prisma.StuffWhereInput {
  const AND: Prisma.StuffWhereInput[] = [];
  if (search.isInStock !== null) AND.push({ inStock: search.isInStock ? { gt: 0 } : 0 });
  if (search.stockMin !== null) AND.push({ inStock: { gte: search.stockMin } });
  if (search.stockMax !== null) AND.push({ inStock: { lte: search.stockMax } });
  return { ...textWhere(search.text), ...(search.category !== null && { category: search.category }), AND };
}

export function recipeWhere(search: Extract<InventorySearch, { entity: "recipe" }>): Prisma.RecipeWhereInput {
  const AND: Prisma.RecipeWhereInput[] = [];
  for (const title of search.includeIngredients) {
    AND.push({ ingredients: { some: { ingredient: { title: contains(title) } } } });
  }
  for (const title of search.excludeIngredients) {
    AND.push({ ingredients: { none: { ingredient: { title: contains(title) } } } });
  }
  if (search.isInStock !== null) {
    AND.push({ variants: search.isInStock ? { some: { inStock: { gt: 0 } } } : { none: { inStock: { gt: 0 } } } });
  }
  if (search.readyToCook === true) {
    AND.push({ ingredients: { some: {} } }, { ingredients: { none: { ingredient: { isInStock: false } } } });
  } else if (search.readyToCook === false) {
    AND.push({ OR: [{ ingredients: { none: {} } }, { ingredients: { some: { ingredient: { isInStock: false } } } }] });
  }
  return {
    ...textWhere(search.text),
    ...(search.category !== null && { category: search.category }),
    ...(search.series !== null && { series: search.series }),
    ...(search.isHidden !== null && { isHidden: search.isHidden }),
    ...(search.isConfirmed !== null && { isConfirmed: search.isConfirmed }),
    ...(search.isSaved !== null && { isSaved: search.isSaved }),
    spicy: { ...(search.spicyMin !== null && { gte: search.spicyMin }), ...(search.spicyMax !== null && { lte: search.spicyMax }) },
    AND,
  };
}
