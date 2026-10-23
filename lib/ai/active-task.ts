import type { AssistantRequest, Clarification, RecordSelection } from "@/zod/ai-search.schema";
import type { PendingWrite } from "@/zod/ai-resolution.schema";
import { inventoryTitleInputSchema, stuffWriteSchema, type InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import type { AssistantReply, InventoryRecord } from "./inventory.types";
import type { DraftStatus } from "./request-state";
import { sameSelection } from "./clarification";
import { mutationDefinitions } from "./mutation-definitions";

export type TaskSource = { request: AssistantRequest; selected: InventoryRecord | null };
export type ActiveTask = {
  pending: PendingWrite;
  source: TaskSource;
  status: DraftStatus;
  clarification: Clarification | null;
  view:
    | { kind: "mutation"; preview: InventoryMutationPreview }
    | { kind: "batch"; preview: BatchPreview }
    | { kind: "choice"; reply: Extract<AssistantReply, { operation: "chooseRecord" }> };
};

export function taskUsesSelection(task: ActiveTask, selection: RecordSelection): boolean {
  if (task.pending.targets?.some((target) => sameSelection(target, selection))) return true;
  if (task.pending.decisions.some((decision) => "selection" in decision && sameSelection(decision.selection, selection))) return true;
  const command = task.pending.command;
  const operations = command.kind === "mutation" ? [command.intent] : command.intent.kind === "list" ? command.intent.operations : [];
  if (sameSelection(task.pending.selected, selection) && operations.some((intent) => "targetName" in intent && intent.targetName === null && mutationDefinitions[intent.kind].entity === selection.entity)) return true;
  const previews = task.view.kind === "mutation" ? [task.view.preview] : task.view.kind === "batch" ? task.view.preview.items : [];
  return previews.some((preview) => {
    if ("target" in preview && preview.target.id === selection.id && mutationDefinitions[preview.kind].entity === selection.entity) return true;
    return selection.entity === "ingredient" && (preview.kind === "createRecipe" || preview.kind === "updateRecipe") && preview.after.ingredients.some((ingredient) => ingredient.id === selection.id);
  });
}

export function editTaskCreation(task: ActiveTask, preview: InventoryMutationPreview): ActiveTask {
  if (preview.kind !== "createIngredient" && preview.kind !== "createStuff") return task;
  const original = task.pending.command;
  if (original.kind !== "mutation" || (original.intent.kind !== "createIngredient" && original.intent.kind !== "createStuff")) return task;
  // Preserve raw incomplete inputs in the view. Task context keeps valid base
  // values plus explicit missing-field flags, so independent requests still parse.
  const title = inventoryTitleInputSchema.safeParse(preview.after.title).success ? preview.after.title : original.intent.data.title;
  const sameTitle = original.intent.data.title === title;
  const intent = preview.kind === "createIngredient"
    ? { kind: preview.kind, data: { ...preview.after, title } }
    : { kind: preview.kind, data: { ...preview.after, title, inStock: stuffWriteSchema.shape.inStock.safeParse(preview.after.inStock).success ? preview.after.inStock : original.intent.kind === "createStuff" ? original.intent.data.inStock : 0 } };
  return {
    ...task, view: { kind: "mutation", preview },
    pending: { ...task.pending, command: { kind: "mutation", intent }, decisions: sameTitle ? task.pending.decisions : [] },
  };
}

export function incompleteTaskFields(task: ActiveTask): ("title" | "stock")[] {
  if (task.view.kind !== "mutation") return [];
  const preview = task.view.preview;
  if (preview.kind !== "createIngredient" && preview.kind !== "createStuff") return [];
  return [
    ...(!inventoryTitleInputSchema.safeParse(preview.after.title).success ? ["title" as const] : []),
    ...(preview.kind === "createStuff" && !stuffWriteSchema.shape.inStock.safeParse(preview.after.inStock).success ? ["stock" as const] : []),
  ];
}

export function activeTaskLabel(task: ActiveTask) {
  if (task.status === "uncertain") return "Результат збереження потребує перевірки";
  if (task.clarification) return "Уточнюємо зміни до пропозиції";
  if (task.view.kind === "choice") return "Оберіть запис для поточного завдання";
  if (task.status !== "ready") return "Пропозиція потребує нового перегляду";
  return "Пропозиція очікує підтвердження";
}

export function activeTaskTargets(task: ActiveTask) {
  const command = task.pending.command;
  if (command.kind === "batch" && command.intent.kind === "filter") return `Пакет за фільтрами · записів: ${task.pending.targets?.length ?? "перелік уточнюється"}`;
  const operations = command.kind === "mutation" ? [command.intent] : command.intent.kind === "list" ? command.intent.operations : [];
  const names = operations.map((intent, index) => {
    if ("data" in intent) return intent.data.title;
    const resolved = task.pending.decisions.find((decision) => decision.key === `${index}:target`);
    return resolved?.title ?? intent.targetName ?? task.source.selected?.title ?? "Обраний запис";
  });
  return names.slice(0, 3).join(" · ") + (names.length > 3 ? ` · ще ${names.length - 3}` : "");
}
