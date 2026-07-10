import { auth } from "@/lib/auth";
import { frontendUrls } from "@/lib/urls";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect(frontendUrls.index);
  }

  return children;
}
