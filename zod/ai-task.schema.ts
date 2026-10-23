import z from "zod";
import { pendingWriteSchema } from "./ai-resolution.schema";
import { ingredientPatchSchema, stuffPatchSchema, inventoryTitleInputSchema } from "./ai-mutation.schema";
import { compositionChangeSchema, recipePatchSchema } from "./ai-recipe.schema";

// No source requests, chat history or old snapshots: task context cannot nest.
export const activeWriteSchema = z.strictObject({
  pending: pendingWriteSchema,
  phase: z.enum(["draft", "choice", "clarification"]),
  incompleteFields: z.array(z.enum(["title", "stock"])).max(2).default([]),
});

// A null stock mode keeps the task's existing set/adjust meaning. Changing only
// the number must not silently turn an adjustment into an absolute stock level.
const stuffRevisionPatch = stuffPatchSchema.extend({
  stock: z.strictObject({
    mode: z.enum(["set", "adjust"]).nullable(),
    value: z.number().int().min(-2_147_483_647).max(2_147_483_647),
  }).nullable(),
});
export const writeRevisionSchema = z.strictObject({
  changes: z.array(z.strictObject({
    operationIndex: z.number().int().min(0).max(19),
    change: z.union([
      z.strictObject({ kind: z.literal("ingredient"), patch: ingredientPatchSchema }),
      z.strictObject({ kind: z.literal("stuff"), patch: stuffRevisionPatch }),
      z.strictObject({ kind: z.literal("recipe"), patch: recipePatchSchema, composition: compositionChangeSchema.nullable() }),
      z.strictObject({ kind: z.literal("target"), targetName: inventoryTitleInputSchema }),
    ]),
  })).min(1).max(20),
});

export type ActiveWrite = z.infer<typeof activeWriteSchema>;
export type WriteRevision = z.infer<typeof writeRevisionSchema>;
