"use server";

import { AppError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { IUser } from "@/lib/types";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

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
