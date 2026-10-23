import { inventoryCategoryLabels, inventorySeriesLabels } from "./inventory-labels";
import type { InventorySearch } from "@/zod/ai-search.schema";

const filterLabels: Record<string, string> = {
  text: "Текст", category: "Категорія", series: "Серія", isInStock: "У наявності",
  isSaved: "Збережений", isHidden: "Прихований", isConfirmed: "Підтверджений",
  readyToCook: "Усі інгредієнти в наявності", spicyMin: "Гострота від", spicyMax: "Гострота до",
  titleText: "У назві", descriptionText: "В описі", notesText: "У нотатках", confirmationNotesText: "У примітках до підтвердження",
  hasImage: "Є фото", hasDescription: "Є опис", hasNotes: "Є нотатки", hasConfirmationNotes: "Є примітки до підтвердження", hasIngredients: "Є склад", hasVariants: "Є варіанти", usedInRecipes: "Використовується в рецептах",
  createdFrom: "Створено від (Київ)", createdBefore: "Створено раніше (Київ)", updatedFrom: "Оновлено від (Київ)", updatedBefore: "Оновлено раніше (Київ)",
  variantLabel: "Назва варіанта", variantInStock: "Варіант у наявності", variantStockMin: "Залишок варіанта від", variantStockMax: "Залишок варіанта до",
  stockMin: "Залишок від", stockMax: "Залишок до", includeIngredients: "Містить усі", excludeIngredients: "Не містить",
};

export function searchFilters(search: InventorySearch) {
  return Object.entries(search).flatMap(([key, value]) => {
    if (key === "entity" || value == null || (Array.isArray(value) && !value.length)) return [];
    let label: string;
    if (typeof value === "boolean") label = value ? "Так" : "Ні";
    else if (Array.isArray(value)) label = value.join(", ");
    else if (key === "category") label = inventoryCategoryLabels[value as keyof typeof inventoryCategoryLabels];
    else if (key === "series") label = inventorySeriesLabels[value as keyof typeof inventorySeriesLabels];
    else if (["createdFrom", "createdBefore", "updatedFrom", "updatedBefore"].includes(key)) label = String(value).split("-").reverse().join(".");
    else label = String(value);
    return [`${filterLabels[key]}: ${label}`];
  });
}

