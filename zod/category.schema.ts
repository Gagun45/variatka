import z from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Category required"),
});

export const categorySchemas = {
  create: createCategorySchema,
};

export type ICreateCategoryFormValues = z.infer<typeof createCategorySchema>;
