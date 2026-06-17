"use client";

import { Button } from "@/components/ui/button";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { LogIn, LogOut } from "lucide-react";
import { useAuthStore } from "@/zustand/auth.store";

export default function SidebarAuthIcon() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hydrated) return null;

  if (!isAuthenticated) {
    return (
      <Button asChild variant="secondary">
        <LoginLink>
          <LogIn />
        </LoginLink>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline">
      <LogoutLink>
        <LogOut />
      </LogoutLink>
    </Button>
  );
}
