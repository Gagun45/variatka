import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createRecipe,
  deleteRecipe,
  getPublicRecipes,
  getRecipe,
  getRecipes,
  getWishlistIds,
  removeRecipeImage,
  toggleConfirmedRecipe,
  toggleHiddenRecipe,
  toggleSavedRecipe,
  toggleWishlist,
  updateRecipeFields,
  updateRecipe,
  updateRecipeIngredients,
  uploadRecipeImage,
} from "@/lib/actions/recipe.actions";
import { IRecipe } from "@/lib/prisma.args";
import {
  ICreateRecipeDto,
  IPublicRecipe,
  IRecipeIngredient,
} from "@/lib/types";
import { IRecipeDto } from "@/zod/recipe.schema";

export const recipeService = {
  get: (): Promise<IRecipe[]> => unwrapAction(() => getRecipes()),
  getOne: (id: number): Promise<IRecipe> => unwrapAction(() => getRecipe(id)),
  create: (dto: ICreateRecipeDto): Promise<IRecipe> =>
    unwrapAction(() => createRecipe(dto)),

  toggle: (id: number): Promise<IRecipe> =>
    unwrapAction(() => toggleSavedRecipe(id)),
  uploadImage: (ingredientId: number, file: File): Promise<IRecipe> =>
    unwrapAction(() => uploadRecipeImage(ingredientId, file)),
  removeImage: (ingredientId: number): Promise<IRecipe> =>
    unwrapAction(() => removeRecipeImage(ingredientId)),

  updateFields: (id: number, dto: IRecipeDto): Promise<IRecipe> =>
    unwrapAction(() => updateRecipeFields(id, dto)),
  update: (
    id: number,
    dto: IRecipeDto,
    items: IRecipeIngredient[],
  ): Promise<IRecipe> => unwrapAction(() => updateRecipe(id, dto, items)),
  updateIngredients: (
    id: number,
    items: IRecipeIngredient[],
  ): Promise<IRecipe> => unwrapAction(() => updateRecipeIngredients(id, items)),
  delete: (id: number): Promise<number> => unwrapAction(() => deleteRecipe(id)),

  toggleConfirmed: (id: number): Promise<IRecipe> =>
    unwrapAction(() => toggleConfirmedRecipe(id)),
  toggleHidden: (id: number): Promise<IRecipe> =>
    unwrapAction(() => toggleHiddenRecipe(id)),
  getPublicRecipes: (): Promise<IPublicRecipe[]> =>
    unwrapAction(() => getPublicRecipes()),
  getWishlistIds: (): Promise<number[]> => unwrapAction(() => getWishlistIds()),
  toggleWishlist: (recipeId: number): Promise<boolean> =>
    unwrapAction(() => toggleWishlist(recipeId)),
};
