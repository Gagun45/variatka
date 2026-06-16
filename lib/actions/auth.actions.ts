// app/login/actions.ts
"use server";

import { cookies } from "next/headers";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function login(password: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (password !== process.env.APP_PASSWORD) {
    return {
      success: false,
      message: "Invalid password",
    };
  }

  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set("variauth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true, message: "Success" };
}
