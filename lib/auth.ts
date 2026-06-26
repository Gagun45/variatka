import NextAuth, { DefaultSession } from "next-auth";
import "next-auth/jwt";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      pid: number;
      role: "USER" | "ADMIN";
    } & {
      name: string;
      email: string;
    } & DefaultSession["user"];
  }
  interface User {
    pid: number;
    role: "USER" | "ADMIN";
    name: string;
    email: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const existingUser = await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name ?? "Unknown user",
          },
        });
      }
      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const dbUser = await prisma.user.findUnique({
        where: {
          email: token.email,
        },
      });
      if (dbUser) {
        token.role = dbUser.role;
        token.userPid = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.pid = token.userPid;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
});
