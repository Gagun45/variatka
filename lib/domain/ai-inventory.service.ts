import type { InventorySearch, RecordSelection } from "@/zod/ai-search.schema";
import type { InventoryRecord, InventoryResult, InventorySearchResult } from "../ai/inventory.types";
import type { InventorySearchLeaf } from "@/zod/inventory-filters.schema";
import { ingredientWhere, recipeWhere, stuffWhere, type SearchLookups } from "../ai/inventory-search";
import { inventoryCategoryLabels as categories, inventorySeriesLabels as series } from "../ai/inventory-labels";
import { AppError } from "../error";
import { inventoryTimestamp } from "../ai/search-dates";
import { nameMatchScore } from "../ai/name-resolution";
import { prisma } from "../prisma";

export const SEARCH_PAGE_SIZE = 20;
const yesNo = (value: boolean) => value ? "Так" : "Ні";
const stockLabel = (value: boolean) => value ? "У наявності" : "Немає в наявності";
const timestampFields = (record: { createdAt: Date; updatedAt: Date }) => [
  { label: "Створено (Київ)", value: inventoryTimestamp(record.createdAt) },
  { label: "Оновлено (Київ)", value: inventoryTimestamp(record.updatedAt) },
];

export function validateSearchRanges(search: InventorySearch) {
  for (const branch of [...(search.anyOf ?? []), ...(search.noneOf ?? [])]) {
    if (search.entity !== "all" && branch.entity !== "all" && branch.entity !== search.entity) throw new AppError("Група фільтрів має стосуватися того самого типу запису.");
    validateSearchRanges(branch);
  }
  for (const field of ["created", "updated"] as const) {
    const from = search[`${field}From`], before = search[`${field}Before`];
    if (from != null && before != null && from >= before) throw new AppError("Початок періоду має бути раніше його кінця.");
  }
  if (search.entity === "recipe" && search.variantStockMin != null && search.variantStockMax != null && search.variantStockMin > search.variantStockMax) throw new AppError("Мінімальний залишок варіанта не може перевищувати максимальний.");
  if (search.entity === "stuff" && search.stockMin !== null && search.stockMax !== null && search.stockMin > search.stockMax) {
    throw new AppError("Мінімальний залишок не може перевищувати максимальний.");
  }
  if (search.entity === "recipe" && search.spicyMin !== null && search.spicyMax !== null && search.spicyMin > search.spicyMax) {
    throw new AppError("Мінімальна гострота не може перевищувати максимальну.");
  }
}

type Entity = RecordSelection["entity"];
const lookupPaging = (page: number) => ({ orderBy: [{ title: "asc" as const }, { id: "asc" as const }], skip: page * 250, take: 250 });

function relevantLeaves(search: InventorySearch, entity: Entity): InventorySearchLeaf[] {
  return [search, ...(search.anyOf ?? []), ...(search.noneOf ?? [])].filter((leaf) => leaf.entity === "all" || leaf.entity === entity);
}

