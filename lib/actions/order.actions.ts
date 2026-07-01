"use server";

import { AppError } from "../error";
import { prisma } from "../prisma";
import { IOrder, orderArgs } from "../prisma.args";
import { IActionResponse } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";
import { getCurrentUser } from "./user.actions";

export const getOrders = async (): Promise<IActionResponse<IOrder[]>> => {
  try {
    const user = await getCurrentUser();
    const orders = await prisma.order.findMany({
      where: {
        userId: user.pid,
      },
      ...orderArgs,
    });
    return {
      ok: true,
      data: orders,
    };
  } catch (e) {
    console.error("Error in getOrders:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};
