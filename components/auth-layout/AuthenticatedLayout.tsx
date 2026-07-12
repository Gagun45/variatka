"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

const protectedPageDescriptions: Record<string, string> = {
  "/wishlist": "переглянути обране",
  "/orders": "переглянути свої замовлення",
  "/checkout": "продовжити оформлення замовлення",
  "/profile": "переглянути свій профіль",
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
        title="Потрібно увійти"
        description={`Увійдіть, щоб ${pageDescription ?? "переглянути цю сторінку"}.`}
        icon={<LogIn />}
        action={
          <Button onClick={() => signIn("google")}>
            Продовжити через Google
          </Button>
        }
      />
    );
  }

  return children;
}
