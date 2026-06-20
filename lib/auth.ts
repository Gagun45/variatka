import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KINDE_ROLES } from "./constants/kinde";
import { AppError } from "./error";

export const userIsAdmin = async (): Promise<void> => {
  const { getPermission } = getKindeServerSession();

  const permission = await getPermission(KINDE_ROLES.admin);

  const isAdmin = permission?.isGranted ?? false;
  if (isAdmin) throw new AppError("Unauthorized");
};
