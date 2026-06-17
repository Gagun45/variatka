import {
  createRecipe,
  createRecipeCategory,
  deleteRecipe,
  getRecipeCategories,
  getRecipes,
  updateRecipeFields,
  updateRecipeIngredients,
} from "@/lib/actions/recipe.actions";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { ICreateRecipeDto, IRecipeIngredient } from "@/lib/types";
import { ICreateRecipeCategoryDto, IRecipeDto } from "@/zod/recipe.schema";

export const recipeService = {
  get: (): Promise<IRecipe[]> => getRecipes(),
  create: (dto: ICreateRecipeDto): Promise<IRecipe> => createRecipe(dto),
  getCategories: (): Promise<IRecipeCategory[]> => getRecipeCategories(),
  createCategory: (dto: ICreateRecipeCategoryDto): Promise<IRecipeCategory> =>
    createRecipeCategory(dto),

  updateFields: (id: number, dto: IRecipeDto) => updateRecipeFields(id, dto),
  updateIngredients: (
    id: number,
    items: IRecipeIngredient[],
  ): Promise<IRecipe> => updateRecipeIngredients(id, items),
  delete: (id: number): Promise<void> => deleteRecipe(id),
};
