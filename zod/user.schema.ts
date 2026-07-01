import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),

  orderName: z
    .string()
    .trim()
    .max(100, "Order name must be at most 100 characters.")
    .optional(),

  orderPhone: z.string().trim().max(30, "Phone number is too long.").optional(),
});

export const userSchemas = {
  updateProfile: updateUserProfileSchema,
};

export type IUpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
