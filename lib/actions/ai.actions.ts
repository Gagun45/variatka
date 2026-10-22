"use server";

import { aiPromptSchema } from "@/zod/ai.schema";
import { generateIngredientDraft } from "../ai/ingredient-draft";
import { AppError } from "../error";
import { safeAction } from "./action.wrapper";
import { requireAdmin } from "./user.actions";

export async function proposeIngredient(prompt: string) {
  return safeAction("proposeIngredient", async () => {
    await requireAdmin();
    const parsed = aiPromptSchema.safeParse(prompt);
    if (!parsed.success) throw new AppError("Введіть запит довжиною від 1 до 2000 символів.");
    return generateIngredientDraft(parsed.data);
  });
}
