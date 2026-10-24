"use server";

import { AppError } from "../error";
import { safeAction } from "./action.wrapper";
import { requireAdmin } from "./user.actions";
import {
  assistantRequestSchema,
  inventorySearchSchema,
  recordSelectionSchema,
  searchPageSchema,
  type AssistantRequest,
  type InventorySearch,
  type RecordSelection,
} from "@/zod/ai-search.schema";
import { findInventoryRecord, readInventoryRecord, searchInventory } from "../domain/ai-inventory.service";
import { planInventoryRequest } from "../ai/inventory-assistant";
import type { AssistantReply } from "../ai/inventory.types";
import { prepareClarification, sameSelection, validateClarificationSelection } from "../ai/clarification";
import { assertNever } from "../ai/mutation-definitions";
import { inventoryMutationIntentSchema, inventoryMutationPreviewSchema, type InventoryMutationIntent, type InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { prepareInventoryMutation } from "../domain/ai-mutations.service";
import { applyInventoryBatch } from "../domain/ai-batch.service";
import { batchPreviewSchema, type BatchPreview } from "@/zod/ai-batch.schema";
import { prepareAssistantWrite } from "../domain/ai-write-workflow.service";
import { resumeWriteSchema, type ResumeWrite } from "@/zod/ai-resolution.schema";
import { revisePendingWrite } from "../ai/write-revision";
import z from "zod";

export async function searchInventoryRecords(search: InventorySearch, page = 0) {
  return safeAction("searchInventoryRecords", async () => {
    await requireAdmin();
    const filters = inventorySearchSchema.safeParse(search);
    const parsedPage = searchPageSchema.safeParse(page);
    if (!filters.success || !parsedPage.success) throw new AppError("Некоректні параметри пошуку.");
    return searchInventory(filters.data, parsedPage.data);
  });
}

export async function getInventoryRecord(selection: RecordSelection) {
  return safeAction("getInventoryRecord", async () => {
    await requireAdmin();
    const parsed = recordSelectionSchema.safeParse(selection);
    if (!parsed.success) throw new AppError("Оберіть коректний запис із результатів пошуку.");
    return readInventoryRecord(parsed.data);
  });
}

export async function askInventoryAssistant(request: AssistantRequest) {
  return safeAction<AssistantReply>("askInventoryAssistant", async () => {
    await requireAdmin();
    const parsed = assistantRequestSchema.safeParse(request);
    if (!parsed.success) throw new AppError("Некоректний запит. Максимум — 12000 символів.");
    const current = parsed.data;
    const selected = current.selected ? await findInventoryRecord(current.selected) : null;
    const unavailableSelection = current.selected && !selected ? current.selected : null;
    const boundSelection = current.clarification?.selected ?? null;
    const boundRecord = sameSelection(boundSelection, current.selected) ? selected : boundSelection ? await findInventoryRecord(boundSelection) : null;
    const missingBoundSelection = boundSelection && !boundRecord ? boundSelection : null;
    const expired = unavailableSelection ?? missingBoundSelection;
    const selectionExpired = expired ? { selection: expired, message: "Попередньо обраний запис більше не існує. Вкажіть назву або оберіть інший запис для дій, що потребують вибору." } : undefined;
    const prepareReply = async (): Promise<AssistantReply> => {
      const plan = await planInventoryRequest(current, selected, unavailableSelection, missingBoundSelection);
      const command = plan.command;
      const continuesClarification = Boolean(current.clarification) && (
        command.kind === "clarify" || command.kind === "clarifyRevision" ? command.continuesPrevious : plan.clarificationMode === "continue"
      );
      if (continuesClarification) validateClarificationSelection(current, missingBoundSelection);
      const record = continuesClarification ? boundRecord : selected;
      const selection = record ? { entity: record.entity, id: record.id } : null;
      const scopedRequest = continuesClarification ? current : { ...current, clarification: null, selected: selection };
      switch (command.kind) {
        case "search":
          return { operation: "search", message: "Результати пошуку за вашим запитом:", results: await searchInventory(command.search) };
        case "viewSelected":
          if (!record) throw new AppError("Спочатку знайдіть та оберіть запис або вкажіть його назву.", expired ? "NOT_FOUND" : "VALIDATION_ERROR");
          return { operation: "viewSelected", message: `Актуальні дані: ${record.title}`, record };
        case "mutation": case "batch":
          return prepareAssistantWrite({ command, selected: selection, assumptions: plan.assumptions, decisions: [] });
        case "revise": {
          if (!current.activeWrite) throw new AppError("Немає активної пропозиції. Надішліть повний запит.");
          let pending = current.activeWrite.pending;
          let revisionApplied = false;
          try {
            for (const field of current.activeWrite.incompleteFields) {
              const completed = command.revision.changes.some(({ operationIndex, change }) => operationIndex === 0 && (
                field === "title" ? change.kind !== "target" && change.patch.title !== null
                  : change.kind === "stuff" && change.patch.stock !== null && change.patch.stock.mode !== "adjust"
              ));
              if (!completed) throw new AppError(field === "title" ? "Вкажіть назву пропозиції, наприклад «Банка 250 мл»." : "Вкажіть початковий залишок пропозиції цілим числом, наприклад 7.");
            }
            pending = revisePendingWrite(pending, command.revision);
            revisionApplied = true;
            return { ...await prepareAssistantWrite(pending), continuesTask: true };
          } catch (error) {
            if (!(error instanceof AppError) && !(error instanceof z.ZodError)) throw error;
            return { operation: "revisionFailed", message: error instanceof AppError ? error.message : "Некоректні значення уточнення. Перевірте кількість, назву та категорію.", code: error instanceof AppError ? error.code : "VALIDATION_ERROR", pending, revisionApplied };
          }
        }
        case "clarifyRevision":
          if (!current.activeWrite) throw new AppError("Немає активної пропозиції для уточнення.");
          return { operation: "clarifyRevision", message: plan.message, clarification: prepareClarification(scopedRequest, plan.message, command.continuesPrevious) };
        case "keepTask":
          if (!current.activeWrite) throw new AppError("Немає активного завдання. Надішліть повний запит.");
          return { operation: "keepTask", message: plan.message };
        case "clarify":
          return { operation: "clarify", message: plan.message, clarification: prepareClarification(scopedRequest, plan.message, command.continuesPrevious) };
        case "unsupported":
          return { operation: "unsupported", message: plan.message };
        default:
          return assertNever(command);
      }
    };
    try {
      return { ...await prepareReply(), ...(selectionExpired ? { selectionExpired } : {}) };
    } catch (error) {
      // Carry confirmed expiry alongside a recoverable failure without discarding
      // the prior task/clarification. Unexpected failures still use safeAction.
      if (!selectionExpired || !(error instanceof AppError)) throw error;
      return { operation: "requestBlocked", message: error.message, code: error.code, selectionExpired };
    }
  });
}

export async function previewInventoryMutation(intent: InventoryMutationIntent, selected: RecordSelection) {
  return safeAction("previewInventoryMutation", async () => {
    await requireAdmin();
    const parsed = inventoryMutationIntentSchema.safeParse(intent);
    const selection = recordSelectionSchema.safeParse(selected);
    if (!parsed.success || !selection.success) throw new AppError("Некоректна операція або вибір запису.");
    const prepared = await prepareInventoryMutation(parsed.data, selection.data, true);
    if (prepared.kind !== "ready") throw new AppError("Оберіть один запис.");
    return prepared.preview;
  });
}

export async function confirmInventoryMutation(preview: InventoryMutationPreview) {
  return safeAction("confirmInventoryMutation", async () => {
    await requireAdmin();
    const parsed = inventoryMutationPreviewSchema.safeParse(preview);
    if (!parsed.success) throw new AppError("Некоректний перегляд. Повторіть запит.");
    return (await applyInventoryBatch({ items: [parsed.data], unchanged: [] })).results[0];
  });
}

export async function confirmInventoryBatch(preview: BatchPreview) {
  return safeAction("confirmInventoryBatch", async () => {
    await requireAdmin();
    const parsed = batchPreviewSchema.safeParse(preview);
    if (!parsed.success) throw new AppError("Некоректний пакет операцій. Повторіть запит.");
    return applyInventoryBatch(parsed.data);
  });
}


export async function resumeInventoryWrite(input: ResumeWrite) {
  return safeAction<AssistantReply>("resumeInventoryWrite", async () => {
    await requireAdmin();
    const parsed = resumeWriteSchema.safeParse(input);
    if (!parsed.success) throw new AppError("Некоректний вибір. Підготуйте новий запит.");
    return { ...await prepareAssistantWrite(parsed.data.pending, parsed.data), continuesTask: true };
  });
}
