import type { InventorySearch, RecordSelection } from "@/zod/ai-search.schema";
import type { InventoryRecord, InventoryResult, InventorySearchResult } from "../ai/inventory.types";
import { ingredientWhere, recipeWhere, stuffWhere } from "../ai/inventory-search";
import { inventoryCategoryLabels as categories, inventorySeriesLabels as series } from "../ai/inventory-labels";
import { AppError } from "../error";
import { prisma } from "../prisma";

export const SEARCH_PAGE_SIZE = 20;
const yesNo = (value: boolean) => value ? "Так" : "Ні";
const stockLabel = (value: boolean) => value ? "У наявності" : "Немає в наявності";

export function validateSearchRanges(search: InventorySearch) {
  if (search.entity === "stuff" && search.stockMin !== null && search.stockMax !== null && search.stockMin > search.stockMax) {
    throw new AppError("Мінімальний залишок не може перевищувати максимальний.");
  }
  if (search.entity === "recipe" && search.spicyMin !== null && search.spicyMax !== null && search.spicyMin > search.spicyMax) {
    throw new AppError("Мінімальна гострота не може перевищувати максимальну.");
  }
}

export async function searchInventory(search: InventorySearch, page = 0): Promise<InventorySearchResult> {
  validateSearchRanges(search);
  const paging = { skip: page * SEARCH_PAGE_SIZE, take: SEARCH_PAGE_SIZE + 1, orderBy: [{ title: "asc" as const }, { id: "asc" as const }] };
  if (search.entity === "all") {
    // Page each type separately, so one large category cannot hide all other types.
    const groups = await Promise.all([
      searchInventory({ entity: "ingredient", text: search.text, category: null, isInStock: null, isSaved: null }, page),
      searchInventory({ entity: "recipe", text: search.text, category: null, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] }, page),
      searchInventory({ entity: "stuff", text: search.text, category: null, isInStock: null, stockMin: null, stockMax: null }, page),
    ]);
    return { search, page, items: groups.flatMap((group) => group.items), hasMore: groups.some((group) => group.hasMore) };
  }

  let items: InventoryResult[];
  if (search.entity === "ingredient") {
    const records = await prisma.ingredient.findMany({ ...paging, where: ingredientWhere(search), select: { id: true, title: true, category: true, isInStock: true } });
    items = records.map((record) => ({ entity: "ingredient", id: record.id, title: record.title, summary: `${categories[record.category]} · ${stockLabel(record.isInStock)}` }));
  } else if (search.entity === "stuff") {
    const records = await prisma.stuff.findMany({ ...paging, where: stuffWhere(search), select: { id: true, title: true, category: true, inStock: true } });
    items = records.map((record) => ({ entity: "stuff", id: record.id, title: record.title, summary: `${categories[record.category]} · Залишок: ${record.inStock}` }));
  } else {
    const records = await prisma.recipe.findMany({ ...paging, where: recipeWhere(search), select: { id: true, title: true, category: true, isHidden: true, isConfirmed: true, spicy: true } });
    items = records.map((record) => ({ entity: "recipe", id: record.id, title: record.title, summary: `${categories[record.category]} · Гострота: ${record.spicy}/4 · ${record.isHidden ? "Прихований" : "Видимий"} · ${record.isConfirmed ? "Підтверджений" : "Не підтверджений"}` }));
  }
  return { search, page, hasMore: items.length > SEARCH_PAGE_SIZE, items: items.slice(0, SEARCH_PAGE_SIZE) };
}

export async function readInventoryRecord(selection: RecordSelection): Promise<InventoryRecord> {
  const where = { id: selection.id };
  if (selection.entity === "ingredient") {
    const record = await prisma.ingredient.findUnique({ where, select: { id: true, title: true, description: true, category: true, isInStock: true, isSaved: true, _count: { select: { recipeIngredients: true } } } });
    if (!record) throw new AppError("Інгредієнт більше не існує. Повторіть пошук.");
    return { ...selection, title: record.title, summary: categories[record.category], ingredients: [], fields: [
      { label: "Опис", value: record.description || "Не вказано" },
      { label: "Категорія", value: categories[record.category] },
      { label: "У наявності", value: yesNo(record.isInStock) },
      { label: "Збережений", value: yesNo(record.isSaved) },
      { label: "Використовується в рецептах", value: String(record._count.recipeIngredients) },
    ] };
  }
  if (selection.entity === "stuff") {
    const record = await prisma.stuff.findUnique({ where, select: { id: true, title: true, description: true, category: true, inStock: true } });
    if (!record) throw new AppError("Матеріал більше не існує. Повторіть пошук.");
    return { ...selection, title: record.title, summary: categories[record.category], ingredients: [], fields: [
      { label: "Опис", value: record.description || "Не вказано" },
      { label: "Категорія", value: categories[record.category] },
      { label: "Залишок", value: String(record.inStock) },
    ] };
  }
  const record = await prisma.recipe.findUnique({ where, select: {
    id: true, title: true, description: true, notes: true, confirmationNotes: true, category: true, series: true, spicy: true, isHidden: true, isConfirmed: true, isSaved: true,
    ingredients: { orderBy: { ingredientId: "asc" }, select: { amount: true, ingredient: { select: { id: true, title: true, isInStock: true } } } },
    variants: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { label: true, inStock: true } },
  } });
  if (!record) throw new AppError("Рецепт більше не існує. Повторіть пошук.");
  const ingredients = record.ingredients.map(({ amount, ingredient }) => ({ ...ingredient, amount }));
  return { ...selection, title: record.title, summary: categories[record.category], ingredients, fields: [
    { label: "Опис", value: record.description || "Не вказано" },
    { label: "Нотатки", value: record.notes || "Не вказано" },
    { label: "Категорія", value: categories[record.category] },
    { label: "Серія", value: series[record.series] },
    { label: "Гострота", value: `${record.spicy}/4` },
    { label: "Прихований", value: yesNo(record.isHidden) },
    { label: "Підтверджений", value: yesNo(record.isConfirmed) },
    { label: "Примітки до підтвердження", value: record.confirmationNotes || "Не вказано" },
    { label: "Збережений", value: yesNo(record.isSaved) },
    { label: "Усі інгредієнти в наявності", value: yesNo(ingredients.length > 0 && ingredients.every((item) => item.isInStock)) },
    { label: "Залишки готової продукції", value: record.variants.length ? record.variants.map((variant) => `${variant.label}: ${variant.inStock}`).join("; ") : "Варіантів немає" },
  ] };
}
