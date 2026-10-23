import type { IActionResponse } from "../types";
import type { InventoryRecord, InventorySearchResult, MutationResult } from "./inventory.types";
import type { InventorySearch, RecordSelection } from "@/zod/ai-search.schema";

// Read-only recovery: retrying this function can never repeat a mutation.
export async function refreshAfterSave(written: MutationResult[], search: InventorySearch | null, readers: {
  invalidate: () => Promise<unknown>;
  record: (selection: RecordSelection) => Promise<IActionResponse<InventoryRecord>>;
  search: (search: InventorySearch) => Promise<IActionResponse<InventorySearchResult>>;
}, retainedSelection: RecordSelection | null = null) {
  let failed = false;
  let selected: InventoryRecord | null = null;
  let results: InventorySearchResult | null = null;
  try { await readers.invalidate(); } catch { failed = true; }
  const deletedSelection = retainedSelection && written.some((item) => item.entity === retainedSelection.entity && item.id === retainedSelection.id && item.operation === "deleted");
  const selection = retainedSelection ? deletedSelection ? null : retainedSelection : written.length === 1 && written[0].operation !== "deleted" ? written[0] : null;
  if (selection) {
    try {
      const record = await readers.record({ entity: selection.entity, id: selection.id });
      if (record.ok) selected = record.data;
      else failed = true;
    } catch { failed = true; }
  }
  if (search) {
    try {
      const response = await readers.search(search);
      if (response.ok) results = response.data;
      else failed = true;
    } catch { failed = true; }
  }
  return { selected, results, failed };
}
