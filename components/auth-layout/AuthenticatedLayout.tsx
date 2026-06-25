"use client";

import Loader from "@/components/loader/Loader";
import { useAuth } from "@/hooks/useAuth";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && status === "unauthenticated") {
      router.replace(frontendUrls.public.login);
    }
  }, [status, router, isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return children;
}
