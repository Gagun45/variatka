import { inventoryCategoryLabels, inventorySeriesLabels } from "./inventory-labels";
import type { InventorySearch } from "@/zod/ai-search.schema";

const filterLabels: Record<string, string> = {
  text: "Назва або опис", category: "Категорія", series: "Серія", isInStock: "У наявності",
  isSaved: "Збережений", isHidden: "Прихований", isConfirmed: "Підтверджений",
  readyToCook: "Усі інгредієнти в наявності", spicyMin: "Гострота від", spicyMax: "Гострота до",
  stockMin: "Залишок від", stockMax: "Залишок до", includeIngredients: "Містить усі", excludeIngredients: "Не містить",
};

export function searchFilters(search: InventorySearch) {
  return Object.entries(search).flatMap(([key, value]) => {
    if (key === "entity" || value === null || (Array.isArray(value) && !value.length)) return [];
    let label: string;
    if (typeof value === "boolean") label = value ? "Так" : "Ні";
    else if (Array.isArray(value)) label = value.join(", ");
    else if (key === "category") label = inventoryCategoryLabels[value as keyof typeof inventoryCategoryLabels];
    else if (key === "series") label = inventorySeriesLabels[value as keyof typeof inventorySeriesLabels];
    else label = String(value);
    return [`${filterLabels[key]}: ${label}`];
  });
}

