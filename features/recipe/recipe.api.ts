import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createRecipe,
  createRecipeCategory,
  deleteRecipe,
  deleteRecipeCategory,
  editRecipeCategory,
  getRecipeCategories,
  getRecipes,
  removeRecipeImage,
  toggleConfirmedRecipe,
  toggleSavedRecipe,
  updateRecipeFields,
  updateRecipeIngredients,
  uploadRecipeImage,
} from "@/lib/actions/recipe.actions";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { ICreateRecipeDto, IRecipeIngredient } from "@/lib/types";
import { ICreateRecipeCategoryDto, IRecipeDto } from "@/zod/recipe.schema";

export const recipeService = {
  get: (): Promise<IRecipe[]> => unwrapAction(() => getRecipes()),
  create: (dto: ICreateRecipeDto): Promise<IRecipe> =>
    unwrapAction(() => createRecipe(dto)),
  getCategories: (): Promise<IRecipeCategory[]> =>
    unwrapAction(() => getRecipeCategories()),
  createCategory: (dto: ICreateRecipeCategoryDto): Promise<IRecipeCategory> =>
    unwrapAction(() => createRecipeCategory(dto)),
  toggle: (id: number, add: boolean): Promise<IRecipe> =>
    unwrapAction(() => toggleSavedRecipe(id, add)),
  uploadImage: (ingredientId: number, file: File): Promise<IRecipe> =>
    unwrapAction(() => uploadRecipeImage(ingredientId, file)),
  removeImage: (ingredientId: number): Promise<IRecipe> =>
    unwrapAction(() => removeRecipeImage(ingredientId)),

  updateFields: (id: number, dto: IRecipeDto): Promise<IRecipe> =>
    unwrapAction(() => updateRecipeFields(id, dto)),
  updateIngredients: (
    id: number,
    items: IRecipeIngredient[],
  ): Promise<IRecipe> => unwrapAction(() => updateRecipeIngredients(id, items)),
  delete: (id: number): Promise<number> => unwrapAction(() => deleteRecipe(id)),
  deleteCategory: (id: number): Promise<number> =>
    unwrapAction(() => deleteRecipeCategory(id)),
  editCategory: (
    id: number,
    dto: ICreateRecipeCategoryDto,
  ): Promise<IRecipeCategory> =>
    unwrapAction(() => editRecipeCategory(id, dto)),
  toggleConfirmed: (id: number, isConfirmed: boolean): Promise<IRecipe> =>
    unwrapAction(() => toggleConfirmedRecipe(id, !isConfirmed)),
};
