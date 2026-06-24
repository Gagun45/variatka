"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { AppError } from "../error";
import { IActionResponse, IUser } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";
import { prisma } from "../prisma";

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
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) throw new AppError("Unauthorized");

  return prisma.user.upsert({
    where: {
      kindeId: kindeUser.id,
    },
    update: {}, // do nothing if exists
    create: {
      kindeId: kindeUser.id,
      email: kindeUser.email ?? null,
      name: kindeUser.given_name ?? "Unknown User",
    },
  });
};
