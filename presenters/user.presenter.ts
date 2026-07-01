import { IUser } from "@/lib/types";
import { User } from "@prisma/client";

export const userPrenseter = {
  toPublic: (user: User): IUser => {
    return {
      email: user.email,
      pid: user.id,
      name: user.name,
      role: user.role,
      orderName: user.orderName,
      orderPhone: user.orderPhone,
    };
  },
};
