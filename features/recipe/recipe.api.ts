import {
  createRecipe,
  createRecipeCategory,
  getRecipe,
  getRecipeCategories,
  getRecipes,
  getRecipesByIngredientId,
} from "@/lib/actions/recipe.actions";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { ICreateRecipeDto } from "@/lib/types";
import { ICreateRecipeCategoryDto } from "@/zod/recipe.schema";

export const recipeService = {
  get: (): Promise<IRecipe[]> => getRecipes(),
  create: (dto: ICreateRecipeDto): Promise<IRecipe> => createRecipe(dto),
  getCategories: (): Promise<IRecipeCategory[]> => getRecipeCategories(),
  createCategory: (dto: ICreateRecipeCategoryDto): Promise<IRecipeCategory> =>
    createRecipeCategory(dto),
  getRecipesByIngredientId: (ingredientId: number): Promise<IRecipe[]> =>
    getRecipesByIngredientId(ingredientId),
  getRecipe: (id: number): Promise<IRecipe> => getRecipe(id),
};
