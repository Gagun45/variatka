import {
  createIngredient,
  createIngredientCategory,
  deleteIngredient,
  editIngredient,
  getIngredient,
  getIngredientCategories,
  getIngredients,
} from "@/lib/actions/ingredient.actions";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import {
  ICreateIngredientCategoryDto,
  IIngredientFormValues,
} from "@/zod/ingredient.schema";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => getIngredients(),
  getOne: (id: number): Promise<IIngredient> => getIngredient(id),
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
};
