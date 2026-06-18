"use server";

import { ICreateStuffCategoryDto, ICreateStuffDto } from "@/zod/stuff.schema";
import { requireAdmin } from "../auth";
import { prisma } from "../prisma";
import { IStuff, IStuffCategory, stuffArgs } from "../prisma.args";
import { AppError } from "../error";

export const createStuffCategory = async (dto: ICreateStuffCategoryDto) => {
  try {
    await requireAdmin();
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new AppError("A category with this title already exists.");
    const newCategory = await prisma.stuffCategory.create({ data: dto });

    return newCategory;
  } catch (e) {
    console.error("Database error in createStuffCategory:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const getStuffCategories = async (): Promise<IStuffCategory[]> => {
  try {
    return prisma.stuffCategory.findMany();
  } catch (e) {
    console.error("Database error in getStuffCategories:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const getStuff = async (): Promise<IStuff[]> => {
  try {
    return prisma.stuff.findMany(stuffArgs);
  } catch (e) {
    console.error("Database error in getStuff:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const createStuff = async (dto: ICreateStuffDto): Promise<IStuff> => {
  try {
    await requireAdmin();
    const { stuffCategoryId, title } = dto;
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { id: stuffCategoryId },
    });
    if (!existingCategory)
      throw new AppError(`A category #${stuffCategoryId} not found`);

    const existingStuff = await prisma.stuff.findUnique({
      where: { title },
    });
    if (existingStuff)
      throw new AppError("A stuff with this title already exists.");

    const newStuff = await prisma.stuff.create({
      data: dto,
      ...stuffArgs,
    });
    return newStuff;
  } catch (e) {
    console.error("Database error in createStuff:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};
