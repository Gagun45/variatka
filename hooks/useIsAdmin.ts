import { KINDE_ROLES } from "@/lib/constants/kinde";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export const useAuth = () => {
  const { isAuthenticated, getPermission } = useKindeBrowserClient();
  const hasPermission = getPermission(KINDE_ROLES.admin)?.isGranted ?? false;
  const isAdmin = !!isAuthenticated && hasPermission;
  return { isAdmin };
};
