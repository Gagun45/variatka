"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

import { LogIn, LogOut, User } from "lucide-react";

import { useAuthStore } from "@/zustand/auth.store";
import { useMe } from "@/features/user/hooks/useMe";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { userKeys } from "@/features/user/user.keys";

export default function SidebarUserMenu() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const queryClient = useQueryClient();

  const { data: me } = useMe();

  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: userKeys.me });

    window.location.href = "/api/auth/logout";
  };

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Button asChild>
        <LoginLink>
          <LogIn />
          Login
        </LoginLink>
      </Button>
    );
  }

  if (!me) {
    return <Skeleton className="h-9 w-28" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User />
          {me.name}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{me.name}</span>
            {me.email && (
              <span className="text-muted-foreground text-xs">{me.email}</span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
