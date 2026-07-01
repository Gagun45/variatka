"use server";

import { IUpdateUserProfileDto } from "@/zod/user.schema";
import { auth } from "../auth";
import { AppError } from "../error";
import { IActionResponse, IUser } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";
import { prisma } from "../prisma";
import { userPrenseter } from "@/presenters/user.presenter";

export const getMe = async (): Promise<IActionResponse<IUser>> => {
  try {
    const user = await getCurrentUser();
    return {
      ok: true,
      data: user,
    };
  } catch (e) {
    console.log("Get user error: ", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const getCurrentUser = async (): Promise<IUser> => {
  const session = await auth();

  if (!session?.user) throw new AppError("Unauthorized");
  const { user } = session;

  return {
    email: user.email,
    pid: user.pid,
    name: user.name,
    role: user.role,
    orderName: user.orderName,
    orderPhone: user.orderPhone,
  };
};

export const requireAdmin = async (): Promise<IUser> => {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") throw new AppError("Forbidden");
  return user;
};

export const updateUserProfile = async (
  dto: IUpdateUserProfileDto,
): Promise<IActionResponse<IUser>> => {
  try {
    const user = await getCurrentUser();
    const updatedUser = await prisma.user.update({
      where: {
        id: user.pid,
      },
      data: dto,
    });
    const publicUser = userPrenseter.toPublic(updatedUser);
    return {
      ok: true,
      data: publicUser,
    };
  } catch (e) {
    console.log("updateUserProfile error: ", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};
