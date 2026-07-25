import z from "zod";

export const createRecipeVariantSchema = z.object({
  label: z.string().trim().min(1, "Variant label is required"),
  inStock: z.number().int().min(0),
  sortOrder: z.number().int().min(0).default(0),
});

export const recipeVariantStockSchema = z.number().int().min(0);

export type ICreateRecipeVariantDto = z.input<
  typeof createRecipeVariantSchema
>;
