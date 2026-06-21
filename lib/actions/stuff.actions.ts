"use server";

import { ICreateStuffCategoryDto, ICreateStuffDto } from "@/zod/stuff.schema";
import { userIsAdmin } from "../auth";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { IStuff, IStuffCategory, stuffArgs } from "../prisma.args";
import { IActionResponse } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";
import { Prisma } from "@prisma/client";

export const createStuffCategory = async (
  dto: ICreateStuffCategoryDto,
): Promise<IActionResponse<IStuffCategory>> => {
  try {
    await userIsAdmin();
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new AppError("A category with this title already exists.");

    const newCategory = await prisma.stuffCategory.create({ data: dto });

    return {
      data: newCategory,
      ok: true,
    };
  } catch (e) {
    console.error("Error in createStuffCategory:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const getStuffCategories = async (): Promise<
  IActionResponse<IStuffCategory[]>
> => {
  try {
    const categories = await prisma.stuffCategory.findMany();
    return {
      ok: true,
      data: categories,
    };
  } catch (e) {
    console.error("Error in getStuffCategories:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const getStuff = async (): Promise<IActionResponse<IStuff[]>> => {
  try {
    const stuff = await prisma.stuff.findMany(stuffArgs);
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
    await userIsAdmin();
    const { stuffCategoryId, title } = dto;
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { id: stuffCategoryId },
    });
    if (!existingCategory) throw new AppError("Category not found");

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
    await userIsAdmin();
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
    await userIsAdmin();
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

export const editStuffCategory = async (
  id: number,
  dto: ICreateStuffCategoryDto,
): Promise<IActionResponse<IStuffCategory>> => {
  try {
    await userIsAdmin();

    const updatedCategory = await prisma.stuffCategory.update({
      where: { id },
      data: dto,
    });
    return {
      ok: true,
      data: updatedCategory,
    };
  } catch (e) {
    console.error("Error in editStuffCategory:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return ACTION_ERROR("Category not found");
      }
      if (e.code === "P2002") {
        return ACTION_ERROR("Category with the same title already exists");
      }
    }
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const deleteStuffCategory = async (
  id: number,
): Promise<IActionResponse<number>> => {
  try {
    await userIsAdmin();
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            stuff: true,
          },
        },
      },
    });
    if (!existingCategory) throw new AppError("Category not found");
    const totalItems = existingCategory._count.stuff;
    if (totalItems > 0)
      throw new AppError(
        `Cannot delete category because it contains ${totalItems} stuff`,
      );
    await prisma.stuffCategory.delete({
      where: { id },
    });
    return {
      ok: true,
      data: id,
    };
  } catch (e) {
    console.error("Error in deleteStuffCategory:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return ACTION_ERROR("Category not found");
      }
      if (e.code === "P2003") {
        return ACTION_ERROR("Cannot delete category because it is in use");
      }
    }
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};
