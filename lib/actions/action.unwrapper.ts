import type { ActionErrorCode } from "../action-error";
import { IActionError, IActionResponse } from "../types";

export const unwrapAction = async <T>(
  action: () => Promise<IActionResponse<T>>,
): Promise<T> => {
  const res = await action();
  if (!res.ok) throw new Error(res.message);
  return res.data;
};

export const ACTION_ERROR = (
  message: string = "Something went wrong",
  code: ActionErrorCode = "INTERNAL_ERROR",
): IActionError => {
  return {
    ok: false,
    message,
    code,
  };
};

export const UNAUTHORIZED_ACTION_ERROR: IActionError = {
  ok: false,
  message: "Unauthorized",
};