// Resolve tolerant text/ingredient names once per entity, including names inside
// groups. SQL then evaluates the complete expression before paging its results.
async function prepareSearchLookups(search: InventorySearch, entity: Entity) {
  const leaves = relevantLeaves(search, entity);
  const texts = [...new Set(leaves.flatMap((leaf) => leaf.text ? [leaf.text] : []))];
  const ingredientNames = [...new Set(leaves.flatMap((leaf) => leaf.entity === "recipe" ? [...leaf.includeIngredients, ...(leaf.anyIngredients ?? []), ...leaf.excludeIngredients] : []))];
  const lookups: SearchLookups = {};
  if (ingredientNames.length) {
    const matches = new Map(ingredientNames.map((name) => [name, [] as number[]]));
    for (let page = 0; ; page++) {
      const rows = await prisma.ingredient.findMany({ where: {}, select: { id: true, title: true }, ...lookupPaging(page) });
      for (const row of rows) for (const name of ingredientNames) if (nameMatchScore(name, row.title) !== null) matches.get(name)!.push(row.id);
      if (rows.length < 250) break;
    }
    lookups.ingredients = matches;
  }
  const ranks = new Map<number, number>();
  if (!texts.length) return { lookups, ranks };
  const matches = new Map(texts.map((text) => [text, [] as number[]]));
  // Main scalar conditions always apply outside the OR/NOT groups, so they can
  // narrow the text lookup without dropping candidates from an alternative.
  const base = { ...search, text: null, anyOf: [], noneOf: [] };
  for (let page = 0; ; page++) {
    const args = { select: { id: true, title: true, description: true }, ...lookupPaging(page) };
    const rows = entity === "ingredient" ? await prisma.ingredient.findMany({ ...args, where: ingredientWhere(base, lookups) })
      : entity === "stuff" ? await prisma.stuff.findMany({ ...args, where: stuffWhere(base, lookups) })
      : await prisma.recipe.findMany({ ...args, select: { ...args.select, notes: true, confirmationNotes: true }, where: recipeWhere(base, lookups) });
    for (const row of rows) for (const text of texts) {
      const fields = [row.title, row.description, ...("notes" in row ? [row.notes] : []), ...("confirmationNotes" in row ? [row.confirmationNotes] : [])];
      const score = fields.map((value, index) => {
        const match = typeof value === "string" ? nameMatchScore(text, value) : null;
        return match === null ? null : match + index * 10;
      }).find((value) => value !== null);
      if (score !== undefined) {
        matches.get(text)!.push(row.id);
        if (text === search.text) ranks.set(row.id, score);
      }
    }
    if (rows.length < 250) break;
  }
  lookups.texts = matches;
  return { lookups, ranks };
}

async function readResultPage(search: InventorySearch, entity: Entity, lookups: SearchLookups, skip: number, take: number): Promise<InventoryResult[]> {
  const paging = { skip, take, orderBy: [{ title: "asc" as const }, { id: "asc" as const }] };
  if (entity === "ingredient") {
    const records = await prisma.ingredient.findMany({ ...paging, where: ingredientWhere(search, lookups), select: { id: true, title: true, category: true, isInStock: true } });
    return records.map((record) => ({ entity, id: record.id, title: record.title, summary: `${categories[record.category]} · ${stockLabel(record.isInStock)}` }));
  }
  if (entity === "stuff") {
    const records = await prisma.stuff.findMany({ ...paging, where: stuffWhere(search, lookups), select: { id: true, title: true, category: true, inStock: true } });
    return records.map((record) => ({ entity, id: record.id, title: record.title, summary: `${categories[record.category]} · Залишок: ${record.inStock}` }));
  }
  const records = await prisma.recipe.findMany({ ...paging, where: recipeWhere(search, lookups), select: { id: true, title: true, category: true, isHidden: true, isConfirmed: true, spicy: true } });
  return records.map((record) => ({ entity, id: record.id, title: record.title, summary: `${categories[record.category]} · Гострота: ${record.spicy}/4 · ${record.isHidden ? "Прихований" : "Видимий"} · ${record.isConfirmed ? "Підтверджений" : "Не підтверджений"}` }));
}

async function searchEntity(search: InventorySearch, entity: Entity, page: number): Promise<InventorySearchResult> {
  const { lookups, ranks } = await prepareSearchLookups(search, entity);
  let items: InventoryResult[];
  if (!search.text) items = await readResultPage(search, entity, lookups, page * SEARCH_PAGE_SIZE, SEARCH_PAGE_SIZE + 1);
  else {
    // Apply all groups in SQL before relevance ordering and pagination. Scanning
    // compact result rows avoids losing later matches to an early top-20 slice.
    items = [];
    for (let offset = 0; ; offset += 250) {
      const chunk = await readResultPage(search, entity, lookups, offset, 250);
      items.push(...chunk);
      if (chunk.length < 250) break;
    }
    items.sort((a, b) => ranks.get(a.id)! - ranks.get(b.id)! || a.title.localeCompare(b.title, "uk") || a.id - b.id);
    items = items.slice(page * SEARCH_PAGE_SIZE, (page + 1) * SEARCH_PAGE_SIZE + 1);
  }
  return { search, page, hasMore: items.length > SEARCH_PAGE_SIZE, items: items.slice(0, SEARCH_PAGE_SIZE) };
}

