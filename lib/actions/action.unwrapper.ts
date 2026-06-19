import { IActionError, IActionResponse } from "../types";

export const unwrapAction = async <T>(
  action: () => Promise<IActionResponse<T>>,
): Promise<T> => {
  const res = await action();
  if (!res.ok) throw new Error(res.message);
  return res.data;
};

export const DEFAULT_ACTION_ERROR: IActionError = {
  ok: false,
  message: "Something went wrong",
};

export const UNAUTHORIZED_ACTION_ERROR: IActionError = {
  ok: false,
  message: "Unauthorized",
};
