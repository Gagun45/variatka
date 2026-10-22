import type { Clarification, InventorySearch, RecordSelection } from "@/zod/ai-search.schema";
import type { InventoryMutationIntent, InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import type { BatchPreview } from "@/zod/ai-batch.schema";

export type InventoryResult = RecordSelection & {
  title: string;
  summary: string;
};

export type MutationResult = RecordSelection & { operation: "created" | "updated" | "deleted"; title: string };

export type InventorySearchResult = {
  search: InventorySearch;
  page: number;
  items: InventoryResult[];
  hasMore: boolean;
};

export type InventoryRecord = InventoryResult & {
  fields: { label: string; value: string }[];
  ingredients: { id: number; title: string; amount: string; isInStock: boolean }[];
};

export type AssistantReply =
  | { operation: "search"; message: string; results: InventorySearchResult }
  | { operation: "viewSelected"; message: string; record: InventoryRecord }
  | { operation: "clarify"; message: string; clarification: Clarification }
  | { operation: "mutation"; message: string; assumptions: string[]; preview: InventoryMutationPreview }
  | { operation: "batch"; message: string; assumptions: string[]; preview: BatchPreview }
  | { operation: "chooseMutationTarget"; message: string; assumptions: string[]; intent: InventoryMutationIntent; results: InventorySearchResult }
  | { operation: "unsupported"; message: string };
