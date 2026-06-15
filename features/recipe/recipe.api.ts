import { createRecipe, getRecipes } from "@/lib/actions";
import { IRecipe } from "@/lib/prisma.args";
import { ICreateRecipeDto } from "@/lib/types";

export const recipeService = {
  get: (): Promise<IRecipe[]> => getRecipes(),
  create: (dto: ICreateRecipeDto): Promise<IRecipe> => createRecipe(dto),
};