export async function searchInventory(search: InventorySearch, page = 0): Promise<InventorySearchResult> {
  validateSearchRanges(search);
  if (search.entity !== "all") return searchEntity(search, search.entity, page);
  // Each type evaluates the same logical expression. A branch for another type
  // is false, so excluding saved recipes never excludes ingredients/materials.
  const groups = await Promise.all([searchEntity(search, "ingredient", page), searchEntity(search, "recipe", page), searchEntity(search, "stuff", page)]);
  return { search, page, items: groups.flatMap((group) => group.items), hasMore: groups.some((group) => group.hasMore) };
}

export async function readInventoryRecord(selection: RecordSelection): Promise<InventoryRecord> {
  const where = { id: selection.id };
  if (selection.entity === "ingredient") {
    const record = await prisma.ingredient.findUnique({ where, select: { id: true, title: true, createdAt: true, updatedAt: true, imageKey: true, description: true, category: true, isInStock: true, isSaved: true, _count: { select: { recipeIngredients: true } } } });
    if (!record) throw new AppError("Інгредієнт більше не існує. Повторіть пошук.");
    return { ...selection, title: record.title, summary: categories[record.category], ingredients: [], fields: [
      { label: "Опис", value: record.description || "Не вказано" },
      ...timestampFields(record),
      { label: "Категорія", value: categories[record.category] },
      { label: "У наявності", value: yesNo(record.isInStock) },
      { label: "Збережений", value: yesNo(record.isSaved) },
      { label: "Є фото", value: yesNo(Boolean(record.imageKey)) },
      { label: "Використовується в рецептах", value: String(record._count.recipeIngredients) },
    ] };
  }
  if (selection.entity === "stuff") {
    const record = await prisma.stuff.findUnique({ where, select: { id: true, title: true, createdAt: true, updatedAt: true, description: true, category: true, inStock: true } });
    if (!record) throw new AppError("Матеріал більше не існує. Повторіть пошук.");
    return { ...selection, title: record.title, summary: categories[record.category], ingredients: [], fields: [
      { label: "Опис", value: record.description || "Не вказано" },
      ...timestampFields(record),
      { label: "Категорія", value: categories[record.category] },
      { label: "Залишок", value: String(record.inStock) },
    ] };
  }
  const record = await prisma.recipe.findUnique({ where, select: {
    id: true, title: true, createdAt: true, updatedAt: true, imageKey: true, description: true, notes: true, confirmationNotes: true, category: true, series: true, spicy: true, isHidden: true, isConfirmed: true, isSaved: true,
    ingredients: { orderBy: { ingredientId: "asc" }, select: { amount: true, ingredient: { select: { id: true, title: true, isInStock: true } } } },
    variants: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { label: true, inStock: true } },
  } });
  if (!record) throw new AppError("Рецепт більше не існує. Повторіть пошук.");
  const ingredients = record.ingredients.map(({ amount, ingredient }) => ({ ...ingredient, amount }));
  return { ...selection, title: record.title, summary: categories[record.category], ingredients, fields: [
    { label: "Опис", value: record.description || "Не вказано" },
    ...timestampFields(record),
    { label: "Нотатки", value: record.notes || "Не вказано" },
    { label: "Категорія", value: categories[record.category] },
    { label: "Серія", value: series[record.series] },
    { label: "Гострота", value: `${record.spicy}/4` },
    { label: "Прихований", value: yesNo(record.isHidden) },
    { label: "Підтверджений", value: yesNo(record.isConfirmed) },
    { label: "Примітки до підтвердження", value: record.confirmationNotes || "Не вказано" },
    { label: "Збережений", value: yesNo(record.isSaved) },
    { label: "Є фото", value: yesNo(Boolean(record.imageKey)) },
    { label: "Усі інгредієнти в наявності", value: yesNo(ingredients.length > 0 && ingredients.every((item) => item.isInStock)) },
    { label: "Залишки готової продукції", value: record.variants.length ? record.variants.map((variant) => `${variant.label}: ${variant.inStock}`).join("; ") : "Варіантів немає" },
  ] };
}
