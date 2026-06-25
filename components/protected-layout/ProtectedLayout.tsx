"use client";

import Loader from "@/components/loader/Loader";
import { useAuth } from "@/hooks/useAuth";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, status } = useAuth();
  const isLoading = status === "loading";
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace(frontendUrls.index);
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}
