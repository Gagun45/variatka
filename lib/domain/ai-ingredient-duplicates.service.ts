import type { Prisma } from "@prisma/client";
import { nameMatchScore } from "../ai/name-resolution";
import { prisma } from "../prisma";
import { AppError } from "../error";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";

// Use the same title matcher as search and recipe ingredient resolution.
// Suggestions never imply equivalence or override existing ingredient fields.
export async function similarIngredients(title: string, db: Prisma.TransactionClient = prisma) {
  const matches = [];
  for (let page = 0; ; page++) {
    const rows = await db.ingredient.findMany({ where: {}, select: { id: true, title: true, category: true, updatedAt: true }, orderBy: [{ title: "asc" }, { id: "asc" }], skip: page * 250, take: 250 });
    for (const row of rows) {
      const score = nameMatchScore(title, row.title);
      if (score !== null) matches.push({ ...row, score });
    }
    if (rows.length < 250) break;
  }
  return matches.sort((a, b) => a.score - b.score || a.title.localeCompare(b.title, "uk") || a.id - b.id);
}

export async function validateIngredientDuplicateReview(preview: Extract<InventoryMutationPreview, { kind: "createIngredient" }>, db: Prisma.TransactionClient) {
  const matches = await similarIngredients(preview.after.title, db);
  if (!matches.length) return;
  const reviewed = preview.duplicateReview;
  if (reviewed?.title === preview.after.title && matches.every((row) => reviewed.candidates.some((item) => item.id === row.id && item.title === row.title))) return;
  throw new AppError(`Для «${preview.after.title}» знайдено схожі інгредієнти: ${matches.slice(0, 5).map((row) => `«${row.title}»`).join(", ")}. Надішліть запит із цією назвою ще раз, щоб обрати наявний або явно створити окремий інгредієнт. Нічого не збережено.`, "CONFLICT");
}
