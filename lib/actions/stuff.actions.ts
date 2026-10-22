"use server";

import { ICreateStuffDto } from "@/zod/stuff.schema";

import { AppError } from "../error";
import { prisma } from "../prisma";
import { IStuff } from "../prisma.args";
import { IActionResponse } from "../types";
import { safeAction } from "./action.wrapper";
import { requireAdmin } from "./user.actions";
import { stuffWrites } from "../domain/inventory-write.service";

export const getStuff = async (): Promise<IActionResponse<IStuff[]>> => {
  return safeAction("getStuff", async () => {
    const stuff = await prisma.stuff.findMany();
    return stuff;
  });
};

export const getStuffTitle = async (
  id: number,
): Promise<IActionResponse<string>> => {
  return safeAction("getStuffTitle", async () => {
    await requireAdmin();

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Stuff not found");
    }

    const stuff = await prisma.stuff.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!stuff) throw new AppError("Stuff not found");
    return stuff.title;
  });
};

export const createStuff = async (
  dto: ICreateStuffDto,
): Promise<IActionResponse<IStuff>> => {
  return safeAction("createStuff", async () => {
    await requireAdmin();
    return stuffWrites.create({ ...dto, description: dto.description ?? null });
  });
};

export const editStuff = async (
  id: number,
  dto: ICreateStuffDto,
): Promise<IActionResponse<IStuff>> => {
  return safeAction("editStuff", async () => {
    await requireAdmin();
    return stuffWrites.update(id, dto);
  });
};

export const deleteStuff = async (
  id: number,
): Promise<IActionResponse<number>> => {
  return safeAction("deleteStuff", async () => {
    await requireAdmin();
    return stuffWrites.delete(id);
  });
};
