import type { IActionResponse } from "../types";
import type { InventoryRecord, InventorySearchResult, MutationResult } from "./inventory.types";
import type { InventorySearch, RecordSelection } from "@/zod/ai-search.schema";

// Read-only recovery: retrying this function can never repeat a mutation.
export async function refreshAfterSave(written: MutationResult[], search: InventorySearch | null, readers: {
  invalidate: () => Promise<unknown>;
  record: (selection: RecordSelection) => Promise<IActionResponse<InventoryRecord>>;
  search: (search: InventorySearch) => Promise<IActionResponse<InventorySearchResult>>;
}) {
  let failed = false;
  let selected: InventoryRecord | null = null;
  let results: InventorySearchResult | null = null;
  try { await readers.invalidate(); } catch { failed = true; }
  if (written.length === 1 && written[0].operation !== "deleted") {
    try {
      const record = await readers.record({ entity: written[0].entity, id: written[0].id });
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
