"use client";

import Loader from "@/components/loader/Loader";
import { useAuthStore } from "@/zustand/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const isAdmin = useAuthStore((s) => s.isAdmin);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !isAdmin) {
      router.replace("/");
    }
  }, [hydrated, isAdmin, router]);

  if (!hydrated) {
    return <Loader />;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
