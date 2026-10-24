import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";
import { searchFilters } from "@/lib/ai/search-labels";
import type { InventoryRecord } from "@/lib/ai/inventory.types";
import type { InventorySearch } from "@/zod/ai-search.schema";

export default function AssistantContext({ selected, previousSearch }: { selected: InventoryRecord | null; previousSearch: InventorySearch | null }) {
  if (!selected && !previousSearch) return null;
  return <details className="border-t pt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium">Деталі пошуку</summary>
        <div className="mt-2 space-y-1">
          {selected && <p>Обрано: {inventoryEntityLabels[selected.entity]} «{selected.title}».</p>}
          {previousSearch && <p>Пошук: {previousSearch.entity === "all" ? "Усі типи" : inventoryEntityLabels[previousSearch.entity]} · {searchFilters(previousSearch).join(" · ") || "Без додаткових фільтрів"}.</p>}
        </div>
      </details>;
}
