import {
  createIngredient,
  createIngredientCategory,
  editIngredient,
  getIngredient,
  getIngredientCategories,
  getIngredients,
} from "@/lib/actions/ingredient.actions";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import {
  ICreateIngredientCategoryDto,
  ICreateIngredientFormValues,
} from "@/zod/ingredient.schema";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => getIngredients(),
  getOne: (id: number): Promise<IIngredient> => getIngredient(id),
  create: (dto: ICreateIngredientFormValues): Promise<IIngredient> =>
    createIngredient(dto),
  getCategories: (): Promise<IIngredientCategory[]> =>
    getIngredientCategories(),
  createCategory: (
    dto: ICreateIngredientCategoryDto,
  ): Promise<IIngredientCategory> => createIngredientCategory(dto),
  edit: (id: number, dto: ICreateIngredientFormValues): Promise<IIngredient> =>
    editIngredient(id, dto),
};
