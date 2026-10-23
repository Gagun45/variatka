import type { Clarification, InventorySearch, RecordSelection } from "@/zod/ai-search.schema";
import type { PendingWrite } from "@/zod/ai-resolution.schema";
import type { RecordChoice } from "../domain/ai-resolution.service";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import type { ActionErrorCode } from "../action-error";

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

export type AssistantReply = (
  | { operation: "noChanges"; message: string }
  | { operation: "search"; message: string; results: InventorySearchResult }
  | { operation: "viewSelected"; message: string; record: InventoryRecord }
  | { operation: "clarify"; message: string; clarification: Clarification }
  | { operation: "clarifyRevision"; message: string; clarification: Clarification }
  | { operation: "keepTask"; message: string }
  | { operation: "revisionFailed"; message: string; code: ActionErrorCode; pending: PendingWrite; revisionApplied: boolean }
  | { operation: "mutation"; message: string; assumptions: string[]; preview: InventoryMutationPreview; resolved: PendingWrite }
  | { operation: "batch"; message: string; assumptions: string[]; preview: BatchPreview; resolved: PendingWrite }
  | { operation: "chooseRecord"; message: string; question: RecordChoice; pending: PendingWrite }
  | { operation: "unsupported"; message: string }
) & { continuesTask?: boolean };
