import { unwrapAction } from "@/lib/actions/action.unwrapper";
import { updateUserProfile } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/types";
import { IUpdateUserProfileDto } from "@/zod/user.schema";

export const userService = {
  updateProfile: (dto: IUpdateUserProfileDto): Promise<IUser> =>
    unwrapAction(() => updateUserProfile(dto)),
};
