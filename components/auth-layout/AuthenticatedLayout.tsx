"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

const protectedPageDescriptions: Record<string, string> = {
  "/wishlist": "view your wishlist",
  "/orders": "view your orders",
  "/checkout": "continue to checkout",
  "/profile": "view your profile",
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return <Loader />;
  }

  if (status === "unauthenticated") {
    const pageDescription = protectedPageDescriptions[pathname];

    return (
      <StateScreen
        title="Sign in required"
        description={`Please sign in to ${pageDescription ?? "access this page"}.`}
        icon={<LogIn />}
        action={
          <Button onClick={() => signIn("google")}>
            Continue with Google
          </Button>
        }
      />
    );
  }

  return children;
}
