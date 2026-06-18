import z from "zod";

export const createStuffCategorySchema = z.object({
  title: z.string().min(1, "Category required"),
});

export const stuffSchema = z.object({
  title: z.string().min(1, "Stuff title is required"),

  description: z.string().optional(),

  inStock: z.number().min(0),

  stuffCategoryId: z.number().int("Category ID must be an integer."),
});

export const stuffSchemas = {
  createCategory: createStuffCategorySchema,
  create: stuffSchema,
};

export type ICreateStuffCategoryDto = z.infer<typeof createStuffCategorySchema>;
export type ICreateStuffDto = z.infer<typeof stuffSchema>;
