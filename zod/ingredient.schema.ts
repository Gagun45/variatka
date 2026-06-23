// src/zod/ingredient.schema.ts
import z from "zod";

export const ingredientSchema = z.object({
  title: z.string().min(1, "Ingredient title is required"),

  description: z.string(),

  isInStock: z.boolean(),

  // Coerces string inputs from HTML select elements into a clean integer for Prisma
  categoryId: z.number().int("Category ID must be an integer."),
});

export const createIngredientCategorySchema = z.object({
  title: z.string().min(1, "Category required"),
});

export const ingredientSchemas = {
  create: ingredientSchema,
  edit: ingredientSchema,
  createCategory: createIngredientCategorySchema,
};

export type IIngredientFormValues = z.infer<typeof ingredientSchema>;

export type ICreateIngredientCategoryDto = z.infer<
  typeof createIngredientCategorySchema
>;
