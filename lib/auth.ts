import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KINDE_ROLES } from "./constants/kinde";

export const isAdmin = async () => {
  const { getPermission } = getKindeServerSession();

  const permission = await getPermission(KINDE_ROLES.admin);

  return permission?.isGranted ?? false;
};

export const requireAdmin = async () => {
  const admin = await isAdmin();
  if (!admin) throw new Error("Forbidden");
};
