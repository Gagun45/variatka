import { getIngredients } from "@/lib/actions";
import { IIngredient } from "@/lib/prisma.args";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => getIngredients(),
};
