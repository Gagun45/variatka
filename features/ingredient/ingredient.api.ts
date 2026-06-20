import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createIngredient,
  createIngredientCategory,
  deleteIngredient,
  deleteIngredientCategory,
  editIngredient,
  editIngredientCategory,
  getIngredientCategories,
  getIngredients,
  removeIngredientImage,
  toggleIngredientInStockValue,
  toggleSavedIngredient,
  uploadIngredientImage,
} from "@/lib/actions/ingredient.actions";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import {
  ICreateIngredientCategoryDto,
  IIngredientFormValues,
} from "@/zod/ingredient.schema";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => unwrapAction(() => getIngredients()),
  create: (dto: IIngredientFormValues): Promise<IIngredient> =>
    unwrapAction(() => createIngredient(dto)),
  getCategories: (): Promise<IIngredientCategory[]> =>
    unwrapAction(() => getIngredientCategories()),
  createCategory: (
    dto: ICreateIngredientCategoryDto,
  ): Promise<IIngredientCategory> =>
    unwrapAction(() => createIngredientCategory(dto)),
  edit: (id: number, dto: IIngredientFormValues): Promise<IIngredient> =>
    unwrapAction(() => editIngredient(id, dto)),
  delete: (id: number): Promise<number> =>
    unwrapAction(() => deleteIngredient(id)),
  toggleSaved: (id: number, add: boolean): Promise<IIngredient> =>
    unwrapAction(() => toggleSavedIngredient(id, add)),
  toggleStock: (id: number, isInStock: boolean): Promise<IIngredient> =>
    unwrapAction(() => toggleIngredientInStockValue(id, isInStock)),
  uploadImage: (ingredientId: number, file: File): Promise<IIngredient> =>
    unwrapAction(() => uploadIngredientImage(ingredientId, file)),
  removeImage: (ingredientId: number): Promise<IIngredient> =>
    unwrapAction(() => removeIngredientImage(ingredientId)),
  deleteCategory: (id: number): Promise<number> =>
    unwrapAction(() => deleteIngredientCategory(id)),
  editCategory: (
    id: number,
    dto: ICreateIngredientCategoryDto,
  ): Promise<IIngredientCategory> =>
    unwrapAction(() => editIngredientCategory(id, dto)),
};
