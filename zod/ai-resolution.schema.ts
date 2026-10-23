import z from "zod";
import { inventoryMutationIntentSchema, inventoryIdSchema } from "./ai-mutation.schema";
import { batchIntentSchema } from "./ai-batch.schema";

const selection = z.strictObject({ entity: z.enum(["ingredient", "recipe", "stuff"]), id: inventoryIdSchema });
const key = z.string().min(1).max(100);
const existingChoice = z.strictObject({ key, selection });
const createChoice = z.strictObject({ key, createNew: z.literal(true) });
const decision = z.union([
  existingChoice.extend({ title: z.string().min(1).max(200) }),
  createChoice.extend({ title: z.string().min(1).max(200), candidates: z.array(z.strictObject({ id: inventoryIdSchema, title: z.string().min(1).max(200) })).max(10000) }),
]);
export const writeCommandSchema = z.union([
  z.strictObject({ kind: z.literal("mutation"), intent: inventoryMutationIntentSchema }),
  z.strictObject({ kind: z.literal("batch"), intent: batchIntentSchema }),
]);
export const pendingWriteSchema = z.strictObject({
  command: writeCommandSchema,
  selected: selection.nullable(),
  assumptions: z.array(z.string().max(300)).max(10),
  decisions: z.array(decision).max(1020),
  // A filtered draft keeps the entire resolved cohort, including unchanged rows.
  targets: z.array(selection).min(1).max(20).optional(),
});
export const resumeWriteSchema = z.strictObject({
  pending: pendingWriteSchema,
  choice: z.union([existingChoice, createChoice]).nullable(),
  page: z.strictObject({ key, number: z.number().int().min(0).max(1000) }).nullable(),
});
export type PendingWrite = z.infer<typeof pendingWriteSchema>;
export type ResumeWrite = z.infer<typeof resumeWriteSchema>;
