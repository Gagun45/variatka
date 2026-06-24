import { useQuery } from "@tanstack/react-query";
import { userKeys } from "../user.keys";
import { userService } from "../user.service";
import { useAuthStore } from "@/zustand/auth.store";

export const useMe = () => {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const enabled = hydrated && isAuthenticated;

  return useQuery({
    queryKey: userKeys.me,
    queryFn: userService.me,
    enabled,
  });
};
