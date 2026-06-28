// src/zod/ingredient.schema.ts
import { INGREDIENT_CATEGORIES } from "@/lib/enumslist/ingredient.constants";
import z from "zod";

export const ingredientSchema = z.object({
  title: z.string().min(1, "Ingredient title is required"),

  description: z.string(),

  isInStock: z.boolean(),

  categoryNew: z.enum(INGREDIENT_CATEGORIES),
});

export const ingredientSchemas = {
  create: ingredientSchema,
  edit: ingredientSchema,
};

export type IIngredientFormValues = z.infer<typeof ingredientSchema>;
