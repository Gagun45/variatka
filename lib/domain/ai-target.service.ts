import type { InventoryMutationIntent } from "@/zod/ai-mutation.schema";
import type { RecordSelection } from "@/zod/ai-search.schema";
import { mutationDefinitions } from "../ai/mutation-definitions";
import { AppError } from "../error";
import { WriteResolution, type OperationResolution } from "./ai-resolution.service";

export async function resolveMutationTarget(intent: Exclude<InventoryMutationIntent, { kind: "createIngredient" | "createStuff" | "createRecipe" }>, selected: RecordSelection | null, explicitlyChosen: boolean, resolution: OperationResolution = { state: new WriteResolution({ decisions: [] }), index: 0 }) {
  const entity = mutationDefinitions[intent.kind].entity;
  if (intent.targetName !== null && !explicitlyChosen) {
    const record = await resolution.state.inventory(entity, intent.targetName, `${resolution.index}:target`, `Операція ${resolution.index + 1}: запис для зміни`);
    return { kind: "selected" as const, selection: { entity, id: record!.id } };
  }
  if (!selected || selected.entity !== entity) throw new AppError("Спочатку оберіть запис потрібного типу або вкажіть його назву.");
  return { kind: "selected" as const, selection: selected };
}
