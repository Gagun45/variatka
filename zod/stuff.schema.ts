import { STUFF_CATEGORIES } from "@/lib/enumslist/stuff.constants";
import z from "zod";

export const stuffSchema = z.object({
  title: z.string().trim().min(1, "Stuff title is required").max(200),

  description: z.string().max(10000).optional(),

  inStock: z.number().int().min(0).max(2147483647),

  category: z.enum(STUFF_CATEGORIES),
});

export const stuffSchemas = {
  create: stuffSchema,
};

export type ICreateStuffDto = z.infer<typeof stuffSchema>;
