import {
  createIngredient,
  createIngredientCategory,
  getIngredientCategories,
  getIngredients,
} from "@/lib/actions";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import {
  ICreateIngredientCategoryDto,
  ICreateIngredientFormValues,
} from "@/zod/ingredient.schema";

export const ingredientService = {
  get: (): Promise<IIngredient[]> => getIngredients(),
  create: (dto: ICreateIngredientFormValues): Promise<IIngredient> =>
    createIngredient(dto),
  getCategories: (): Promise<IIngredientCategory[]> =>
    getIngredientCategories(),
  createCategory: (
    dto: ICreateIngredientCategoryDto,
  ): Promise<IIngredientCategory> => createIngredientCategory(dto),
};
