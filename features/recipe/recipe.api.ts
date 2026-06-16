import {
  createRecipe,
  createRecipeCategory,
  getRecipeCategories,
  getRecipes,
  updateRecipeFields,
} from "@/lib/actions/recipe.actions";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { ICreateRecipeDto } from "@/lib/types";
import { ICreateRecipeCategoryDto, IRecipeDto } from "@/zod/recipe.schema";

export const recipeService = {
  get: (): Promise<IRecipe[]> => getRecipes(),
  create: (dto: ICreateRecipeDto): Promise<IRecipe> => createRecipe(dto),
  getCategories: (): Promise<IRecipeCategory[]> => getRecipeCategories(),
  createCategory: (dto: ICreateRecipeCategoryDto): Promise<IRecipeCategory> =>
    createRecipeCategory(dto),

  updateFields: (id: number, dto: IRecipeDto) => updateRecipeFields(id, dto),
};
