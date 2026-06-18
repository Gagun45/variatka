"use server";

import { ICreateStuffCategoryDto, ICreateStuffDto } from "@/zod/stuff.schema";
import { requireAdmin } from "../auth";
import { prisma } from "../prisma";
import { IStuff, IStuffCategory, stuffArgs } from "../prisma.args";

export const createStuffCategory = async (dto: ICreateStuffCategoryDto) => {
  await requireAdmin();
  try {
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new Error("A category with this title already exists.");
    const newCategory = await prisma.stuffCategory.create({ data: dto });

    return newCategory;
  } catch (e) {
    console.error("Database error in createStuffCategory:", e);
    throw new Error("Something went wrong");
  }
};

export const getStuffCategories = async (): Promise<IStuffCategory[]> => {
  const categories = await prisma.stuffCategory.findMany();
  return categories;
};

export const getStuff = async (): Promise<IStuff[]> => {
  const stuff = await prisma.stuff.findMany(stuffArgs);
  return stuff;
};

export const createStuff = async (dto: ICreateStuffDto): Promise<IStuff> => {
  await requireAdmin();
  const { stuffCategoryId, title } = dto;
  try {
    const existingCategory = await prisma.stuffCategory.findUnique({
      where: { id: stuffCategoryId },
    });
    if (!existingCategory)
      throw new Error(`A category #${stuffCategoryId} not found`);

    const existingStuff = await prisma.stuff.findUnique({
      where: { title },
    });
    if (existingStuff)
      throw new Error("A stuff with this title already exists.");

    const newStuff = await prisma.stuff.create({
      data: dto,
      ...stuffArgs,
    });
    return newStuff;
  } catch (e) {
    console.error("Database error in createStuff:", e);
    throw new Error("Something went wrong");
  }
};
