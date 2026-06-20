// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  return withAuth(req);
}

export const config = {
  matcher: [
    "/ingredients/:id/edit",
    "/recipes/:id/edit",
    "/ingredients/saved",
    "/recipes/saved",
    "/stuff/:path*",
    "/admin/:path*",
  ],
};
