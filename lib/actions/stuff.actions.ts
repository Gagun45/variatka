"use server";

import { ICreateStuffCategoryDto, ICreateStuffDto } from "@/zod/stuff.schema";
import { requireAdmin } from "../auth";
import { prisma } from "../prisma";
import { IStuff, IStuffCategory, stuffArgs } from "../prisma.args";
import { AppError } from "../error";
import { IActionResponse } from "../types";
import {
  DEFAULT_ACTION_ERROR,
  UNAUTHORIZED_ACTION_ERROR,
} from "./action.unwrapper";

export const createStuffCategory = async (
  dto: ICreateStuffCategoryDto,
): Promise<IActionResponse<IStuffCategory>> => {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return UNAUTHORIZED_ACTION_ERROR;
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      return {
        ok: false,
        message: "A category with this title already exists.",
      };

    const newCategory = await prisma.stuffCategory.create({ data: dto });

    return {
      data: newCategory,
      ok: true,
    };
  } catch (e) {
    console.error("Error in createStuffCategory:", e);
    return DEFAULT_ACTION_ERROR;
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
    return DEFAULT_ACTION_ERROR;
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
    return DEFAULT_ACTION_ERROR;
  }
};

export const createStuff = async (
  dto: ICreateStuffDto,
): Promise<IActionResponse<IStuff>> => {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return UNAUTHORIZED_ACTION_ERROR;
    const { stuffCategoryId, title } = dto;
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { id: stuffCategoryId },
    });
    if (!existingCategory)
      return {
        ok: false,
        message: `A category #${stuffCategoryId} not found`,
      };

    const existingStuff = await prisma.stuff.findUnique({
      where: { title },
    });
    if (existingStuff)
      return {
        ok: false,
        message: "A stuff with this title already exists",
      };

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
    return DEFAULT_ACTION_ERROR;
  }
};
