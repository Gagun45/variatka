"use server";

import { aiPromptSchema } from "@/zod/ai.schema";
import { generateIngredientDraft } from "../ai/ingredient-draft";
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

export async function proposeIngredient(prompt: string) {
  return safeAction("proposeIngredient", async () => {
    await requireAdmin();
    const parsed = aiPromptSchema.safeParse(prompt);
    if (!parsed.success) throw new AppError("Введіть запит довжиною від 1 до 2000 символів.");
    return generateIngredientDraft(parsed.data);
  });
}

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
    if (!parsed.success) throw new AppError("Некоректний запит. Максимум — 2000 символів.");
    const selected = parsed.data.selected ? await readInventoryRecord(parsed.data.selected) : null;
    const plan = await planInventoryRequest(parsed.data, selected);
    if (plan.operation === "search" && plan.search) {
      return { operation: "search", message: "Результати пошуку за вашим запитом:", results: await searchInventory(plan.search) };
    }
    if (plan.operation === "viewSelected") {
      if (!selected) throw new AppError("Спочатку знайдіть та оберіть запис.");
      return { operation: "viewSelected", message: `Актуальні дані: ${selected.title}`, record: selected };
    }
    if (plan.operation === "createIngredient" && plan.ingredient) {
      return { operation: "createIngredient", message: plan.message, draft: {
        operation: "createIngredient", message: plan.message, assumptions: plan.assumptions, ingredient: plan.ingredient,
      } };
    }
    return { operation: "unsupported", message: plan.message };
  });
}
