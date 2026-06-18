import {
  createStuff,
  createStuffCategory,
  getStuff,
  getStuffCategories,
} from "@/lib/actions/stuff.actions";
import { IStuff, IStuffCategory } from "@/lib/prisma.args";
import { ICreateStuffCategoryDto, ICreateStuffDto } from "@/zod/stuff.schema";

export const stuffService = {
  get: (): Promise<IStuff[]> => getStuff(),
  getCategories: (): Promise<IStuffCategory[]> => getStuffCategories(),
  createCategory: (dto: ICreateStuffCategoryDto): Promise<IStuffCategory> =>
    createStuffCategory(dto),
  create: (dto: ICreateStuffDto): Promise<IStuff> => createStuff(dto),
};
