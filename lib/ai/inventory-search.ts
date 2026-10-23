import type { Prisma } from "@prisma/client";
import { inventoryDayStart } from "./search-dates";
import type { InventorySearchLeaf } from "@/zod/inventory-filters.schema";
import type { InventorySearch } from "@/zod/ai-search.schema";

// Prisma's contains uses LIKE: escape wildcard characters for literal text searches.
const contains = (value: string) => ({
  contains: value.replace(/[\\%_]/g, "\\$&"),
  mode: "insensitive" as const,
});

export type SearchLookups = { texts?: ReadonlyMap<string, number[]>; ingredients?: ReadonlyMap<string, number[]> };
const textWhere = (text: string | null, recipe = false, lookups: SearchLookups = {}): { OR?: Record<string, unknown>[]; id?: { in: number[] } } => !text ? {}
  : lookups.texts?.has(text) ? { id: { in: lookups.texts.get(text)! } }
  : { OR: [{ title: contains(text) }, { description: { ...contains(text), ...(!recipe && { not: null }) } }, ...(recipe ? [{ notes: contains(text) }, { confirmationNotes: { ...contains(text), not: null } }] : [])] };

type SpecificSearch = Exclude<InventorySearchLeaf, { entity: "all" }>;
// Missing text means null or the empty string, matching existing stored defaults.
function presence(field: string, value: boolean | null | undefined, nullable = true) {
  if (value == null) return [];
  return [value ? { [field]: nullable ? { not: null, notIn: [""] } : { not: "" } } : nullable ? { OR: [{ [field]: null }, { [field]: "" }] } : { [field]: "" }];
}
function commonConditions(search: SpecificSearch) {
  const AND: Record<string, unknown>[] = [];
  if (search.titleText != null) AND.push({ title: contains(search.titleText) });
  if (search.descriptionText != null) AND.push({ description: { ...contains(search.descriptionText), ...(search.entity !== "recipe" && { not: null }) } });
  AND.push(...presence("description", search.hasDescription, search.entity !== "recipe"));
  for (const field of ["created", "updated"] as const) {
    const from = search[`${field}From`], before = search[`${field}Before`];
    if (from != null || before != null) AND.push({ [`${field}At`]: { ...(from != null && { gte: inventoryDayStart(from) }), ...(before != null && { lt: inventoryDayStart(before) }) } });
  }
  return AND;
}

function ingredientBaseWhere(search: Extract<InventorySearchLeaf, { entity: "ingredient" }>, lookups: SearchLookups): Prisma.IngredientWhereInput {
  const AND: Prisma.IngredientWhereInput[] = commonConditions(search);
  if (search.categories?.length) AND.push({ category: { in: search.categories } });
  if (search.excludeCategories?.length) AND.push({ category: { notIn: search.excludeCategories } });
  AND.push(...presence("imageKey", search.hasImage));
  if (search.usedInRecipes != null) AND.push({ recipeIngredients: search.usedInRecipes ? { some: {} } : { none: {} } });
  return {
    ...textWhere(search.text, false, lookups),
    ...(search.category !== null && { category: search.category }),
    ...(search.isInStock !== null && { isInStock: search.isInStock }),
    ...(search.isSaved !== null && { isSaved: search.isSaved }),
    ...(AND.length && { AND }),
  };
}

function stuffBaseWhere(search: Extract<InventorySearchLeaf, { entity: "stuff" }>, lookups: SearchLookups): Prisma.StuffWhereInput {
  const AND: Prisma.StuffWhereInput[] = commonConditions(search);
  if (search.categories?.length) AND.push({ category: { in: search.categories } });
  if (search.excludeCategories?.length) AND.push({ category: { notIn: search.excludeCategories } });
  if (search.isInStock !== null) AND.push({ inStock: search.isInStock ? { gt: 0 } : 0 });
  if (search.stockMin !== null) AND.push({ inStock: { gte: search.stockMin } });
  if (search.stockMax !== null) AND.push({ inStock: { lte: search.stockMax } });
  return { ...textWhere(search.text, false, lookups), ...(search.category !== null && { category: search.category }), AND };
}

