import type { Prisma } from "@prisma/client";
import { inventoryDayStart } from "./search-dates";
import type { InventorySearch } from "@/zod/ai-search.schema";

// Prisma's contains uses LIKE: escape wildcard characters for literal text searches.
const contains = (value: string) => ({
  contains: value.replace(/[\\%_]/g, "\\$&"),
  mode: "insensitive" as const,
});

const textWhere = (text: string | null, recipe = false) => text
  ? { OR: [{ title: contains(text) }, { description: contains(text) }, ...(recipe ? [{ notes: contains(text) }, { confirmationNotes: contains(text) }] : [])] }
  : {};

type SpecificSearch = Exclude<InventorySearch, { entity: "all" }>;
// Missing text means null or the empty string, matching existing stored defaults.
function presence(field: string, value: boolean | null | undefined, nullable = true) {
  if (value == null) return [];
  return [value ? { [field]: nullable ? { not: null, notIn: [""] } : { not: "" } } : nullable ? { OR: [{ [field]: null }, { [field]: "" }] } : { [field]: "" }];
}
function commonConditions(search: SpecificSearch) {
  const AND: Record<string, unknown>[] = [];
  if (search.titleText != null) AND.push({ title: contains(search.titleText) });
  if (search.descriptionText != null) AND.push({ description: contains(search.descriptionText) });
  AND.push(...presence("description", search.hasDescription, search.entity !== "recipe"));
  for (const field of ["created", "updated"] as const) {
    const from = search[`${field}From`], before = search[`${field}Before`];
    if (from != null || before != null) AND.push({ [`${field}At`]: { ...(from != null && { gte: inventoryDayStart(from) }), ...(before != null && { lt: inventoryDayStart(before) }) } });
  }
  return AND;
}

export function ingredientWhere(search: Extract<InventorySearch, { entity: "ingredient" }>): Prisma.IngredientWhereInput {
  const AND: Prisma.IngredientWhereInput[] = commonConditions(search);
  AND.push(...presence("imageKey", search.hasImage));
  if (search.usedInRecipes != null) AND.push({ recipeIngredients: search.usedInRecipes ? { some: {} } : { none: {} } });
  return {
    ...textWhere(search.text),
    ...(search.category !== null && { category: search.category }),
    ...(search.isInStock !== null && { isInStock: search.isInStock }),
    ...(search.isSaved !== null && { isSaved: search.isSaved }),
    ...(AND.length && { AND }),
  };
}

export function stuffWhere(search: Extract<InventorySearch, { entity: "stuff" }>): Prisma.StuffWhereInput {
  const AND: Prisma.StuffWhereInput[] = commonConditions(search);
  if (search.isInStock !== null) AND.push({ inStock: search.isInStock ? { gt: 0 } : 0 });
  if (search.stockMin !== null) AND.push({ inStock: { gte: search.stockMin } });
  if (search.stockMax !== null) AND.push({ inStock: { lte: search.stockMax } });
  return { ...textWhere(search.text), ...(search.category !== null && { category: search.category }), AND };
}

export function recipeWhere(search: Extract<InventorySearch, { entity: "recipe" }>): Prisma.RecipeWhereInput {
  const AND: Prisma.RecipeWhereInput[] = commonConditions(search);
  AND.push(...presence("imageKey", search.hasImage), ...presence("notes", search.hasNotes, false), ...presence("confirmationNotes", search.hasConfirmationNotes));
  if (search.notesText != null) AND.push({ notes: contains(search.notesText) });
  if (search.confirmationNotesText != null) AND.push({ confirmationNotes: contains(search.confirmationNotesText) });
  if (search.hasVariants != null) AND.push({ variants: search.hasVariants ? { some: {} } : { none: {} } });
  if (search.hasIngredients != null) AND.push({ ingredients: search.hasIngredients ? { some: {} } : { none: {} } });
  if (search.variantLabel != null || search.variantInStock != null || search.variantStockMin != null || search.variantStockMax != null) {
    const conditions: Prisma.RecipeVariantWhereInput[] = [];
    if (search.variantLabel != null) conditions.push({ label: contains(search.variantLabel) });
    if (search.variantInStock != null) conditions.push({ inStock: search.variantInStock ? { gt: 0 } : 0 });
    if (search.variantStockMin != null) conditions.push({ inStock: { gte: search.variantStockMin } });
    if (search.variantStockMax != null) conditions.push({ inStock: { lte: search.variantStockMax } });
    AND.push({ variants: { some: { AND: conditions } } });
  }
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
    ...textWhere(search.text, true),
    ...(search.category !== null && { category: search.category }),
    ...(search.series !== null && { series: search.series }),
    ...(search.isHidden !== null && { isHidden: search.isHidden }),
    ...(search.isConfirmed !== null && { isConfirmed: search.isConfirmed }),
    ...(search.isSaved !== null && { isSaved: search.isSaved }),
    spicy: { ...(search.spicyMin !== null && { gte: search.spicyMin }), ...(search.spicyMax !== null && { lte: search.spicyMax }) },
    AND,
  };
}
