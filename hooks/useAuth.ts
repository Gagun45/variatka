import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status, update } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isAdmin = session?.user.role === "ADMIN";

  return {
    session,
    user: session?.user,
    status,
    isAuthenticated,
    isAdmin,
    isLoading,
    update,
  };
};