function recipeBaseWhere(search: Extract<InventorySearchLeaf, { entity: "recipe" }>, lookups: SearchLookups): Prisma.RecipeWhereInput {
  const AND: Prisma.RecipeWhereInput[] = commonConditions(search);
  if (search.categories?.length) AND.push({ category: { in: search.categories } });
  if (search.excludeCategories?.length) AND.push({ category: { notIn: search.excludeCategories } });
  AND.push(...presence("imageKey", search.hasImage), ...presence("notes", search.hasNotes, false), ...presence("confirmationNotes", search.hasConfirmationNotes));
  if (search.notesText != null) AND.push({ notes: contains(search.notesText) });
  if (search.confirmationNotesText != null) AND.push({ confirmationNotes: { ...contains(search.confirmationNotesText), not: null } });
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
  const ingredientCondition = (name: string, mode: "some" | "none"): Prisma.RecipeWhereInput => ({ ingredients: {
    [mode]: lookups.ingredients?.has(name) ? { ingredientId: { in: lookups.ingredients.get(name)! } } : { ingredient: { title: contains(name) } },
  } });
  for (const name of search.includeIngredients) AND.push(ingredientCondition(name, "some"));
  if (search.anyIngredients?.length) AND.push({ OR: search.anyIngredients.map((name) => ingredientCondition(name, "some")) });
  for (const name of search.excludeIngredients) AND.push(ingredientCondition(name, "none"));
  if (search.isInStock !== null) {
    AND.push({ variants: search.isInStock ? { some: { inStock: { gt: 0 } } } : { none: { inStock: { gt: 0 } } } });
  }
  if (search.readyToCook === true) {
    AND.push({ ingredients: { some: {} } }, { ingredients: { none: { ingredient: { isInStock: false } } } });
  } else if (search.readyToCook === false) {
    AND.push({ OR: [{ ingredients: { none: {} } }, { ingredients: { some: { ingredient: { isInStock: false } } } }] });
  }
  return {
    ...textWhere(search.text, true, lookups),
    ...(search.category !== null && { category: search.category }),
    ...(search.series !== null && { series: search.series }),
    ...(search.isHidden !== null && { isHidden: search.isHidden }),
    ...(search.isConfirmed !== null && { isConfirmed: search.isConfirmed }),
    ...(search.isSaved !== null && { isSaved: search.isSaved }),
    spicy: { ...(search.spicyMin !== null && { gte: search.spicyMin }), ...(search.spicyMax !== null && { lte: search.spicyMax }) },
    AND,
  };
}

type Entity = "ingredient" | "recipe" | "stuff";
type InventoryWhere = Prisma.IngredientWhereInput | Prisma.RecipeWhereInput | Prisma.StuffWhereInput;
const noRecords = { id: { in: [] as number[] } };

function leafWhere(search: InventorySearchLeaf, entity: Entity, lookups: SearchLookups): InventoryWhere {
  if (search.entity !== "all" && search.entity !== entity) return noRecords;
  if (search.entity === "ingredient") return ingredientBaseWhere(search, lookups);
  if (search.entity === "recipe") return recipeBaseWhere(search, lookups);
  if (search.entity === "stuff") return stuffBaseWhere(search, lookups);
  // Common all-entity branches retain all shared fields while projecting only
  // empty defaults for fields specific to each database model.
  if (entity === "ingredient") return ingredientBaseWhere({ ...search, entity, category: null, isInStock: null, isSaved: null }, lookups);
  if (entity === "stuff") return stuffBaseWhere({ ...search, entity, category: null, isInStock: null, stockMin: null, stockMax: null }, lookups);
  return recipeBaseWhere({ ...search, entity, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] }, lookups);
}
function combinedWhere(search: InventorySearch, entity: Entity, lookups: SearchLookups): InventoryWhere {
  const base = leafWhere(search, entity, lookups);
  const AND: InventoryWhere[] = Array.isArray(base.AND) ? [...base.AND] : base.AND ? [base.AND] : [];
  if (search.anyOf?.length) AND.push({ OR: search.anyOf.map((branch) => leafWhere(branch, entity, lookups)) } as InventoryWhere);
  if (search.noneOf?.length) AND.push({ NOT: { OR: search.noneOf.map((branch) => leafWhere(branch, entity, lookups)) } } as InventoryWhere);
  return { ...base, ...(AND.length ? { AND } : {}) } as InventoryWhere;
}
// The entity discriminator selects the matching typed compiler. No model-authored
// database objects or field names are accepted by these public wrappers.
export function ingredientWhere(search: InventorySearch, lookups: SearchLookups = {}): Prisma.IngredientWhereInput {
  return combinedWhere(search, "ingredient", lookups) as Prisma.IngredientWhereInput;
}
export function recipeWhere(search: InventorySearch, lookups: SearchLookups = {}): Prisma.RecipeWhereInput {
  return combinedWhere(search, "recipe", lookups) as Prisma.RecipeWhereInput;
}
export function stuffWhere(search: InventorySearch, lookups: SearchLookups = {}): Prisma.StuffWhereInput {
  return combinedWhere(search, "stuff", lookups) as Prisma.StuffWhereInput;
}
