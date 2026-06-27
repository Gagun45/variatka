// src/zod/ingredient.schema.ts
import { RECIPE_SERIES } from "@/lib/constants";
import z from "zod";

export const recipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  description: z.string(),
  notes: z.string(),
  inStock: z.number().min(0),
  recipeCategoryId: z.number().int("Category ID must be an integer."),
  confirmationNotes: z.string().optional(),
  isConfirmed: z.boolean(),
  spicy: z.number().min(0).max(4),
  series: z.enum(RECIPE_SERIES),
});

export const createRecipeCategorySchema = z.object({
  title: z.string().min(1, "Category required"),
});

export const recipeSchemas = {
  create: recipeSchema,
  createCategory: createRecipeCategorySchema,
};

export type IRecipeDto = z.infer<typeof recipeSchema>;
export type ICreateRecipeCategoryDto = z.infer<
  typeof createRecipeCategorySchema
>;
