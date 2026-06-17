"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { KINDE_ROLES } from "@/lib/constants/kinde";
import Loader from "@/components/loader/Loader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { getPermission, isLoading } = useKindeBrowserClient();

  const isAdmin = getPermission(KINDE_ROLES.admin)?.isGranted;

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAdmin) {
    return null; //
  }

  return <>{children}</>;
}
