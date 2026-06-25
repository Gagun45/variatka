"use client";

import Loader from "@/components/loader/Loader";
import { useAuth } from "@/hooks/useAuth";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(frontendUrls.index);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
