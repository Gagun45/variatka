import z from "zod";
import { aiPromptSchema } from "./ai.schema";
import { batchIntentSchema } from "./ai-batch.schema";
import { inventoryMutationIntentSchema } from "./ai-mutation.schema";

import { inventorySearchSchema } from "./inventory-filters.schema";
export { ingredientSearchSchema, recipeSearchSchema, stuffSearchSchema, inventorySearchSchema } from "./inventory-filters.schema";
export const recordSelectionSchema = z.strictObject({
  entity: z.enum(["ingredient", "recipe", "stuff"]),
  id: z.number().int().positive().max(2_147_483_647),
});

export const searchPageSchema = z.number().int().min(0).max(1000);

export const MAX_CLARIFICATION_TURNS = 4;
const questionSchema = z.string().trim().min(1).max(1000);
export const clarificationSchema = z.strictObject({
  originalPrompt: aiPromptSchema,
  turns: z.array(z.strictObject({ question: questionSchema, answer: aiPromptSchema })).max(MAX_CLARIFICATION_TURNS),
  question: questionSchema,
  selected: recordSelectionSchema.nullable(),
  previousSearch: inventorySearchSchema.nullable(),
});

export const assistantRequestSchema = z.strictObject({
  prompt: aiPromptSchema,
  selected: recordSelectionSchema.nullable(),
  previousSearch: inventorySearchSchema.nullable(),
  clarification: clarificationSchema.nullable(),
});

// A command carries exactly the fields its handler needs; incompatible payloads cannot coexist.
export const assistantPlanSchema = z.strictObject({
  message: questionSchema,
  assumptions: z.array(z.string().max(300)).max(10),
  command: z.union([
    z.strictObject({ kind: z.literal("search"), search: inventorySearchSchema }),
    z.strictObject({ kind: z.literal("viewSelected") }),
    z.strictObject({ kind: z.literal("mutation"), intent: inventoryMutationIntentSchema }),
    z.strictObject({ kind: z.literal("batch"), intent: batchIntentSchema }),
    z.strictObject({ kind: z.literal("clarify"), continuesPrevious: z.boolean() }),
    z.strictObject({ kind: z.literal("unsupported") }),
  ]),
});

export type InventorySearch = z.infer<typeof inventorySearchSchema>;
export type RecordSelection = z.infer<typeof recordSelectionSchema>;
export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
export type AssistantPlan = z.infer<typeof assistantPlanSchema>;
export type Clarification = z.infer<typeof clarificationSchema>;
