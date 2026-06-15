import { createIngredient, getIngredients } from "@/lib/actions";
import { IIngredient } from "@/lib/prisma.args";
import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => getIngredients(),
  create: (dto: ICreateIngredientFormValues): Promise<IIngredient> =>
    createIngredient(dto),
};
