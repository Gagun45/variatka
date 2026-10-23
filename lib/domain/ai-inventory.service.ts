import type { InventorySearch, RecordSelection } from "@/zod/ai-search.schema";
import type { InventoryRecord, InventoryResult, InventorySearchResult } from "../ai/inventory.types";
import { ingredientWhere, recipeWhere, stuffWhere } from "../ai/inventory-search";
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

// Match searchable text fields in bounded database pages, never send the catalogue
// to the model. Structured category/status filters are still applied by PostgreSQL.
async function textMatches(search: Exclude<InventorySearch, { entity: "all" }>) {
  const text = search.text!;
  const recipeFilters = search.entity === "recipe" ? await recipeSearchWhere({ ...search, text: null }) : {};
  const found: { id: number; title: string; score: number }[] = [];
  for (let page = 0; ; page++) {
    const args = { where: {}, select: { id: true, title: true, description: true }, orderBy: [{ title: "asc" as const }, { id: "asc" as const }], skip: page * 250, take: 250 };
    const rows = search.entity === "ingredient" ? await prisma.ingredient.findMany({ ...args, where: ingredientWhere({ ...search, text: null }) }) : search.entity === "stuff" ? await prisma.stuff.findMany({ ...args, where: stuffWhere({ ...search, text: null }) }) : await prisma.recipe.findMany({ ...args, select: { ...args.select, notes: true, confirmationNotes: true }, where: recipeFilters });
    for (const row of rows) {
      const fields = [row.title, row.description, ...("notes" in row ? [row.notes] : []), ...("confirmationNotes" in row ? [row.confirmationNotes] : [])];
      const scores = fields.map((value, index) => {
        const match = typeof value === "string" ? nameMatchScore(text, value) : null;
        return match === null ? null : match + index * 10;
      });
      const score = scores.find((value) => value !== null) ?? null;
      if (score !== null) found.push({ id: row.id, title: row.title, score });
    }
    if (rows.length < 250) break;
  }
  return found.sort((a, b) => a.score - b.score || a.title.localeCompare(b.title, "uk") || a.id - b.id);
}

async function recipeSearchWhere(search: Extract<InventorySearch, { entity: "recipe" }>) {
  if (!search.includeIngredients.length && !search.excludeIngredients.length) return recipeWhere(search);
  const ingredients: { id: number; title: string }[] = [];
  for (let page = 0; ; page++) {
    const chunk = await prisma.ingredient.findMany({ where: {}, select: { id: true, title: true }, orderBy: [{ title: "asc" }, { id: "asc" }], skip: page * 250, take: 250 });
    ingredients.push(...chunk);
    if (chunk.length < 250) break;
  }
  const where = recipeWhere({ ...search, includeIngredients: [], excludeIngredients: [] });
  const AND = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
  const ids = (name: string) => ingredients.filter((row) => nameMatchScore(name, row.title) !== null).map((row) => row.id);
  for (const name of search.includeIngredients) AND.push({ ingredients: { some: { ingredientId: { in: ids(name) } } } });
  for (const name of search.excludeIngredients) AND.push({ ingredients: { none: { ingredientId: { in: ids(name) } } } });
  return { ...where, AND };
}

export async function searchInventory(search: InventorySearch, page = 0): Promise<InventorySearchResult> {
  validateSearchRanges(search);
  const paging = { skip: page * SEARCH_PAGE_SIZE, take: SEARCH_PAGE_SIZE + 1, orderBy: [{ title: "asc" as const }, { id: "asc" as const }] };
  if (search.entity === "all") {
    // Page each type separately, so one large category cannot hide all other types.
    const groups = await Promise.all([
      searchInventory({ ...search, entity: "ingredient", text: search.text, category: null, isInStock: null, isSaved: null }, page),
      searchInventory({ ...search, entity: "recipe", text: search.text, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] }, page),
      searchInventory({ ...search, entity: "stuff", text: search.text, category: null, isInStock: null, stockMin: null, stockMax: null }, page),
    ]);
    return { search, page, items: groups.flatMap((group) => group.items), hasMore: groups.some((group) => group.hasMore) };
  }

  const matching = search.text ? await textMatches(search) : null;
  const textFilter = matching ? { id: { in: matching.slice(page * SEARCH_PAGE_SIZE, (page + 1) * SEARCH_PAGE_SIZE + 1).map((row) => row.id) } } : {};
  const readPaging = matching ? { orderBy: paging.orderBy } : paging;
  let items: InventoryResult[];
  if (search.entity === "ingredient") {
    const records = await prisma.ingredient.findMany({ ...readPaging, where: { ...ingredientWhere({ ...search, text: null }), ...textFilter }, select: { id: true, title: true, category: true, isInStock: true } });
    items = records.map((record) => ({ entity: "ingredient", id: record.id, title: record.title, summary: `${categories[record.category]} · ${stockLabel(record.isInStock)}` }));
  } else if (search.entity === "stuff") {
    const records = await prisma.stuff.findMany({ ...readPaging, where: { ...stuffWhere({ ...search, text: null }), ...textFilter }, select: { id: true, title: true, category: true, inStock: true } });
    items = records.map((record) => ({ entity: "stuff", id: record.id, title: record.title, summary: `${categories[record.category]} · Залишок: ${record.inStock}` }));
  } else {
    const records = await prisma.recipe.findMany({ ...readPaging, where: { ...await recipeSearchWhere({ ...search, text: null }), ...textFilter }, select: { id: true, title: true, category: true, isHidden: true, isConfirmed: true, spicy: true } });
    items = records.map((record) => ({ entity: "recipe", id: record.id, title: record.title, summary: `${categories[record.category]} · Гострота: ${record.spicy}/4 · ${record.isHidden ? "Прихований" : "Видимий"} · ${record.isConfirmed ? "Підтверджений" : "Не підтверджений"}` }));
  }
  if (matching) {
    const ranks = new Map(matching.map((row, index) => [row.id, index]));
    items = items.filter((item) => ranks.has(item.id)).sort((a, b) => ranks.get(a.id)! - ranks.get(b.id)!);
  }
  return { search, page, hasMore: items.length > SEARCH_PAGE_SIZE, items: items.slice(0, SEARCH_PAGE_SIZE) };
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
