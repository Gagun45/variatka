import { useAuth } from "@/hooks/useAuth";
import { IUser } from "@/lib/types";
import { IUpdateUserProfileDto } from "@/zod/user.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService } from "../user.api";

export const useUpdateProfile = () => {
  const { update } = useAuth();
  const mutation = useMutation<IUser, Error, IUpdateUserProfileDto>({
    mutationFn: userService.updateProfile,
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: async () => {
      await update();
      toast.success("Profile updated");
    },
  });
  return mutation;
};
