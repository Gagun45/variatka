"use server";

import { ICreateStuffDto } from "@/zod/stuff.schema";

import { AppError } from "../error";
import { prisma } from "../prisma";
import { IStuff, stuffArgs } from "../prisma.args";
import { IActionResponse } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";
import { requireAdmin } from "./user.actions";

export const getStuff = async (): Promise<IActionResponse<IStuff[]>> => {
  try {
    const stuff = await prisma.stuff.findMany();
    return {
      ok: true,
      data: stuff,
    };
  } catch (e) {
    console.error("Error in getStuff:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const createStuff = async (
  dto: ICreateStuffDto,
): Promise<IActionResponse<IStuff>> => {
  try {
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
    return {
      ok: true,
      data: newStuff,
    };
  } catch (e) {
    console.error("Error in createStuff:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const editStuff = async (
  id: number,
  dto: ICreateStuffDto,
): Promise<IActionResponse<IStuff>> => {
  try {
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
    return {
      ok: true,
      data: updatedStuff,
    };
  } catch (e) {
    console.error("Error in editStuff:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const deleteStuff = async (
  id: number,
): Promise<IActionResponse<number>> => {
  try {
    await requireAdmin();
    const existingStuff = await prisma.stuff.findUnique({
      where: { id },
    });
    if (!existingStuff) throw new AppError("Stuff not found");

    await prisma.stuff.delete({
      where: { id },
    });
    return {
      ok: true,
      data: id,
    };
  } catch (e) {
    console.error("Error in deleteStuff:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};
