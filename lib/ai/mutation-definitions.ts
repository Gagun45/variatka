import type { InventoryMutationIntent } from "@/zod/ai-mutation.schema";

// Client-safe metadata. Adding a command requires an explicit entity/action entry.
export const mutationDefinitions = {
  createIngredient: { entity: "ingredient", action: "create" },
  updateIngredient: { entity: "ingredient", action: "update" },
  deleteIngredient: { entity: "ingredient", action: "delete" },
  createStuff: { entity: "stuff", action: "create" },
  updateStuff: { entity: "stuff", action: "update" },
  deleteStuff: { entity: "stuff", action: "delete" },
} as const satisfies Record<InventoryMutationIntent["kind"], {
  entity: "ingredient" | "stuff";
  action: "create" | "update" | "delete";
}>;

export function assertNever(value: never): never {
  throw new Error(`Unhandled inventory command: ${JSON.stringify(value)}`);
}
