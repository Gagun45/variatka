import { readCollection } from "@/lib/data/client";
import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createStuff,
  deleteStuff,
  editStuff,
} from "@/lib/actions/stuff.actions";
import { IStuff } from "@/lib/prisma.args";
import { ICreateStuffDto } from "@/zod/stuff.schema";

export const stuffService = {
  get: (): Promise<IStuff[]> => readCollection("stuff"),
  create: (dto: ICreateStuffDto): Promise<IStuff> =>
    unwrapAction(() => createStuff(dto)),
  edit: (id: number, dto: ICreateStuffDto): Promise<IStuff> =>
    unwrapAction(() => editStuff(id, dto)),
  delete: (id: number): Promise<number> => unwrapAction(() => deleteStuff(id)),
};
