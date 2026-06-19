import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createStuff,
  createStuffCategory,
  editStuff,
  getStuff,
  getStuffCategories,
} from "@/lib/actions/stuff.actions";
import { IStuff, IStuffCategory } from "@/lib/prisma.args";
import { ICreateStuffCategoryDto, ICreateStuffDto } from "@/zod/stuff.schema";

export const stuffService = {
  get: (): Promise<IStuff[]> => unwrapAction(() => getStuff()),
  getCategories: (): Promise<IStuffCategory[]> =>
    unwrapAction(() => getStuffCategories()),
  createCategory: (dto: ICreateStuffCategoryDto): Promise<IStuffCategory> =>
    unwrapAction(() => createStuffCategory(dto)),
  create: (dto: ICreateStuffDto): Promise<IStuff> =>
    unwrapAction(() => createStuff(dto)),
  edit: (id: number, dto: ICreateStuffDto): Promise<IStuff> =>
    unwrapAction(() => editStuff(id, dto)),
};
