import { unwrapAction } from "@/lib/actions/action.unwrapper";
import { getMe } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/types";

export const userService = {
  me: (): Promise<IUser> => unwrapAction(() => getMe()),
};
