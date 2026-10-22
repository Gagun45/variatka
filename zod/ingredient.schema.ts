// src/zod/ingredient.schema.ts
import { INGREDIENT_CATEGORIES } from "@/lib/enumslist/ingredient.constants";
import z from "zod";

export const ingredientSchema = z.object({
  title: z.string().trim().min(1, "Ingredient title is required").max(200),

  description: z.string().max(10000),

  isInStock: z.boolean(),

  category: z.enum(INGREDIENT_CATEGORIES),
});

export const ingredientSchemas = {
  create: ingredientSchema,
  edit: ingredientSchema,
};

export type IIngredientFormValues = z.infer<typeof ingredientSchema>;
