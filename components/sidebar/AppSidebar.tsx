"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ADMIN_LINKS, MAIN_LINKS, PUBLIC_LINKS } from "@/lib/links";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";
import Auth from "../auth/Auth";
import ThemeToggle from "../theme-toggle/ThemeToggle";
import { buttonVariants } from "../ui/button";
import SidebarLink from "./link/SidebarLink";
import SavedLinks from "./saved-links/SavedLinks";
import { useAuthStore } from "@/zustand/auth.store";

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
            <SidebarGroup className="mt-auto">
              <SidebarMenu>
                {ADMIN_LINKS.map(({ href, label }) => (
                  <SidebarLink key={href} href={href} label={label} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
        <SidebarGroup>
          <SidebarMenu>
            {PUBLIC_LINKS.map(({ href, label }) => (
              <SidebarLink key={href} href={href} label={label} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto py-4 border-t">
        <div className="flex justify-evenly gap-4">
          <ThemeToggle />
          <Auth />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
