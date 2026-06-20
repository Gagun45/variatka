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
): IActionError => {
  return {
    ok: false,
    message,
  };
};

export const UNAUTHORIZED_ACTION_ERROR: IActionError = {
  ok: false,
  message: "Unauthorized",
};
