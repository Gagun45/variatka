import z from "zod";
import { inventoryMutationIntentSchema, inventoryMutationPreviewSchema, ingredientPatchSchema, stuffPatchSchema } from "./ai-mutation.schema";
import { recipePatchSchema } from "./ai-recipe.schema";
import { inventorySearchSchema } from "./inventory-filters.schema";

export const MAX_BATCH_OPERATIONS = 20;
export const batchIntentSchema = z.union([
  z.strictObject({ kind: z.literal("list"), operations: z.array(inventoryMutationIntentSchema).min(1).max(MAX_BATCH_OPERATIONS) }),
  z.strictObject({ kind: z.literal("filter"), search: inventorySearchSchema, change: z.union([
    z.strictObject({ kind: z.literal("updateIngredients"), patch: ingredientPatchSchema }),
    z.strictObject({ kind: z.literal("updateStuff"), patch: stuffPatchSchema }),
    z.strictObject({ kind: z.literal("updateRecipes"), patch: recipePatchSchema }),
    z.strictObject({ kind: z.literal("deleteIngredients") }),
    z.strictObject({ kind: z.literal("deleteStuff") }),
    z.strictObject({ kind: z.literal("deleteRecipes") }),
  ]) }),
]);
export const batchPreviewSchema = z.strictObject({ items: z.array(inventoryMutationPreviewSchema).min(1).max(MAX_BATCH_OPERATIONS), unchanged: z.array(z.string().max(200)).max(MAX_BATCH_OPERATIONS) });
export type BatchIntent = z.infer<typeof batchIntentSchema>;
export type BatchPreview = z.infer<typeof batchPreviewSchema>;
