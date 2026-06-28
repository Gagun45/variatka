import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createIngredient,
  deleteIngredient,
  editIngredient,
  getIngredients,
  removeIngredientImage,
  toggleIngredientInStockValue,
  toggleSavedIngredient,
  uploadIngredientImage,
} from "@/lib/actions/ingredient.actions";
import { IIngredient } from "@/lib/prisma.args";
import { IIngredientFormValues } from "@/zod/ingredient.schema";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => unwrapAction(() => getIngredients()),
  create: (dto: IIngredientFormValues): Promise<IIngredient> =>
    unwrapAction(() => createIngredient(dto)),

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
};
