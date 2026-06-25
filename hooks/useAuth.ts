import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user.role === "ADMIN";

  return {
    session,
    user: session?.user,
    status,
    isAuthenticated,
    isAdmin,
  };
};
