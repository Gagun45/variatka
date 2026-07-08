"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { MAIN_LINKS } from "@/lib/links";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import AuthSidebar from "../auth/AuthSidebar";
import ThemeToggle from "../theme-toggle/ThemeToggle";
import { buttonVariants } from "../ui/button";
import SidebarLink from "./link/SidebarLink";
import PublicLinks from "./public-links/PublicLinks";
import SavedLinks from "./saved-links/SavedLinks";

export function AppSidebar() {
  const { isAdmin } = useAuth();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-24 p-0 flex items-center border-b justify-center">
        <Link
          className={buttonVariants({
            className:
              "size-full! p-0! border-none flex justify-center text-4xl! rounded-none items-center",
            variant: "ghost",
          })}
          href={frontendUrls.index}
        >
          <div className="relative size-full">
            <Image
              src={"/logo.png"}
              alt="Logo"
              sizes="256px"
              fill
              className="object-cover"
            />
          </div>
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
