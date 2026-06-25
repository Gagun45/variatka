// auth.d.ts

import "next-auth/jwt";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: number;
//       role: "USER" | "ADMIN";
//     } & Omit<DefaultSession["user"], "id">;
//   }
// }

declare module "next-auth/jwt" {
  interface JWT {
    userPid: number;
    role: "USER" | "ADMIN";
    name: string;
    email: string;
  }
}
