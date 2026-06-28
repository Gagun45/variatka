// src/zod/ingredient.schema.ts
import { RECIPE_SERIES } from "@/lib/enumslist/series.constants";
import { RECIPE_CATEGORIES } from "@/lib/enumslist/recipe.constants";
import z from "zod";

export const recipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  description: z.string(),
  notes: z.string(),
  inStock: z.number().min(0),
  confirmationNotes: z.string().optional(),
  isConfirmed: z.boolean(),
  spicy: z.number().min(0).max(4),
  series: z.enum(RECIPE_SERIES),
  category: z.enum(RECIPE_CATEGORIES),
});

export const recipeSchemas = {
  create: recipeSchema,
};

export type IRecipeDto = z.infer<typeof recipeSchema>;
