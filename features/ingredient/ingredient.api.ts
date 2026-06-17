import {
  createIngredient,
  createIngredientCategory,
  deleteIngredient,
  editIngredient,
  getIngredientCategories,
  getIngredients,
  removeIngredientImage,
  toggleMyIngredient,
  uploadIngredientImage,
} from "@/lib/actions/ingredient.actions";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import {
  ICreateIngredientCategoryDto,
  IIngredientFormValues,
} from "@/zod/ingredient.schema";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => getIngredients(),
  create: (dto: IIngredientFormValues): Promise<IIngredient> =>
    createIngredient(dto),
  getCategories: (): Promise<IIngredientCategory[]> =>
    getIngredientCategories(),
  createCategory: (
    dto: ICreateIngredientCategoryDto,
  ): Promise<IIngredientCategory> => createIngredientCategory(dto),
  edit: (id: number, dto: IIngredientFormValues): Promise<IIngredient> =>
    editIngredient(id, dto),
  delete: (id: number) => deleteIngredient(id),
  toggle: (id: number, add: boolean) => toggleMyIngredient(id, add),
  uploadImage: (ingredientId: number, file: File) =>
    uploadIngredientImage(ingredientId, file),
  removeImage: (ingredientId: number) => removeIngredientImage(ingredientId),
};
