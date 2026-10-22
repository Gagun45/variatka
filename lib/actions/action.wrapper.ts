import z from "zod";
import { unstable_rethrow } from "next/navigation";

import { AppError, NoChangesError } from "../error";
import { IActionResponse, IActionSuccess } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";

export const ACTION_OK = <T>(data: T): IActionSuccess<T> => ({
  ok: true,
  data,
});

export const safeAction = async <T>(
  name: string,
  action: () => Promise<T>,
): Promise<IActionResponse<T>> => {
  try {
    return ACTION_OK(await action());
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof NoChangesError) return ACTION_ERROR(e.message, e.code);
    console.error(`Error in ${name}:`, e);

    if (e instanceof z.ZodError) return ACTION_ERROR("Некоректні значення. Перевірте запит і підготуйте новий перегляд.", "VALIDATION_ERROR");

    if (e instanceof AppError) {
      return ACTION_ERROR(e.message, e.code);
    }

    return ACTION_ERROR();
  }
};
