import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ім’я має містити щонайменше 2 символи.")
    .max(100, "Ім’я має містити не більше 100 символів."),

  orderName: z
    .string()
    .trim()
    .max(100, "Ім’я отримувача має містити не більше 100 символів.")
    .optional(),

  orderPhone: z
    .string()
    .trim()
    .max(30, "Номер телефону надто довгий.")
    .optional(),
});

export const userSchemas = {
  updateProfile: updateUserProfileSchema,
};

export type IUpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
