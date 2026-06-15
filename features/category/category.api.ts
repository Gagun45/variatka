import { createCategory, getCategories } from "@/lib/actions";
import { ICategory } from "@/lib/prisma.args";
import { ICreateCategoryFormValues } from "@/zod/category.schema";

export const categoryService = {
  get: (): Promise<ICategory[]> => getCategories(),
  create: async (dto: ICreateCategoryFormValues): Promise<ICategory> =>
    createCategory(dto),
};
