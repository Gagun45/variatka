import type { RecipeVariant } from "@prisma/client";

import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createRecipeVariant,
  deleteRecipeVariant,
  updateRecipeVariantStock,
} from "@/lib/actions/recipe-variant.actions";
import type { ICreateRecipeVariantDto } from "@/zod/recipe-variant.schema";

export const recipeVariantService = {
  create: (
    recipeId: number,
    dto: ICreateRecipeVariantDto,
  ): Promise<RecipeVariant> =>
    unwrapAction(() => createRecipeVariant(recipeId, dto)),

  delete: (variantId: number): Promise<number> =>
    unwrapAction(() => deleteRecipeVariant(variantId)),

  updateStock: (
    variantId: number,
    inStock: number,
  ): Promise<RecipeVariant> =>
    unwrapAction(() => updateRecipeVariantStock(variantId, inStock)),
};
