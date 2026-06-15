// src/zod/ingredient.schema.ts
import z from "zod";

export const createRecipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  description: z.string(),
  notes: z.string(),
});

export const recipeSchemas = {
  create: createRecipeSchema,
};

export type ICreateRecipeFormValues = z.infer<typeof createRecipeSchema>;
