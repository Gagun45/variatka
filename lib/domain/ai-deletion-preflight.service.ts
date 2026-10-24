import type { Prisma } from "@prisma/client";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { AppError } from "../error";
import { prisma } from "../prisma";

export class DeletionBlocked extends AppError {
  constructor(message: string) { super(message, "CONFLICT"); }
}

const summarize = (values: string[]) => values.slice(0, 3).join("; ") + (values.length > 3 ? `; ще ${values.length - 3}` : "");
export const recipeOrderBlocker = (title: string, count: number) => `рецепт «${title}» використовується в замовленнях (позицій: ${count})`;

// Read-only final-state validation. Call after resolving/normalizing the whole
// proposal, and again inside the confirmation transaction before any writes.
export async function validateBatchDeletions(items: InventoryMutationPreview[], db: Prisma.TransactionClient = prisma): Promise<void> {
  const ingredients = items.filter((item) => item.kind === "deleteIngredient");
  const recipes = items.filter((item) => item.kind === "deleteRecipe");
  if (!ingredients.length && !recipes.length) return;
  const blockers: string[] = [];
  if (ingredients.length) {
    const deletedIds = new Set(ingredients.map((item) => item.target.id));
    const deletedRecipes = new Set(recipes.map((item) => item.target.id));
    const updates = new Map(items.filter((item) => item.kind === "updateRecipe").map((item) => [item.target.id, item.after]));
    const remaining = new Map(ingredients.map((item) => [item.target.id, new Map<string, string>()]));
    const references = await db.recipeIngredient.findMany({
      where: { ingredientId: { in: [...deletedIds] } },
      select: { ingredientId: true, recipeId: true, recipe: { select: { title: true } } },
      orderBy: [{ recipeId: "asc" }, { ingredientId: "asc" }],
    });
    for (const reference of references) {
      if (deletedRecipes.has(reference.recipeId)) continue;
      const after = updates.get(reference.recipeId);
      if (after && !after.ingredients.some((ingredient) => ingredient.id === reference.ingredientId)) continue;
      remaining.get(reference.ingredientId)!.set(`id:${reference.recipeId}`, after?.fields.title ?? reference.recipe.title);
    }
    // Proposed additions/creations also count, even when no stored reference exists.
    for (const [index, item] of items.entries()) {
      if (item.kind !== "createRecipe" && item.kind !== "updateRecipe") continue;
      for (const ingredient of item.after.ingredients) {
        if (ingredient.id === null || !deletedIds.has(ingredient.id)) continue;
        const identity = item.kind === "updateRecipe" ? `id:${item.target.id}` : `new:${index}`;
        remaining.get(ingredient.id)!.set(identity, item.after.fields.title);
      }
    }
    for (const ingredient of ingredients) {
      const references = remaining.get(ingredient.target.id)!;
      if (references.size) blockers.push(`інгредієнт «${ingredient.target.title}» використовується в рецептах (${references.size}): ${summarize([...references.values()].map((title) => `«${title}»`))}`);
    }
  }
  if (recipes.length) {
    const current = await db.recipe.findMany({
      where: { id: { in: recipes.map((item) => item.target.id) } },
      select: { title: true, _count: { select: { orderItems: true } } },
      orderBy: { id: "asc" },
    });
    for (const recipe of current) if (recipe._count.orderItems) blockers.push(recipeOrderBlocker(recipe.title, recipe._count.orderItems));
  }
  if (blockers.length) throw new DeletionBlocked(`Неможливо видалити: ${summarize(blockers)}. Змініть запит; пов’язані записи не буде змінено автоматично.`);
}
