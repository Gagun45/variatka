// src/zod/ingredient.schema.ts
import { RECIPE_SERIES } from "@/lib/enumslist/series.constants";
import { RECIPE_CATEGORIES } from "@/lib/enumslist/recipe.constants";
import z from "zod";

export const recipeSchema = z.object({
  title: z.string().trim().min(1, "Recipe title is required").max(200),
  description: z.string().max(10000),
  notes: z.string().max(10000),
  confirmationNotes: z.string().optional(),
  isConfirmed: z.boolean(),
  isHidden: z.boolean(),
  spicy: z.number().int().min(0).max(4),
  series: z.enum(RECIPE_SERIES),
  category: z.enum(RECIPE_CATEGORIES),
});

export const recipeSchemas = {
  create: recipeSchema,
};

export type IRecipeDto = z.infer<typeof recipeSchema>;
