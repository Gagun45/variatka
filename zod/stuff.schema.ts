import { STUFF_CATEGORIES } from "@/lib/enumslist/stuff.constants";
import z from "zod";

export const stuffSchema = z.object({
  title: z.string().min(1, "Stuff title is required"),

  description: z.string().optional(),

  inStock: z.number().min(0),

  category: z.enum(STUFF_CATEGORIES),
});

export const stuffSchemas = {
  create: stuffSchema,
};

export type ICreateStuffDto = z.infer<typeof stuffSchema>;
