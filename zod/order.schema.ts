import { z } from "zod";

export const createOrderSchema = z.object({
  customerEmail: z.email("Введіть коректну адресу електронної пошти").trim(),

  customerName: z
    .string()
    .trim()
    .min(2, "Ім’я має містити щонайменше 2 символи")
    .max(100, "Ім’я надто довге"),

  customerPhone: z
    .string()
    .trim()
    .max(30, "Номер телефону надто довгий")
    .optional()
    .or(z.literal("")),

  customerComment: z
    .string()
    .trim()
    .max(1000, "Коментар надто довгий")
    .optional()
    .or(z.literal("")),
});

export const orderSchemas = {
  createOrder: createOrderSchema,
};

export type ICreateOrderFormValues = z.infer<typeof createOrderSchema>;
