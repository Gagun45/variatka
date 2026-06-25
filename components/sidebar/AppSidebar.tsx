"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ADMIN_LINKS, MAIN_LINKS } from "@/lib/links";
import { frontendUrls } from "@/lib/urls";
import { useAuthStore } from "@/zustand/auth.store";
import Link from "next/link";
import AuthSidebar from "../auth/AuthSidebar";
import ThemeToggle from "../theme-toggle/ThemeToggle";
import { buttonVariants } from "../ui/button";
import SidebarLink from "./link/SidebarLink";
import PublicLinks from "./public-links/PublicLinks";
import SavedLinks from "./saved-links/SavedLinks";

export function AppSidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-24 p-0 flex items-center border-b justify-center">
        <Link
          className={buttonVariants({
            className:
              "size-full! flex justify-center text-4xl! rounded-none items-center",
            variant: "ghost",
          })}
          href={frontendUrls.index}
        >
          Nomly
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <PublicLinks />
        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarMenu>
                {MAIN_LINKS.map(({ href, label }) => (
                  <SidebarLink key={href} href={href} label={label} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SavedLinks />
            <SidebarGroup>
              <SidebarMenu>
                {ADMIN_LINKS.map(({ href, label }) => (
                  <SidebarLink key={href} href={href} label={label} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="mt-auto py-4 border-t">
        <div className="flex justify-evenly gap-4">
          <ThemeToggle />
          <AuthSidebar />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
