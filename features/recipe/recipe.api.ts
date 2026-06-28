import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createRecipe,
  deleteRecipe,
  getAdminWishlists,
  getPublicRecipes,
  getRecipe,
  getRecipes,
  getWishlist,
  removeRecipeImage,
  toggleConfirmedRecipe,
  toggleSavedRecipe,
  toggleWishlist,
  updateRecipeFields,
  updateRecipeIngredients,
  uploadRecipeImage,
} from "@/lib/actions/recipe.actions";
import { IRecipe, IUserWithWishlist } from "@/lib/prisma.args";
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
  updateIngredients: (
    id: number,
    items: IRecipeIngredient[],
  ): Promise<IRecipe> => unwrapAction(() => updateRecipeIngredients(id, items)),
  delete: (id: number): Promise<number> => unwrapAction(() => deleteRecipe(id)),

  toggleConfirmed: (id: number): Promise<IRecipe> =>
    unwrapAction(() => toggleConfirmedRecipe(id)),
  getPublicRecipes: (): Promise<IPublicRecipe[]> =>
    unwrapAction(() => getPublicRecipes()),
  getWishlist: (): Promise<IPublicRecipe[]> =>
    unwrapAction(() => getWishlist()),
  toggleWishlist: (recipeId: number): Promise<boolean> =>
    unwrapAction(() => toggleWishlist(recipeId)),
  getAdminWishlists: (): Promise<IUserWithWishlist[]> =>
    unwrapAction(() => getAdminWishlists()),
};
