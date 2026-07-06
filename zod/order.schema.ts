import { z } from "zod";

export const createOrderSchema = z.object({
  customerEmail: z.email("Invalid email address").trim(),

  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  customerPhone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .or(z.literal("")),

  customerComment: z
    .string()
    .trim()
    .max(1000, "Comment is too long")
    .optional()
    .or(z.literal("")),
});

export const orderSchemas = {
  createOrder: createOrderSchema,
};

export type ICreateOrderFormValues = z.infer<typeof createOrderSchema>;
