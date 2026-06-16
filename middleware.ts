import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { frontendUrls } from "./lib/urls";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isLoginPage = pathname === frontendUrls.auth;

  const token = req.cookies.get("variauth")?.value;

  if (!token) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL(frontendUrls.auth, req.url));
    }

    return NextResponse.next();
  }

  try {
    await jwtVerify(token, secret);

    if (isLoginPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    const response = isLoginPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL(frontendUrls.auth, req.url));

    response.cookies.delete("variauth");

    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
