// src/zod/ingredient.schema.ts
import z from "zod";

export const createIngredientSchema = z.object({
  title: z.string().min(1, "Ingredient title is required"),

  description: z.string().optional(),

  isInStock: z.boolean(),

  // Coerces string inputs from HTML select elements into a clean integer for Prisma
  categoryId: z.number().int("Category ID must be an integer."),
});

export const ingredientSchemas = {
  create: createIngredientSchema,
};

export type ICreateIngredientFormValues = z.infer<
  typeof createIngredientSchema
>;
