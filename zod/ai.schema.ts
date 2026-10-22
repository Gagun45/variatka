import z from "zod";
import { ingredientSchema } from "./ingredient.schema";

export const aiPromptSchema = z.string().trim().min(1).max(2000);

// This is a draft, never an instruction to execute database operations.
export const ingredientDraftSchema = z.strictObject({
  operation: z.enum(["createIngredient", "unsupported"]),
  message: z.string().max(1000),
  assumptions: z.array(z.string().max(300)).max(10),
  ingredient: ingredientSchema.extend({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(2000),
  }).nullable(),
});

export type IngredientDraft = z.infer<typeof ingredientDraftSchema>;
