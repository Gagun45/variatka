"use server";

import { getCurrentUser } from "@/features/user/user.server";
import { AppError } from "../error";
import { IActionResponse, IUser } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";

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
