// src/zod/ingredient.schema.ts
import z from "zod";

export const createRecipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  description: z.string(),
  notes: z.string(),
  categoryId: z.number().int("Category ID must be an integer."),
});

export const createRecipeCategorySchema = z.object({
  title: z.string().min(1, "Category required"),
});

export const recipeSchemas = {
  create: createRecipeSchema,
  createCategory: createRecipeCategorySchema,
};

export type ICreateRecipeFormValues = z.infer<typeof createRecipeSchema>;
export type ICreateRecipeCategoryDto = z.infer<
  typeof createRecipeCategorySchema
>;
