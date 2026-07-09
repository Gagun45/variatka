"use server";

import { ICreateStuffDto } from "@/zod/stuff.schema";

import { AppError } from "../error";
import { prisma } from "../prisma";
import { IStuff, stuffArgs } from "../prisma.args";
import { IActionResponse } from "../types";
import { safeAction } from "./action.wrapper";
import { requireAdmin } from "./user.actions";

export const getStuff = async (): Promise<IActionResponse<IStuff[]>> => {
  return safeAction("getStuff", async () => {
    const stuff = await prisma.stuff.findMany();
    return stuff;
  });
};

export const createStuff = async (
  dto: ICreateStuffDto,
): Promise<IActionResponse<IStuff>> => {
  return safeAction("createStuff", async () => {
    await requireAdmin();
    const { title } = dto;

    const existingStuff = await prisma.stuff.findUnique({
      where: { title },
    });
    if (existingStuff)
      throw new AppError("A stuff with this title already exists");

    const newStuff = await prisma.stuff.create({
      data: dto,
      ...stuffArgs,
    });
    return newStuff;
  });
};

export const editStuff = async (
  id: number,
  dto: ICreateStuffDto,
): Promise<IActionResponse<IStuff>> => {
  return safeAction("editStuff", async () => {
    await requireAdmin();
    const existingStuff = await prisma.stuff.findFirst({
      where: {
        title: dto.title,
        NOT: {
          id,
        },
      },
    });
    if (existingStuff)
      throw new AppError("A stuff with this title already exists.");

    const updatedStuff = await prisma.stuff.update({
      where: { id },
      data: dto,
      ...stuffArgs,
    });
    return updatedStuff;
  });
};

export const deleteStuff = async (
  id: number,
): Promise<IActionResponse<number>> => {
  return safeAction("deleteStuff", async () => {
    await requireAdmin();
    const existingStuff = await prisma.stuff.findUnique({
      where: { id },
    });
    if (!existingStuff) throw new AppError("Stuff not found");

    await prisma.stuff.delete({
      where: { id },
    });
    return id;
  });
};
