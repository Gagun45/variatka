import type { PendingWrite, ResumeWrite } from "@/zod/ai-resolution.schema";
import type { AssistantReply } from "../ai/inventory.types";
import { mutationDefinitions } from "../ai/mutation-definitions";
import { readInventoryRecord } from "./ai-inventory.service";
import { NoChangesError } from "../error";
import { prepareInventoryMutation } from "./ai-mutations.service";
import { completeBatchPreview, prepareInventoryBatch } from "./ai-batch.service";
import { ExistingIngredientSelected, RecordChoiceRequired, WriteResolution } from "./ai-resolution.service";

// One preparation path for initial requests and clicks. Neither path performs writes.
export async function prepareAssistantWrite(pending: PendingWrite, input?: Pick<ResumeWrite, "choice" | "page">): Promise<AssistantReply> {
  const state = new WriteResolution(pending, input);
  try {
    if (pending.command.kind === "batch") {
      const preview = await prepareInventoryBatch(pending.command.intent, pending.selected, state);
      state.validateChoice();
      return { operation: "batch", message: "Перевірте всі операції. Ще нічого не збережено.", preview, assumptions: pending.assumptions, resolved: { ...pending, decisions: state.decisions } };
    }
    const prepared = await prepareInventoryMutation(pending.command.intent, pending.selected, false, false, undefined, { state, index: 0 });
    state.validateChoice();
    if (mutationDefinitions[prepared.preview.kind].entity === "recipe") return { operation: "batch", message: "Перевірте рецепт і пов’язані операції. Ще нічого не збережено.", preview: completeBatchPreview([prepared.preview]), assumptions: pending.assumptions, resolved: { ...pending, decisions: state.decisions } };
    return { operation: "mutation", message: "Перевірте запропоновану операцію. Ще нічого не збережено.", preview: prepared.preview, assumptions: pending.assumptions, resolved: { ...pending, decisions: state.decisions } };
  } catch (error) {
    state.validateChoice();
    if (error instanceof ExistingIngredientSelected) return { operation: "viewSelected", message: error.message, record: await readInventoryRecord(error.selection) };
    if (error instanceof RecordChoiceRequired) return { operation: "chooseRecord", message: error.question.purpose === "ingredientCreation" ? `Для «${error.question.name}» знайдено схожі інгредієнти. Оберіть наявний або явно створіть окремий.` : `Оберіть запис для «${error.question.name}». Решту запиту збережено.`, question: error.question, pending: { ...pending, decisions: state.decisions } };
    if (error instanceof NoChangesError) return { operation: "noChanges", message: error.message };
    throw error;
  }
}
