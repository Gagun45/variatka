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
import { readInventoryRecord, searchInventory } from "../domain/ai-inventory.service";
import { planInventoryRequest } from "../ai/inventory-assistant";
import type { AssistantReply } from "../ai/inventory.types";
import { prepareClarification, validateClarificationSelection } from "../ai/clarification";
import { assertNever } from "../ai/mutation-definitions";
import { inventoryMutationIntentSchema, inventoryMutationPreviewSchema, type InventoryMutationIntent, type InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { prepareInventoryMutation } from "../domain/ai-mutations.service";
import { applyInventoryBatch } from "../domain/ai-batch.service";
import { batchPreviewSchema, type BatchPreview } from "@/zod/ai-batch.schema";
import { prepareAssistantWrite } from "../domain/ai-write-workflow.service";
import { resumeWriteSchema, type ResumeWrite } from "@/zod/ai-resolution.schema";

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
    validateClarificationSelection(parsed.data);
    const selected = parsed.data.selected ? await readInventoryRecord(parsed.data.selected) : null;
    const plan = await planInventoryRequest(parsed.data, selected);
    const command = plan.command;
    switch (command.kind) {
      case "search":
        return { operation: "search", message: "Результати пошуку за вашим запитом:", results: await searchInventory(command.search) };
      case "viewSelected":
        if (!selected) throw new AppError("Спочатку знайдіть та оберіть запис.");
        return { operation: "viewSelected", message: `Актуальні дані: ${selected.title}`, record: selected };
      case "mutation": case "batch":
        return prepareAssistantWrite({ command, selected: parsed.data.selected, assumptions: plan.assumptions, decisions: [] });
      case "clarify":
        return { operation: "clarify", message: plan.message, clarification: prepareClarification(parsed.data, plan.message, command.continuesPrevious) };
      case "unsupported":
        return { operation: "unsupported", message: plan.message };
      default:
        return assertNever(command);
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
    return prepareAssistantWrite(parsed.data.pending, parsed.data);
  });
}
