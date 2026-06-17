"use client";

import { Button } from "@/components/ui/button";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogIn, LogOut } from "lucide-react";

export default function SidebarAuthIcon() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Button asChild variant={"secondary"}>
        <LoginLink>
          <LogIn />
        </LoginLink>
      </Button>
    );
  }

  return (
    <Button asChild variant={"outline"}>
      <LogoutLink>
        <LogOut />
      </LogoutLink>
    </Button>
  );
}
